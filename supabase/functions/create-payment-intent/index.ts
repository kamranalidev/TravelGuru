import Stripe from "npm:stripe@16.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20",
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!stripe) {
    return new Response(
      JSON.stringify({
        error: "Stripe secret key not configured on the Edge Function",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.amount !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid request. 'amount' is required." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const amount = Math.max(0, Math.round(body.amount * 100));
    const currency = typeof body.currency === "string" ? body.currency : "usd";
    const metadata =
      typeof body.metadata === "object" && body.metadata !== null
        ? body.metadata
        : {};
    const description =
      typeof body.description === "string" ? body.description : undefined;
    const receiptEmail =
      typeof body.receiptEmail === "string" ? body.receiptEmail : undefined;

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      description,
      receipt_email: receiptEmail,
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create payment intent";

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

