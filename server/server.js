import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TravelGuru Payment Server is running" });
});

// Create Payment Intent endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be greater than 0.",
      });
    }

    // Validate Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return res.status(500).json({
        error: "Server configuration error. Please contact support.",
      });
    }

    console.log("Creating payment intent with:", {
      amount,
      currency: currency || "usd",
      metadata,
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || "usd",
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // Handle Stripe-specific errors
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        error: error.message || "Card error occurred",
      });
    }

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        error: error.message || "Invalid request",
      });
    }

    res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
});

// Retrieve Payment Intent endpoint (for checking status)
app.get("/api/payment-intent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    res.status(500).json({
      error: error.message || "Failed to retrieve payment intent",
    });
  }
});

// Webhook endpoint (for production - verify webhook signatures)
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("STRIPE_WEBHOOK_SECRET not set, skipping webhook verification");
      event = JSON.parse(req.body);
    } else {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment succeeded:", paymentIntent.id);
      // Here you would typically update your database
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("Payment failed:", failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TravelGuru Payment Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  WARNING: STRIPE_SECRET_KEY not set in environment variables");
    console.warn("   Payment intents will fail. Please set it in .env file");
  } else {
    console.log("✅ Stripe configured");
  }
});


