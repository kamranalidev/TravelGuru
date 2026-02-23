import Box from "@mui/material/Box";
import {
  Typography,
  Chip,
  Stack,
  Collapse,
  LinearProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import theme from "../../../../theme.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { StepperComponent, Header } from "../../../../components/index.tsx";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { supabase } from "../../../../supabaseClient.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  calculateTotalFromParticipants,
} from "../../../../store/features/cart/cartSlice";
import type { AppDispatch, RootState } from "../../../../store/store";
import {
  clearServerCart,
  ensureActiveServerCart,
} from "../../../../store/features/serverCart/serverCartSlice";
import { sendBookingConfirmationEmail } from "../../../../services/emailService";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  if (t == null) return null;
  return t.toLowerCase() === "null" ? null : t;
};

const PAYMENT_STEPS = [
  "Validating cart",
  "Creating payment intent",
  "Processing payment",
  "Confirming booking",
  "Sending confirmation",
];
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
  const [paymentStep, setPaymentStep] = useState(0);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  if (!bookingData) {
    navigate("/");
    return null;
  }
  const cartItems = (bookingData?.cartItems as any[]) ?? [];
  const cartFinalPrice = Number(bookingData?.finalPrice ?? 0);
  const logPaymentError = (
    stage: string,
    err: unknown,
    context?: Record<string, unknown>,
  ) => {
    const timestamp = new Date().toISOString();
    const errorDetails = {
      timestamp,
      stage,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      code: (err as any)?.code,
      type: (err as any)?.type,
      decline_code: (err as any)?.decline_code,
      ...context,
    };
    return errorDetails;
  };
  const handlePay = async () => {
    if (!stripe || !elements || loading) return;
    setLoading(true);
    setError(null);
    setPaymentStep(0);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error(
          "Your cart is empty. Please add items before checkout.",
        );
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Payment form not loaded. Please refresh the page.");
      }

      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        throw new Error("Please log in to complete your booking.");
      }
      for (const it of cartItems) {
        const serviceId = Number(it.serviceId);
        const bDate = String(it.bookingDate);
        const safeTime = sanitizeNullableTime(it.bookingTime);
        let existingQuery = supabase
          .from("bookings")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("service_id", serviceId)
          .eq("booking_date", bDate);
        existingQuery =
          safeTime == null
            ? existingQuery.is("departure_arrival_time", null)
            : existingQuery.eq("departure_arrival_time", safeTime);
        const { data: existing, error: existsError } =
          await existingQuery.limit(1);
        if (existsError) {
          logPaymentError("duplicate-check", existsError, { serviceId, bDate });
          throw new Error("Unable to verify booking. Please try again.");
        }
        if (existing && existing.length > 0) {
          const serviceName = it.serviceName || `Service #${serviceId}`;
          throw new Error(
            `You already have a booking for "${serviceName}" on ${bDate}. Please remove it from your cart or choose a different date.`,
          );
        }
      }
      // Step 1: Create payment intent
      setPaymentStep(1);
      const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as
        | string
        | undefined;
      if (!supabaseUrl) {
        throw new Error(
          "Payment service not configured. Please contact support.",
        );
      }
      const amountMajor = cartFinalPrice;
      if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
        throw new Error("Invalid payment amount. Please review your cart.");
      }
      const amountInFils = Math.round(amountMajor * 100);
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
          body: JSON.stringify({ amount: amountInFils }),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        logPaymentError("create-payment-intent", new Error(text), {
          status: res.status,
          statusText: res.statusText,
        });
        let errorMessage = "Payment setup failed. Please try again.";
        if (res.status === 401 || res.status === 403) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (res.status >= 500) {
          errorMessage =
            "Our payment server is temporarily unavailable. Please try again in a few moments.";
        } else if (text.includes("Stripe")) {
          errorMessage =
            "Payment service temporarily unavailable. Please try again shortly.";
        }
        throw new Error(errorMessage);
      }
      const { clientSecret } = (await res.json()) as {
        clientSecret?: string;
      };
      if (!clientSecret) {
        logPaymentError(
          "create-payment-intent",
          new Error("Missing clientSecret"),
        );
        throw new Error("Payment initialization failed. Please try again.");
      }
      // Step 2: Process payment
      setPaymentStep(2);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (result.error) {
        logPaymentError("confirm-card-payment", result.error, {
          code: result.error.code,
          type: result.error.type,
          decline_code: result.error.decline_code,
          param: result.error.param,
        });
        const errorCode = result.error.code;
        const errorType = result.error.type;
        let userFriendlyMessage = result.error.message ?? "Payment failed";
        const errorMap: Record<string, string> = {
          card_declined:
            "Your card was declined. Please try a different card or contact your bank.",
          insufficient_funds:
            "Insufficient funds. Please try a different payment method.",
          expired_card: "Your card has expired. Please use a valid card.",
          incorrect_cvc:
            "The security code (CVC) is incorrect. Please check and try again.",
          incorrect_number:
            "The card number is incorrect. Please check and try again.",
          processing_error:
            "A processing error occurred. Please wait a moment and try again.",
          payment_intent_authentication_failure:
            "Card authentication failed. Please try again or use a different card.",
          rate_limit: "Too many attempts. Please wait a few minutes.",
        };
        if (errorCode && errorMap[errorCode]) {
          userFriendlyMessage = errorMap[errorCode];
        } else if (errorType === "validation_error") {
          userFriendlyMessage = "Please check your card details and try again.";
        }
        setError(userFriendlyMessage);
        setLoading(false);
        return;
      }
      const paymentIntentId = result.paymentIntent?.id ?? null;
      const paymentStatus = result.paymentIntent?.status ?? null;
      if (!paymentIntentId) {
        throw new Error(
          "Payment succeeded but confirmation failed. Please contact support.",
        );
      }
      // Step 3: Create bookings
      setPaymentStep(3);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        logPaymentError("get-user", userError);
        throw new Error(
          "Authentication error. Your payment was processed — please contact support.",
        );
      }
      if (!user) {
        throw new Error(
          "Session expired. Your payment was processed — please contact support.",
        );
      }
      const createdIds: number[] = [];
      for (const it of cartItems) {
        const serviceId = Number(it.serviceId);
        const bDate = String(it.bookingDate);
        const safeTime = sanitizeNullableTime(it.bookingTime);
        const packageId = it.packageId ?? null;
        const unitPriceMajor = Number(it.unitPrice ?? 0);
        // Calculate total amount based on participants (adults, children, infants) + transfer price
        const totalPriceMajor = calculateTotalFromParticipants(it);
        const totalAmountInFils = Math.round(totalPriceMajor * 100);
        // Duplicate check already done before payment - no need to repeat
        const airportType = it.airportType ?? null;
        const address = it.address ?? null;

        // Transfer/pickup fields
        const transferType =
          it.transferType && it.transferType !== "none"
            ? it.transferType
            : null;
        const transferPrice = transferType
          ? Number(it.transferPrice ?? 0)
          : null;
        const selectedTime = sanitizeNullableTime(it.selectedTime);

        const insertPayload = {
          user_id: user.id,
          service_id: serviceId,
          booking_date: bDate,
          package_id: packageId,
          payment_intent_id: paymentIntentId,
          payment_status: paymentStatus,
          amount: totalAmountInFils,
          currency: "aed",
          departure_arrival_time: safeTime,
          // Participant information
          adults: it.participants?.adults ?? 1,
          children: it.participants?.children ?? 0,
          infants: it.participants?.infants ?? 0,
          // Participant pricing
          adult_price: it.participantPricing?.adultPrice ?? unitPriceMajor,
          child_price: it.participantPricing?.childPrice ?? null,
          infant_price: it.participantPricing?.infantPrice ?? null,
          ...(airportType ? { type: airportType } : {}),
          ...(airportType === "dropoff" && address ? { address } : {}),
          // Transfer/pickup and time selection
          ...(transferType ? { transfer_type: transferType } : {}),
          ...(transferPrice != null && transferType
            ? { transfer_price: transferPrice }
            : {}),
          ...(selectedTime ? { selected_time: selectedTime } : {}),
        };
        const { data: created, error: insertError } = await supabase
          .from("bookings")
          .insert(insertPayload)
          .select("id")
          .single();
        if (insertError) {
          logPaymentError("booking-insert", insertError, insertPayload);
          throw new Error(
            `Failed to create booking. Payment ref: ${paymentIntentId}`,
          );
        }
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
        } catch (clearError) {}
      }
      // Step 4: Send confirmation emails
      setPaymentStep(4);
      for (const bookingId of createdIds) {
        try {
          await sendBookingConfirmationEmail({ bookingId });
        } catch (emailError) {
          logPaymentError("send-email", emailError, { bookingId });
        }
      }
      setConfirmationOpen(true);
      setLoading(false);
    } catch (e) {
      logPaymentError("payment-flow", e);
      const msg =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };
  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    navigate("/bookings", { replace: true });
  };
  const handleGoBack = () => {
    navigate("/cart");
  };
  return (
    <Box sx={{ backgroundColor: "#f8f9fb", minHeight: "100vh" }}>
      <Header hidePages />
      <StepperComponent activeStep={2} />

      {/* Back Navigation */}
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          px: { xs: 2, md: 4 },
          pt: 2,
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          disabled={loading}
          sx={{
            color: "#6b7280",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#f3f4f6",
              color: "#1a1a1a",
            },
          }}
        >
          Back to Cart
        </Button>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", overflow: "hidden" },
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            p: 4,
            textAlign: "center",
            color: "white",
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Payment Successful!
          </Typography>
        </Box>
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ mb: 2, fontSize: "1.1rem", color: "#374151" }}>
            Your booking has been confirmed and a confirmation email is on its
            way.
          </Typography>
          {createdBookingIds.length > 0 && (
            <Box
              sx={{
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, color: "#166534", fontSize: "0.95rem" }}
              >
                Booking {createdBookingIds.length > 1 ? "IDs" : "ID"}:{" "}
                <strong>{createdBookingIds.join(", ")}</strong>
              </Typography>
            </Box>
          )}
          <Typography sx={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Manage your bookings from your profile page at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center" }}>
          <Button
            onClick={handleConfirmationClose}
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
              "&:hover": {
                background: "linear-gradient(135deg, #E5541B, #E67B44)",
              },
            }}
          >
            View My Bookings
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: "flex",
          gap: "24px",
          padding: { xs: "16px", md: "24px 40px" },
          flexWrap: "wrap",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* PAYMENT SECTION */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
            borderRadius: "16px",
            flex: { xs: "1 1 100%", md: "1 1 55%" },
            minHeight: "300px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: "20px 24px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CreditCardIcon
              sx={{ color: theme.palette.secondary.main, fontSize: 24 }}
            />
            <Typography
              sx={{ color: "#1a1a1a", fontWeight: 700, fontSize: "1.2rem" }}
            >
              Payment Information
            </Typography>
          </Box>

          <Box sx={{ p: "24px" }}>
            {/* Security badges */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                icon={<LockIcon sx={{ fontSize: 16 }} />}
                label="SSL Encrypted"
                size="small"
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  border: "1px solid #bbf7d0",
                }}
              />
              <Chip
                icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                label="PCI Compliant"
                size="small"
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1e40af",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  border: "1px solid #bfdbfe",
                }}
              />
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                label="Secure Payment"
                size="small"
                sx={{
                  bgcolor: "#faf5ff",
                  color: "#6b21a8",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  border: "1px solid #e9d5ff",
                }}
              />
            </Stack>

            {/* Card input */}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#374151",
                mb: 1,
              }}
            >
              Card Details
            </Typography>
            <Box
              sx={{
                bgcolor: "#f9fafb",
                border: cardError
                  ? "2px solid #ef4444"
                  : cardComplete
                    ? "2px solid #10b981"
                    : "1px solid #e5e7eb",
                borderRadius: "12px",
                p: "16px 18px",
                mb: 3,
                transition: "all 0.2s ease",
                "&:focus-within": {
                  borderColor: "#FF621F",
                  boxShadow: "0 0 0 3px rgba(255, 98, 31, 0.1)",
                },
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1a1a1a",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      "::placeholder": { color: "#9ca3af" },
                      lineHeight: "24px",
                    },
                    invalid: { color: "#ef4444", iconColor: "#ef4444" },
                  },
                  hidePostalCode: true,
                }}
                onChange={(event) => {
                  setCardComplete(event.complete);
                  if (event.error) {
                    setCardError(event.error.message);
                  } else {
                    setCardError(null);
                  }
                }}
              />
            </Box>

            <Collapse in={!!cardError}>
              <Alert
                severity="error"
                icon={<ErrorOutlineIcon fontSize="small" />}
                sx={{ mb: 2, borderRadius: "10px", fontSize: "0.85rem" }}
              >
                {cardError}
              </Alert>
            </Collapse>

            <Collapse in={!!error}>
              <Alert
                severity="error"
                icon={<ErrorOutlineIcon fontSize="small" />}
                sx={{
                  mb: 2,
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  "& .MuiAlert-message": { fontWeight: 500 },
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Collapse>

            {/* Progress indicator */}
            <Collapse in={loading}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    {PAYMENT_STEPS[paymentStep] || "Processing..."}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Step {paymentStep + 1} of {PAYMENT_STEPS.length}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((paymentStep + 1) / PAYMENT_STEPS.length) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #FF621F, #FF8A4F)",
                    },
                  }}
                />
              </Box>
            </Collapse>

            {/* Pay button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!stripe || loading || !cardComplete}
              onClick={handlePay}
              startIcon={!loading ? <LockIcon /> : undefined}
              sx={{
                py: 1.8,
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "1.05rem",
                textTransform: "none",
                background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
                boxShadow: "0 4px 14px rgba(255, 98, 31, 0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #E5541B, #E67B44)",
                  boxShadow: "0 6px 20px rgba(255, 98, 31, 0.45)",
                },
                "&:disabled": {
                  background: "#e5e7eb",
                  color: "#9ca3af",
                  boxShadow: "none",
                },
              }}
            >
              {loading
                ? "Processing your payment..."
                : `Pay AED ${cartFinalPrice.toFixed(2)}`}
            </Button>

            {/* Terms */}
            <Typography
              sx={{
                color: "#9ca3af",
                mt: 3,
                fontSize: "0.8rem",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              By proceeding, you agree to Travel Guru's{" "}
              <Box
                component="a"
                href="/terms"
                target="_blank"
                sx={{
                  color: "#FF621F",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Terms &amp; Conditions
              </Box>
              ,{" "}
              <Box
                component="a"
                href="/privacy"
                target="_blank"
                sx={{
                  color: "#FF621F",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Privacy Policy
              </Box>
              , and applicable{" "}
              <Box
                component="a"
                href="/cancellation-policy"
                target="_blank"
                sx={{
                  color: "#FF621F",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                cancellation policies
              </Box>
              .
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mt: 3,
                pt: 2,
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <LockIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                Secured by Stripe — we never store your card details
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY SECTION */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
            borderRadius: "16px",
            flex: { xs: "1 1 100%", md: "0 1 40%" },
            height: "fit-content",
            position: { md: "sticky" },
            top: { md: "20px" },
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: "20px 24px",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)",
            }}
          >
            <Typography
              sx={{ color: "#1a1a1a", fontWeight: 700, fontSize: "1.2rem" }}
            >
              Booking Summary
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#6b7280", mt: 0.5 }}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              your cart
            </Typography>
          </Box>

          <Box sx={{ p: "20px 24px" }}>
            {cartItems.map((it: any, idx: number) => (
              <Box
                key={`${it.serviceId}-${it.bookingDate}-${it.bookingTime ?? ""}-${idx}`}
                sx={{
                  mb: 2,
                  pb: 2,
                  borderBottom:
                    idx < cartItems.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    mb: 0.5,
                    color: "#1a1a1a",
                  }}
                >
                  {it.serviceName ?? `Service #${it.serviceId}`}
                </Typography>
                <Stack spacing={0.5}>
                  {it.location && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      📍 {it.location}
                    </Typography>
                  )}
                  <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    📅 {it.bookingDate}
                    {it.bookingTime ? ` • 🕒 ${it.bookingTime}` : ""}
                  </Typography>
                  {it.airportType && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      🚗{" "}
                      {it.airportType === "pickup"
                        ? "Airport Pickup"
                        : it.airportType === "dropoff"
                          ? "Airport Drop-off"
                          : it.airportType}
                    </Typography>
                  )}
                  {it.airportType === "dropoff" && it.address && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                      🏠 {it.address}
                    </Typography>
                  )}
                  {it.packageName && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      📦 {it.packageName}
                    </Typography>
                  )}
                  {it.selectedTime && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      ⏰ Time: {it.selectedTime}
                    </Typography>
                  )}
                  {it.transferType && it.transferType !== "none" && (
                    <Typography sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      🚐 Transfer:{" "}
                      {it.transferType === "round_trip"
                        ? "Round Trip"
                        : "One Way"}
                      {it.transferPrice
                        ? ` (AED ${Number(it.transferPrice).toFixed(2)})`
                        : ""}
                    </Typography>
                  )}
                </Stack>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#FF621F",
                    fontSize: "1rem",
                    mt: 1,
                  }}
                >
                  AED {Number(it.unitPrice ?? 0).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 2,
                mt: 1,
                borderTop: "2px solid #f3f4f6",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}
              >
                Total
              </Typography>
              <Typography
                sx={{ fontWeight: 800, fontSize: "1.3rem", color: "#1a1a1a" }}
              >
                AED {cartFinalPrice.toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#f0fdf4",
                borderRadius: 2,
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <VerifiedUserIcon sx={{ color: "#16a34a", fontSize: 20 }} />
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#166534",
                  }}
                >
                  Secure Checkout
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#15803d" }}>
                  256-bit SSL encryption protects your information
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
