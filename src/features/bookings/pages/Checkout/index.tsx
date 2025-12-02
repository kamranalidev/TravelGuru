import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Typography, Alert, CircularProgress } from "@mui/material";
import theme from "../../../../theme";
import { useNavigate, useLocation } from "react-router-dom";
import { StepperComponent, Header, ButtonComponent } from "../../../../components";
// COMMENTED OUT: Stripe Payment Imports
// import { StripePayment } from "../../../../components";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import { createPaymentIntent } from "../../../../services/paymentService";
import { supabase } from "../../../../supabaseClient";
import { useAuth } from "../../../../hooks/useAuth";
import "./index.css";

// COMMENTED OUT: Stripe Initialization
// Initialize Stripe - Replace with your publishable key
// const stripePromise = loadStripe(
//   import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
//     "pk_test_51QEXAMPLE_REPLACE_WITH_YOUR_KEY"
// );

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const bookingData = location.state;
  // const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // If no booking data, redirect back to home
  if (!bookingData) {
    navigate("/");
    return null;
  }

  const { trip, bookingDate, departureArrivalTime, selectedPackage, finalPrice, packageName } =
    bookingData;

  // COMMENTED OUT: Payment gateway initialization
  // useEffect(() => {
  //   const initializePayment = async () => {
  //     if (!session?.user) {
  //       setError("Please log in to complete your booking");
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // Create payment intent
  //       const result = await createPaymentIntent({
  //         amount: finalPrice,
  //         currency: "aed",
  //         metadata: {
  //           service_id: trip.id,
  //           package_id: selectedPackage?.id || null,
  //           user_id: session.user.id,
  //           booking_date: bookingDate,
  //         },
  //       });

  //       if (result.error || !result.clientSecret) {
  //         throw new Error(
  //           result.error || "Failed to initialize payment. Please try again."
  //         );
  //       }

  //       setClientSecret(result.clientSecret);
  //     } catch (err: any) {
  //       console.error("Error initializing payment:", err);
  //       setError(err.message || "Failed to initialize payment");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   initializePayment();
  // }, [session, finalPrice, trip.id, selectedPackage?.id, bookingDate]);

  // Simulate payment initialization - skip loading
  useEffect(() => {
    if (!session?.user) {
      setError("Please log in to complete your booking");
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [session]);

  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    if (!session?.user) {
      setError("User session not found");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Check for duplicate booking on the same day before creating
      const { data: existingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("booking_date", bookingDate);

      if (checkError) {
        console.error("Error checking for duplicate bookings:", checkError);
      } else if (existingBookings && existingBookings.length > 0) {
        setError("You already have a booking on this date. Please select a different date.");
        setIsProcessingPayment(false);
        return;
      }

      // Create booking after successful payment
      const bookingPayload: any = {
        service_id: trip.id,
        package_id: selectedPackage?.id || null,
        user_id: session.user.id,
        booking_date: bookingDate,
      };

      // Add departure/arrival time if it exists (for airport pickup services)
      if (departureArrivalTime) {
        bookingPayload.departure_arrival_time = departureArrivalTime;
      }

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert(bookingPayload)
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Navigate to payment confirmation with booking details
      navigate("/payment-confirmation", {
        state: {
          ...bookingData,
          bookingId: booking.id,
          paymentIntentId: paymentIntentId || "simulated_payment_" + Date.now(),
          booking,
        },
      });
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setError(
        "Failed to create booking. Please try again or contact support."
      );
      setIsProcessingPayment(false);
    }
  };

  // Simulate payment success
  const handleSimulatePayment = () => {
    handlePaymentSuccess("simulated_payment_" + Date.now());
  };

  // const handlePaymentError = (errorMessage: string) => {
  //   setError(errorMessage);
  //   setIsProcessingPayment(false);
  // };

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
        sx={{ 
          display: "flex", 
          gap: { xs: "16px", md: "20px" }, 
          padding: { xs: "12px", md: "20px" }, 
          flexWrap: "wrap",
          flexDirection: { xs: "column", md: "row" }
        }}
      >
        {/* Payment Form */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: { xs: "100%", md: "55%" },
            minHeight: { xs: "auto", md: "500px" },
            order: { xs: 2, md: 1 }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: { xs: "16px", md: "20px" },
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: { xs: "18px", md: "20px" },
              padding: { xs: "16px", md: "20px" },
            }}
          >
            Payment Information
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: { xs: "16px", md: "20px" } }}>
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

            {/* COMMENTED OUT: Stripe Payment Integration */}
            {/* {clientSecret && !isProcessingPayment && (
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
                  currency="aed"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  clientSecret={clientSecret}
                />
              </Elements>
            )} */}

            {/* Simulated Payment Button */}
            {!isProcessingPayment && (
              <Box sx={{ mt: 3 }}>
                <ButtonComponent
                  title="Confirm Booking (Simulated Payment)"
                  width="100%"
                  onClick={handleSimulatePayment}
                  bgColor="#FF621F"
                  style={{
                    padding: "14px",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 2,
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  Payment gateway is currently disabled. Click to simulate successful payment.
                </Typography>
              </Box>
            )}

            <Typography
              variant="body2"
              sx={{ color: "#666", mt: 3, fontSize: "0.875rem" }}
            >
              By continuing, you acknowledge and agree to TravelGuru's general
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
            position: { xs: "static", md: "sticky" },
            top: { md: "20px" },
            order: { xs: 1, md: 2 }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: { xs: "16px", md: "20px" },
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: { xs: "18px", md: "20px" },
              padding: { xs: "16px", md: "20px" },
            }}
          >
            Booking Summary
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: { xs: "16px", md: "20px" } }}>
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
            {departureArrivalTime && (
              <Typography className="textStyle" sx={{ marginBottom: "10px" }}>
                🕐 {departureArrivalTime}
              </Typography>
            )}
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
                <Typography className="textStyle" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>Base Price:</Typography>
                <Typography className="textStyle" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                  AED {Number(trip.default_price).toLocaleString()}
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
                  <Typography className="textStyle" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>Package Upgrade:</Typography>
                  <Typography className="textStyle" sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    AED {Number(selectedPackage.price).toLocaleString()}
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
                <Typography sx={{ fontWeight: "bold", fontSize: { xs: "16px", md: "18px" } }}>
                  Total:
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "18px", md: "20px" },
                    color: theme.palette.secondary.main,
                  }}
                >
                  AED {Number(finalPrice).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
