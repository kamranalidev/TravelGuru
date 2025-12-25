import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Webhooks are server-to-server; no CORS needed.

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // Supabase CLI blocks secrets prefixed with SUPABASE_. Use SERVICE_ROLE_KEY instead.
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!stripeSecretKey) return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  if (!webhookSecret) return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  if (!supabaseUrl) return new Response("Missing SUPABASE_URL", { status: 500 });
  if (!serviceRoleKey) return new Response("Missing SERVICE_ROLE_KEY", { status: 500 });

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
      webhookSecret
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
        const status = pi.status;
        const amount = pi.amount;
        const currency = pi.currency;

        // booking_id may be absent if you didn't set it in PI metadata
        const bookingId = pi.metadata?.booking_id
          ? Number(pi.metadata.booking_id)
          : null;

        // Map Stripe PI status -> your DB payment_status conventions
        const payment_status:
          | "succeeded"
          | "requires_payment_method"
          | "requires_confirmation"
          | "requires_action"
          | "processing"
          | "requires_capture"
          | "canceled" = status;

        // Prefer updating by booking_id (stable), fall back to payment_intent_id
        // Note: these columns must exist in `bookings` (payment_intent_id, payment_status, amount, currency)
        if (bookingId) {
          const { error } = await supabaseAdmin
            .from("bookings")
            .update({
              payment_intent_id: paymentIntentId,
              payment_status,
              amount,
              currency,
            })
            .eq("id", bookingId);

          if (error) throw error;
        } else {
          const { error } = await supabaseAdmin
            .from("bookings")
            .update({
              payment_status,
              amount,
              currency,
            })
            .eq("payment_intent_id", paymentIntentId);

          if (error) throw error;
        }

        return new Response(
          JSON.stringify({ received: true, type: event.type, bookingId }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ received: true, ignored: event.type }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
