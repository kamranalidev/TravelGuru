import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import theme from "../../../../theme.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { StepperComponent, Header } from "../../../../components/index.tsx";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { supabase } from "../../../../supabaseClient.ts";

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  if (!bookingData) {
    navigate("/");
    return null;
  }

  const { trip, bookingDate, selectedPackage, finalPrice, packageName } =
    bookingData;

  const handlePay = async () => {
    if (!stripe || !elements || loading) return;

    setLoading(true);
    setError(null);

    try {
      const session = (await supabase.auth.getSession()).data.session;

      const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as
        | string
        | undefined;
      if (!supabaseUrl) {
        throw new Error(
          "Missing VITE_REACT_APP_SUPABASE_URL. Check your .env configuration."
        );
      }

      const amountInFils = Math.round(finalPrice * 100); // AED → fils

      const res = await fetch(
        `${supabaseUrl}/functions/v1/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            amount: amountInFils,
            service_id: trip?.id,
            package_id: selectedPackage?.id ?? null,
            booking_date: bookingDate,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Create payment intent failed (${res.status}). ${text || ""}`.trim()
        );
      }

      const { clientSecret } = (await res.json()) as { clientSecret?: string };
      if (!clientSecret) {
        throw new Error("Missing clientSecret in response from server.");
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
        setLoading(false);
        return;
      }

      const paymentIntentId = result.paymentIntent?.id ?? null;
      const paymentStatus = result.paymentIntent?.status ?? null;

      if (!paymentIntentId) {
        throw new Error(
          "Payment succeeded but no payment intent id was returned."
        );
      }

      // Create booking immediately after successful payment
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("You must be logged in to complete booking.");

      const { data: created, error: insertError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          service_id: trip.id,
          booking_date: bookingDate,
          package_id: selectedPackage?.id ?? null,
          payment_intent_id: paymentIntentId,
          payment_status: paymentStatus,
          amount: amountInFils,
          currency: "aed",
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      setCreatedBookingId(created.id);
      setConfirmationOpen(true);
      setLoading(false);
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    navigate("/bookings", { replace: true });
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header hidePages />
      <StepperComponent activeStep={2} />

      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment successful</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1 }}>
            Your payment was processed successfully and your booking is
            confirmed.
          </Typography>
          {createdBookingId ? (
            <Typography color="text.secondary">
              Booking ID: <strong>{createdBookingId}</strong>
            </Typography>
          ) : null}
          <Typography sx={{ mt: 2 }}>
            You can view your confirmed booking in your Profile.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} variant="contained">
            View Bookings
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        className="centerSection"
        sx={{ display: "flex", gap: "20px", padding: "20px", flexWrap: "wrap" }}
      >
        {/* PAYMENT SECTION */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: { xs: "100%", md: "55%" },
            minHeight: "300px",
          }}
        >
          <Typography
            sx={{
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
            <Box sx={{ mb: 3 }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#000",
                      "::placeholder": { color: "#999" },
                    },
                  },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!stripe || loading}
              onClick={handlePay}
            >
              {loading ? "Processing..." : `Pay AED ${finalPrice.toFixed(2)}`}
            </Button>

            <Typography
              variant="body2"
              sx={{ color: "#666", mt: 3, fontSize: "0.875rem" }}
            >
              By continuing, you acknowledge and agree to Travel Guroo's general
              terms and conditions, privacy policy, and cancellation policy.
            </Typography>
          </Box>
        </Box>

        {/* SUMMARY SECTION */}
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
            sx={{
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
            <Typography sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              {trip.name}
            </Typography>
            <Typography sx={{ marginBottom: "5px" }}>
              📍 {trip.location}
            </Typography>
            <Typography sx={{ marginBottom: "10px" }}>
              📅 {bookingDate}
            </Typography>
            <Typography sx={{ marginBottom: "10px" }}>
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
                <Typography>Base Price:</Typography>
                <Typography>AED {trip.default_price}</Typography>
              </Box>

              {selectedPackage && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <Typography>Package Upgrade:</Typography>
                  <Typography>AED {selectedPackage.price}</Typography>
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
                  AED {finalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
