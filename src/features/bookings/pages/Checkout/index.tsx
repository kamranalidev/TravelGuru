import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Typography, Alert, CircularProgress } from "@mui/material";
import theme from "../../../../theme";
import { useNavigate, useLocation } from "react-router-dom";
import { StepperComponent, Header, StripePayment } from "../../../../components";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../../../../services/paymentService";
import { sendBookingConfirmationEmail } from "../../../../services/emailService";
import { supabase } from "../../../../supabaseClient";
import { useAuth } from "../../../../hooks/useAuth";
import "./index.css";

// Initialize Stripe - Replace with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51QEXAMPLE_REPLACE_WITH_YOUR_KEY"
);

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const bookingData = location.state;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // If no booking data, redirect back to home
  if (!bookingData) {
    navigate("/");
    return null;
  }

  const { trip, bookingDate, selectedPackage, finalPrice, packageName } =
    bookingData;

  useEffect(() => {
    const initializePayment = async () => {
      if (!session?.user) {
        setError("Please log in to complete your booking");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create payment intent
        const result = await createPaymentIntent({
          amount: finalPrice,
          currency: "usd",
          metadata: {
            service_id: trip.id,
            package_id: selectedPackage?.id || null,
            user_id: session.user.id,
            booking_date: bookingDate,
          },
        });

        if (result.error || !result.clientSecret) {
          throw new Error(
            result.error || "Failed to initialize payment. Please try again."
          );
        }

        setClientSecret(result.clientSecret);
      } catch (err: any) {
        console.error("Error initializing payment:", err);
        setError(err.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [session, finalPrice, trip.id, selectedPackage?.id, bookingDate]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!session?.user) {
      setError("User session not found");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Create booking after successful payment
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          service_id: trip.id,
          package_id: selectedPackage?.id || null,
          user_id: session.user.id,
          booking_date: bookingDate,
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Send booking confirmation email
      const userEmail = session.user.email || profile?.email;
      const userName = 
        profile?.full_name || 
        session.user.user_metadata?.full_name || 
        session.user.user_metadata?.name ||
        "Valued Customer";

      if (userEmail) {
        try {
          await sendBookingConfirmationEmail({
            to: userEmail,
            bookingId: booking.id,
            customerName: userName,
            serviceName: trip.name || trip.service_name || "Dubai Experience",
            location: trip.location || "Dubai",
            bookingDate: bookingDate,
            packageName: packageName || selectedPackage?.name || "Standard",
            totalAmount: finalPrice,
            paymentIntentId: paymentIntentId,
          });
          console.log("Booking confirmation email sent successfully");
        } catch (emailError) {
          // Log error but don't block navigation - email failure shouldn't break booking
          console.error("Failed to send confirmation email:", emailError);
        }
      } else {
        console.warn("User email not found, skipping confirmation email");
      }

      // Navigate to payment confirmation with booking details
      navigate("/payment-confirmation", {
        state: {
          ...bookingData,
          bookingId: booking.id,
          paymentIntentId,
          booking,
        },
      });
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setError(
        "Payment successful but failed to create booking. Please contact support with payment ID: " +
          paymentIntentId
      );
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessingPayment(false);
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Header hidePages={true} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ color: "#FF621F", mb: 2 }} />
            <Typography>Initializing payment...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={2} />
      <Box
        className="centerSection"
        sx={{ display: "flex", gap: "20px", padding: "20px", flexWrap: "wrap" }}
      >
        {/* Payment Form */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: { xs: "100%", md: "55%" },
            minHeight: "500px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: "20px",
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: "20px",
              padding: "20px",
            }}
          >
            Payment Information
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: "20px" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {isProcessingPayment && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress sx={{ color: "#FF621F", mb: 2 }} />
                <Typography>Processing your booking...</Typography>
              </Box>
            )}

            {clientSecret && !isProcessingPayment && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#FF621F",
                      colorBackground: "#ffffff",
                      colorText: "#1a1a1a",
                      colorDanger: "#df1b41",
                      fontFamily: "system-ui, sans-serif",
                      spacingUnit: "4px",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <StripePayment
                  amount={finalPrice}
                  currency="usd"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  clientSecret={clientSecret}
                />
              </Elements>
            )}

            <Typography
              variant="body2"
              sx={{ color: "#666", mt: 3, fontSize: "0.875rem" }}
            >
              By continuing, you acknowledge and agree to Travel Guroo's general
              terms and conditions, privacy policy, and cancellation policy.
            </Typography>
          </Box>
        </Box>

        {/* Booking Summary */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: { xs: "100%", md: "40%" },
            height: "fit-content",
            position: { md: "sticky" },
            top: { md: "20px" },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: "20px",
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: "20px",
              padding: "20px",
            }}
          >
            Booking Summary
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: "20px" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "10px" }}
            >
              {trip.name}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "5px" }}>
              📍 {trip.location}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "10px" }}>
              📅 {bookingDate}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "10px" }}>
              📦 {packageName}
            </Typography>
            <Box
              sx={{
                borderTop: "1px solid #e6e6e6",
                marginTop: "15px",
                paddingTop: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <Typography className="textStyle">Base Price:</Typography>
                <Typography className="textStyle">
                  ${trip.default_price}
                </Typography>
              </Box>
              {selectedPackage && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <Typography className="textStyle">Package Upgrade:</Typography>
                  <Typography className="textStyle">
                    ${selectedPackage.price}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "2px solid #e6e6e6",
                }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                  Total:
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: theme.palette.secondary.main,
                  }}
                >
                  ${finalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
