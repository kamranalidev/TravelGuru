import { useState, type FormEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ButtonComponent } from "../Button";
import "./index.css";

interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  clientSecret?: string;
}

export const StripePayment = ({
  amount,
  onSuccess,
  onError,
}: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
          receipt_email: email || undefined,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else {
        setErrorMessage("Payment processing. Please wait...");
      }
    } catch (err: any) {
      const message = err?.message || "An unexpected error occurred";
      setErrorMessage(message);
      onError(message);
      setIsProcessing(false);
    }
  };

  return (
    <Box className="stripe-payment-container">
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Payment Details
          </Typography>

          <TextField
            label="Email for receipt"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            placeholder="your.email@example.com"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />

          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <Box className="payment-element-wrapper">
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Secure payment powered by Stripe
            </Typography>
            <ButtonComponent
              title={isProcessing ? "Processing..." : `Pay AED ${Number(amount).toLocaleString()}`}
              width="auto"
              type="submit"
              bgColor="#FF621F"
              style={{
                minWidth: "180px",
                padding: "12px 32px",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            />
          </Box>

          {isProcessing && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} sx={{ color: "#FF621F" }} />
            </Box>
          )}
        </Stack>
      </form>
    </Box>
  );
};

