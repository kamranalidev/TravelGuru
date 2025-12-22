import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Travel Guroo Payment Server is running",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, metadata, description, receiptEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be greater than 0.",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return res.status(500).json({
        error: "Server configuration error. Please contact support.",
      });
    }

    console.log("Creating payment intent:", {
      amount,
      currency: currency || "aed",
      metadata,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: currency || "aed",
      metadata: metadata || {},
      description: description || undefined,
      receipt_email: receiptEmail || undefined,
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

app.post("/api/create-booking-with-payment", async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      serviceId,
      serviceName,
      packageId,
      packageName,
      bookingDate,
      amount,
      currency,
      additionalDetails,
    } = req.body;

    if (!userId || !serviceId || !serviceName || !bookingDate || !amount) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    console.log("Creating booking for user:", userId);

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        service_id: serviceId,
        package_id: packageId || null,
        booking_date: bookingDate,
        total_price: amount,
        status: "pending",
        payment_status: "pending",
        additional_details: additionalDetails || {},
      })
      .select()
      .single();

    if (bookingError || !bookingData) {
      console.error("Error creating booking:", bookingError);
      return res.status(500).json({
        error: bookingError?.message || "Failed to create booking",
      });
    }

    console.log("Booking created:", bookingData.id);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "aed",
      metadata: {
        booking_id: bookingData.id.toString(),
        service_id: serviceId.toString(),
        service_name: serviceName,
        package_id: packageId ? packageId.toString() : "",
        package_name: packageName || "",
        user_id: userId,
        user_email: userEmail || "",
        booking_date: bookingDate,
      },
      description: `Booking for ${serviceName}${packageName ? ` - ${packageName}` : ""}`,
      receipt_email: userEmail || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq("id", bookingData.id);

    if (updateError) {
      console.error("Error updating booking with payment intent:", updateError);
    }

    res.json({
      bookingId: bookingData.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating booking with payment:", error);

    res.status(500).json({
      error: error.message || "Failed to create booking with payment",
    });
  }
});

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
      amount: paymentIntent.amount / 100, 
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

app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("STRIPE_WEBHOOK_SECRET not set, using test mode");
      event = JSON.parse(req.body.toString());
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

  console.log("Webhook received:", event.type);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "paid",
              status: "confirmed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId);

          if (error) {
            console.error("Error updating booking:", error);
          } else {
            console.log(`Booking ${bookingId} marked as paid`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);

        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId);

          if (error) {
            console.error("Error updating booking:", error);
          }
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        console.log("Payment canceled:", paymentIntent.id);

        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "canceled",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId);

          if (error) {
            console.error("Error updating booking:", error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
  }

  res.json({ received: true });
});

app.post("/api/send-booking-confirmation", async (req, res) => {
  try {
    const {
      to,
      bookingId,
      customerName,
      serviceName,
      location,
      bookingDate,
      packageName,
      totalAmount,
      paymentIntentId,
    } = req.body;

    if (!to || !bookingId || !serviceName || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields: to, bookingId, serviceName, totalAmount",
      });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email not configured. Skipping email send.");
      return res.status(200).json({
        success: true,
        message: "Email not configured, but booking was successful",
        skipped: true,
      });
    }

    const transporter = createEmailTransporter();

    const formattedDate = bookingDate
      ? new Date(bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Travel Guroo</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #FF621F 0%, #ff8533 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Booking Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Travel Guroo</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${customerName || "Valued Customer"},
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We're excited to confirm your booking! Your reservation has been successfully processed and payment has been received.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h2 style="color: #FF621F; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #FF621F;">Booking Details</h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; width: 40%;"><strong>Booking ID:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;"><strong>#${bookingId}</strong></td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Service:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;">${serviceName}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Location:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;">${location || "Dubai"}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Booking Date:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Package:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;">${packageName || "Standard"}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Total Amount:</strong></td>
                        <td style="color: #FF621F; font-size: 18px; font-weight: bold; padding: 8px 0;">US$ ${parseFloat(totalAmount).toFixed(2)}</td>
                      </tr>
                      ${paymentIntentId ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;"><strong>Payment ID:</strong></td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 0;">${paymentIntentId}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                <strong>What's Next?</strong>
              </p>
              <ul style="color: #333333; font-size: 14px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>You will receive a reminder email 24 hours before your booking date</li>
                <li>Please arrive at the meeting point 15 minutes before the scheduled time</li>
                <li>Keep this confirmation email for your records</li>
                <li>If you have any questions, feel free to contact our support team</li>
              </ul>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                We look forward to providing you with an unforgettable experience!
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 10px 0 0 0;">
                Best regards,<br>
                <strong>The Travel Guroo Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
              <p style="color: #666666; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Travel Guroo. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textTemplate = `
Booking Confirmation - Travel Guroo

Dear ${customerName || "Valued Customer"},

We're excited to confirm your booking! Your reservation has been successfully processed and payment has been received.

BOOKING DETAILS:
- Booking ID: #${bookingId}
- Service: ${serviceName}
- Location: ${location || "Dubai"}
- Booking Date: ${formattedDate}
- Package: ${packageName || "Standard"}
- Total Amount: US$ ${parseFloat(totalAmount).toFixed(2)}
${paymentIntentId ? `- Payment ID: ${paymentIntentId}` : ''}

WHAT'S NEXT?
- You will receive a reminder email 24 hours before your booking date
- Please arrive at the meeting point 15 minutes before the scheduled time
- Keep this confirmation email for your records
- If you have any questions, feel free to contact our support team

We look forward to providing you with an unforgettable experience!

Best regards,
The Travel Guroo Team

---
This is an automated confirmation email. Please do not reply to this email.
© ${new Date().getFullYear()} Travel Guroo. All rights reserved.
    `;

    const mailOptions = {
      from: `"Travel Guroo" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Booking Confirmation - ${serviceName} | Travel Guroo`,
      text: textTemplate,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Booking confirmation email sent:", info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Booking confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    res.status(500).json({
      error: "Failed to send confirmation email",
      message: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Travel Guroo Payment Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  WARNING: STRIPE_SECRET_KEY not set in environment variables");
    console.warn("   Payment intents will fail. Please set it in .env file");
  } else {
    console.log("✅ Stripe configured");
  }
});