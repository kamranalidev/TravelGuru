import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { StripePayment } from "../StripePayment";
import { createBookingWithPayment } from "../../services/paymentService";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentWrapperProps {
  userId: string;
  userEmail: string;
  serviceId: number;
  serviceName: string;
  packageId?: number | null;
  packageName?: string | null;
  bookingDate: string;
  amount: number;
  currency?: string;
  additionalDetails?: any;
  onSuccess: (bookingId: number, paymentIntentId: string) => void;
  onError: (error: string) => void;
}

/**
 * PaymentWrapper Component
 *
 * This component handles the complete payment flow:
 * 1. Creates a booking in the database
 * 2. Creates a Stripe payment intent via Supabase Edge Function
 * 3. Renders the Stripe payment form
 * 4. Handles payment success/failure
 *
 * Usage:
 * <PaymentWrapper
 *   userId={user.id}
 *   userEmail={user.email}
 *   serviceId={service.id}
 *   serviceName={service.name}
 *   bookingDate={selectedDate}
 *   amount={totalAmount}
 *   onSuccess={(bookingId, paymentIntentId) => {
 *     // Handle success - redirect, show confirmation, etc.
 *   }}
 *   onError={(error) => {
 *     // Handle error - show error message
 *   }}
 * />
 */
export const PaymentWrapper = ({
  userId,
  userEmail,
  serviceId,
  serviceName,
  packageId,
  packageName,
  bookingDate,
  amount,
  currency = "aed",
  additionalDetails,
  onSuccess,
  onError,
}: PaymentWrapperProps) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await createBookingWithPayment({
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
      });

      if (result.error || !result.clientSecret || !result.bookingId) {
        throw new Error(result.error || "Failed to initialize payment");
      }

      setClientSecret(result.clientSecret);
      setBookingId(result.bookingId);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to initialize payment";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (bookingId) {
      onSuccess(bookingId, paymentIntentId);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    onError(errorMessage);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#FF621F" }} size={50} />
        <Typography variant="body1" sx={{ color: "#666" }}>
          Preparing your payment...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ my: 3 }}
        action={
          <button
            onClick={initializePayment}
            style={{
              background: "transparent",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert severity="error" sx={{ my: 3 }}>
        Unable to initialize payment. Please try again.
      </Alert>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#FF621F",
        colorBackground: "#ffffff",
        colorText: "#333333",
        colorDanger: "#df1b41",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePayment
        amount={amount}
        currency={currency}
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </Elements>
  );
};
