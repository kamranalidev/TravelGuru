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
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../../../store/features/cart/cartSlice";
import type { AppDispatch, RootState } from "../../../../store/store";
import {
  clearServerCart,
  ensureActiveServerCart,
} from "../../../../store/features/serverCart/serverCartSlice";
import { sendBookingConfirmationEmail } from "../../../../services/emailService";
import "./index.css";

const normalizeTime = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t) return null;
  if (t.toLowerCase() === "null") return null;
  return t;
};

const sanitizeNullableTime = (value: unknown): string | null => {
  const t = normalizeTime(value);
  // Guard against callers accidentally passing the literal string "null".
  if (t == null) return null;
  return t.toLowerCase() === "null" ? null : t;
};

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as any;

  const stripe = useStripe();
  const elements = useElements();

  const dispatch = useDispatch<AppDispatch>();
  const serverCartId = useSelector((s: RootState) => s.serverCart.cartId);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdBookingIds, setCreatedBookingIds] = useState<number[]>([]);

  if (!bookingData) {
    navigate("/");
    return null;
  }

  // All bookings must go through cart checkout.
  // (cart-only flow)

  // Cart payload
  const cartItems = (bookingData?.cartItems as any[]) ?? [];
  const cartFinalPrice = Number(bookingData?.finalPrice ?? 0);

  const handlePay = async () => {
    if (!stripe || !elements || loading) return;

    setLoading(true);
    setError(null);

    try {
      const session = (await supabase.auth.getSession()).data.session;

      console.log("[Checkout] mode:", "cart");
      console.log("[Checkout] bookingData (raw state):", {
        ...bookingData,
        clientSecret: undefined,
      });

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("Cart is empty.");
      }

      const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as
        | string
        | undefined;
      if (!supabaseUrl) {
        throw new Error(
          "Missing VITE_REACT_APP_SUPABASE_URL. Check your .env configuration.",
        );
      }

      const amountMajor = cartFinalPrice;
      if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
        throw new Error("Invalid amount.");
      }
      const amountInFils = Math.round(amountMajor * 100); // AED → fils

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
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // Parse error message for user-friendly display
        let errorMessage = "Payment setup failed. Please try again.";
        if (res.status === 401 || res.status === 403) {
          errorMessage = "Session expired. Please log in again and retry.";
        } else if (res.status >= 500) {
          errorMessage = "Server error. Please try again in a few moments.";
        } else if (text.includes("Stripe")) {
          errorMessage =
            "Payment service temporarily unavailable. Please try again.";
        } else if (text) {
          errorMessage = `Payment setup failed: ${text}`;
        }
        throw new Error(errorMessage);
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
        // Map Stripe error codes to user-friendly messages
        const errorCode = result.error.code;
        const errorType = result.error.type;
        let userFriendlyMessage = result.error.message ?? "Payment failed";

        // Map common Stripe errors to clearer messages
        if (errorCode === "card_declined") {
          userFriendlyMessage =
            "Your card was declined. Please try a different card or contact your bank.";
        } else if (errorCode === "insufficient_funds") {
          userFriendlyMessage =
            "Insufficient funds. Please try a different payment method.";
        } else if (errorCode === "expired_card") {
          userFriendlyMessage =
            "Your card has expired. Please use a different card.";
        } else if (errorCode === "incorrect_cvc") {
          userFriendlyMessage =
            "Incorrect security code (CVC). Please check and try again.";
        } else if (errorCode === "processing_error") {
          userFriendlyMessage =
            "A processing error occurred. Please try again in a moment.";
        } else if (errorType === "validation_error") {
          userFriendlyMessage = "Please check your card details and try again.";
        } else if (errorCode === "payment_intent_authentication_failure") {
          userFriendlyMessage =
            "Card authentication failed. Please try again or use a different card.";
        }

        setError(userFriendlyMessage);
        setLoading(false);
        return;
      }

      const paymentIntentId = result.paymentIntent?.id ?? null;
      const paymentStatus = result.paymentIntent?.status ?? null;

      if (!paymentIntentId) {
        throw new Error(
          "Payment succeeded but no payment intent id was returned.",
        );
      }

      // Create booking(s) immediately after successful payment
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("You must be logged in to complete booking.");

      const createdIds: number[] = [];

      for (const it of cartItems) {
        const serviceId = Number(it.serviceId);
        const bDate = String(it.bookingDate);

        // IMPORTANT: never allow the literal string "null" through to Postgres time
        const safeTime = sanitizeNullableTime(it.bookingTime);

        console.log("[Checkout] cart item time normalize:", {
          raw: it.bookingTime,
          sanitized: safeTime,
          typeOfRaw: typeof it.bookingTime,
          isRawStringNull:
            typeof it.bookingTime === "string" &&
            it.bookingTime.trim().toLowerCase() === "null",
        });

        const packageId = it.packageId ?? null;
        const unitPriceMajor = Number(it.unitPrice ?? 0);
        const unitAmountInFils = Math.round(unitPriceMajor * 100);

        console.log("[Checkout] cart item (raw):", it);

        // Prevent duplicates: same user + same service + same date + same time
        console.log("[Checkout] duplicate-check query params:", {
          user_id: user.id,
          service_id: serviceId,
          booking_date: bDate,
          departure_arrival_time: safeTime,
        });

        let existingQuery = supabase
          .from("bookings")
          .select("id")
          .eq("user_id", user.id)
          .eq("service_id", serviceId)
          .eq("booking_date", bDate);

        // Supabase needs `.is(column, null)` for NULL filters; `.eq(column, null)` becomes `eq.null`
        existingQuery =
          safeTime == null
            ? existingQuery.is("departure_arrival_time", null)
            : existingQuery.eq("departure_arrival_time", safeTime);

        const { data: existing, error: existsError } =
          await existingQuery.limit(1);

        if (existsError) throw new Error(existsError.message);
        if (existing && existing.length > 0) {
          throw new Error(
            `Duplicate booking detected: service ${serviceId} on ${bDate} ${
              safeTime ?? ""
            }`.trim(),
          );
        }

        const airportType = it.airportType ?? null;
        const address = it.address ?? null;

        const insertPayload = {
          user_id: user.id,
          service_id: serviceId,
          booking_date: bDate,
          package_id: packageId,
          payment_intent_id: paymentIntentId,
          payment_status: paymentStatus,
          amount: unitAmountInFils,
          currency: "aed",
          departure_arrival_time: safeTime,
          ...(airportType ? { type: airportType } : {}),
          ...(airportType === "dropoff" && address ? { address } : {}),
        };

        console.log(
          "[Checkout] bookings.insert payload (cart item):",
          insertPayload,
        );

        const { data: created, error: insertError } = await supabase
          .from("bookings")
          .insert(insertPayload)
          .select("id")
          .single();

        if (insertError) throw new Error(insertError.message);
        createdIds.push(created.id);
      }

      setCreatedBookingIds(createdIds);
      dispatch(clearCart());
      if (user?.id) {
        try {
          const cartId =
            serverCartId ??
            (await dispatch(ensureActiveServerCart(user.id)).unwrap());
          await dispatch(clearServerCart(cartId)).unwrap();
        } catch (clearError) {
          console.warn(
            "Failed to clear server cart after payment:",
            clearError,
          );
        }
      }

      // Send confirmation emails for each booking
      for (const bookingId of createdIds) {
        try {
          await sendBookingConfirmationEmail({ bookingId });
          console.log(
            `[Checkout] Confirmation email sent for booking #${bookingId}`,
          );
        } catch (emailError) {
          // Log error but don't block the flow
          console.error(
            `[Checkout] Failed to send email for booking #${bookingId}:`,
            emailError,
          );
        }
      }

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
          {createdBookingIds.length > 0 ? (
            <Typography color="text.secondary">
              Booking IDs: <strong>{createdBookingIds.join(", ")}</strong>
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
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                className="payment-error-alert"
                onClose={() => setError(null)}
              >
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
              {loading
                ? "Processing..."
                : `Pay AED ${cartFinalPrice.toFixed(2)}`}
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
              {cartItems.length} item(s)
            </Typography>
            {cartItems.map((it) => (
              <Box
                key={`${it.serviceId}-${it.bookingDate}-${
                  it.bookingTime ?? ""
                }`}
                sx={{
                  mb: 2,
                  pb: 1.5,
                  borderBottom: "1px solid #f0f0f0",
                  "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>
                  {it.serviceName ?? `Service #${it.serviceId}`}
                </Typography>
                {it.location && (
                  <Typography
                    sx={{ color: "#666", fontSize: "0.9rem", mb: 0.25 }}
                  >
                    📍 {it.location}
                  </Typography>
                )}
                <Typography
                  sx={{ color: "#666", fontSize: "0.9rem", mb: 0.25 }}
                >
                  📅 {it.bookingDate}
                  {it.bookingTime ? ` • 🕒 ${it.bookingTime}` : ""}
                </Typography>
                {it.airportType && (
                  <Typography
                    sx={{ color: "#666", fontSize: "0.9rem", mb: 0.25 }}
                  >
                    🚗{" "}
                    {it.airportType === "pickup"
                      ? "Airport Pickup"
                      : it.airportType === "dropoff"
                        ? "Airport Drop-off"
                        : it.airportType}
                  </Typography>
                )}
                {it.airportType === "dropoff" && it.address && (
                  <Typography
                    sx={{ color: "#666", fontSize: "0.85rem", mb: 0.25 }}
                  >
                    🏠 {it.address}
                  </Typography>
                )}
                {it.packageName && (
                  <Typography
                    sx={{ color: "#666", fontSize: "0.9rem", mb: 0.25 }}
                  >
                    📦 {it.packageName}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#FF621F",
                    fontSize: "0.95rem",
                    mt: 0.5,
                  }}
                >
                  AED {Number(it.unitPrice ?? 0).toFixed(2)}
                </Typography>
              </Box>
            ))}

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
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "2px solid #e6e6e6",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Total:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  AED {cartFinalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
