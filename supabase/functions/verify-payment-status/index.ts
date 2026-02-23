// @ts-nocheck - Deno runtime types
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================================
// VERIFY PAYMENT STATUS
// Checks payment status from both Stripe and our payment_logs
// ============================================================================

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    let paymentIntentId: string | undefined;
    let transactionRef: string | undefined;

    try {
      const body = await req.json();
      paymentIntentId = body.paymentIntentId;
      transactionRef = body.transactionRef;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!paymentIntentId && !transactionRef) {
      return new Response(
        JSON.stringify({ error: "Provide paymentIntentId or transactionRef" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result: {
      found: boolean;
      status?: string;
      stripeStatus?: string;
      amount?: number;
      currency?: string;
      transactionRef?: string;
      bookingId?: number;
      message: string;
    } = {
      found: false,
      message: "Payment not found",
    };

    // Check our payment_logs first
    if (transactionRef) {
      const { data: log, error: logError } = await supabase
        .from("payment_logs")
        .select("*")
        .eq("transaction_ref", transactionRef)
        .eq("user_id", user.id)
        .single();

      if (!logError && log) {
        result.found = true;
        result.status = log.status;
        result.amount = log.amount;
        result.currency = log.currency;
        result.transactionRef = log.transaction_ref;
        result.bookingId = log.booking_id;
        result.message = getStatusMessage(log.status);
      }
    }

    // Check Stripe directly if we have a payment intent ID
    if (paymentIntentId) {
      const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

      try {
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);

        // Verify this belongs to the user
        if (paymentIntent.metadata?.user_id === user.id) {
          result.found = true;
          result.stripeStatus = paymentIntent.status;
          result.amount = paymentIntent.amount / 100; // Convert from fils to AED
          result.currency = paymentIntent.currency.toUpperCase();
          result.message = getStripeStatusMessage(paymentIntent.status);
        }
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        // Don't fail - we might have info from payment_logs
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Status message helpers
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    initiated: "Payment has been initiated. Processing will begin shortly.",
    validating: "Validating your payment details...",
    processing: "Your payment is being processed. Please wait...",
    awaiting_confirmation:
      "Payment received. Awaiting confirmation from your bank.",
    completed: "Payment successful! Your booking is confirmed.",
    failed: "Payment failed. No charges were made to your account.",
    refunded: "Payment has been refunded to your original payment method.",
    partially_refunded:
      "Partial refund processed to your original payment method.",
    cancelled: "Payment was cancelled. No charges were made.",
    timeout: "Payment timed out. No charges were made. Please try again.",
    requires_action:
      "Additional verification required. Please complete the authentication.",
    on_hold: "Payment is on hold pending verification.",
    under_review:
      "Payment is under security review. You will be notified shortly.",
  };
  return messages[status] || "Unknown status. Please contact support.";
}

function getStripeStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    succeeded: "Payment successful! Your booking is confirmed.",
    processing: "Your payment is being processed.",
    requires_payment_method: "Payment requires a valid payment method.",
    requires_confirmation: "Payment requires confirmation.",
    requires_action: "Additional authentication required.",
    requires_capture: "Payment authorized. Awaiting capture.",
    canceled: "Payment was cancelled.",
  };
  return messages[status] || "Unknown payment status.";
}
