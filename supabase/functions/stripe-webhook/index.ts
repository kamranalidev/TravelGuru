// @ts-nocheck - Deno runtime types
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// STRIPE WEBHOOK HANDLER
// Handles payment events and logs to payment_logs for full audit trail
// ============================================================================

// Generate transaction reference for tracking
const generateTransactionRef = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  let hash = 0;
  const input = timestamp + randomPart;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const checksum = Math.abs(hash).toString(36).substring(0, 4);
  return `TXN-${timestamp}-${randomPart}-${checksum}`.toUpperCase();
};

// Map Stripe status to our payment_logs status
const mapStripeStatus = (stripeStatus: string, eventType: string): string => {
  if (eventType === "payment_intent.succeeded") return "completed";
  if (eventType === "payment_intent.payment_failed") return "failed";
  if (eventType === "payment_intent.canceled") return "cancelled";

  const statusMap: Record<string, string> = {
    succeeded: "completed",
    requires_payment_method: "failed",
    requires_confirmation: "awaiting_confirmation",
    requires_action: "requires_action",
    processing: "processing",
    requires_capture: "on_hold",
    canceled: "cancelled",
  };
  return statusMap[stripeStatus] || "processing";
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // Supabase CLI blocks secrets prefixed with SUPABASE_. Use SERVICE_ROLE_KEY instead.
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!stripeSecretKey)
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  if (!webhookSecret)
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  if (!supabaseUrl)
    return new Response("Missing SUPABASE_URL", { status: 500 });
  if (!serviceRoleKey)
    return new Response("Missing SERVICE_ROLE_KEY", { status: 500 });

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  // Stripe requires verifying against the *raw* request body.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = pi.id;
        const stripeStatus = pi.status;
        const amount = pi.amount;
        const currency = pi.currency;
        const userId = pi.metadata?.user_id || null;

        // booking_id may be absent if you didn't set it in PI metadata
        const bookingId = pi.metadata?.booking_id
          ? Number(pi.metadata.booking_id)
          : null;

        // Map status for our systems
        const payment_status = stripeStatus as
          | "succeeded"
          | "requires_payment_method"
          | "requires_confirmation"
          | "requires_action"
          | "processing"
          | "requires_capture"
          | "canceled";

        const logStatus = mapStripeStatus(stripeStatus, event.type);

        // Generate transaction reference for audit trail
        const transactionRef =
          pi.metadata?.transaction_ref || generateTransactionRef();

        // ============================================================
        // LOG TO PAYMENT_LOGS TABLE (AUDIT TRAIL)
        // ============================================================
        if (userId) {
          // Check if we already have a log for this payment intent
          const { data: existingLog } = await supabaseAdmin
            .from("payment_logs")
            .select("id, transaction_ref")
            .eq("metadata->>payment_intent_id", paymentIntentId)
            .limit(1);

          if (existingLog && existingLog.length > 0) {
            // Update existing log
            await supabaseAdmin
              .from("payment_logs")
              .update({
                status: logStatus,
                booking_id: bookingId,
                metadata: {
                  payment_intent_id: paymentIntentId,
                  stripe_status: stripeStatus,
                  event_type: event.type,
                  updated_at: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingLog[0].id);
          } else {
            // Insert new log
            await supabaseAdmin.from("payment_logs").insert({
              transaction_ref: transactionRef,
              user_id: userId,
              booking_id: bookingId,
              amount: amount / 100, // Convert from fils to AED
              currency: currency.toUpperCase(),
              status: logStatus,
              metadata: {
                payment_intent_id: paymentIntentId,
                stripe_status: stripeStatus,
                event_type: event.type,
                service_id: pi.metadata?.service_id || null,
                package_id: pi.metadata?.package_id || null,
                booking_date: pi.metadata?.booking_date || null,
              },
            });
          }
        }

        // ============================================================
        // UPDATE BOOKINGS TABLE
        // ============================================================
        // Prefer updating by booking_id (stable), fall back to payment_intent_id
        if (bookingId) {
          const { error } = await supabaseAdmin
            .from("bookings")
            .update({
              payment_intent_id: paymentIntentId,
              payment_status,
              amount,
              currency,
              payment_gateway_ref: paymentIntentId,
              payment_ref: transactionRef,
            })
            .eq("id", bookingId);

          if (error) {
            console.error("Error updating booking by ID:", error);
            throw error;
          }
        } else {
          const { error } = await supabaseAdmin
            .from("bookings")
            .update({
              payment_status,
              amount,
              currency,
              payment_gateway_ref: paymentIntentId,
            })
            .eq("payment_intent_id", paymentIntentId);

          if (error) {
            console.error(
              "Error updating booking by payment_intent_id:",
              error,
            );
            throw error;
          }
        }

        // Log critical errors for failed payments
        if (event.type === "payment_intent.payment_failed" && userId) {
          await supabaseAdmin.from("critical_error_logs").insert({
            error_type: "PAYMENT_FAILED",
            severity: "MEDIUM",
            transaction_ref: transactionRef,
            user_id: userId,
            error_message: `Payment failed: ${pi.last_payment_error?.message || "Unknown error"}`,
            error_data: {
              payment_intent_id: paymentIntentId,
              decline_code: pi.last_payment_error?.decline_code,
              error_code: pi.last_payment_error?.code,
              amount: amount / 100,
              currency,
            },
            requires_manual_intervention: false,
          });
        }

        return new Response(
          JSON.stringify({
            received: true,
            type: event.type,
            bookingId,
            transactionRef,
            status: logStatus,
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Handle refunds
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        const refundAmount = charge.amount_refunded;
        const isFullRefund = charge.refunded;

        // Update payment log
        const { data: existingLog } = await supabaseAdmin
          .from("payment_logs")
          .select("id")
          .eq("metadata->>payment_intent_id", paymentIntentId)
          .limit(1);

        if (existingLog && existingLog.length > 0) {
          await supabaseAdmin
            .from("payment_logs")
            .update({
              status: isFullRefund ? "refunded" : "partially_refunded",
              metadata: {
                payment_intent_id: paymentIntentId,
                refund_amount: refundAmount / 100,
                is_full_refund: isFullRefund,
                refunded_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingLog[0].id);
        }

        return new Response(
          JSON.stringify({ received: true, type: event.type, refundAmount }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ received: true, ignored: event.type }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
    }
  } catch (err) {
    console.error("Webhook handler error:", err);

    // Log critical error
    await supabaseAdmin.from("critical_error_logs").insert({
      error_type: "WEBHOOK_ERROR",
      severity: "HIGH",
      error_message: err instanceof Error ? err.message : String(err),
      error_data: {
        event_type: event.type,
        event_id: event.id,
      },
      requires_manual_intervention: true,
    });

    return new Response("Webhook handler error", { status: 500 });
  }
});
