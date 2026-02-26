import { useState, useCallback, useRef } from "react";
import {
  processPayment,
  getPaymentStatus,
  requestRefund,
  getUserPaymentHistory,
  getPaymentReceipt,
  cancelPayment,
  PAYMENT_STATUS,
  PAYMENT_ERROR_CODES,
} from "../lib/payment";

/**
 * Custom hook for payment processing with real-time status updates
 *
 * Usage:
 * const {
 *   processBookingPayment,
 *   paymentStatus,
 *   isProcessing,
 *   error,
 *   receipt,
 *   resetPayment,
 * } = usePayment();
 */
export function usePayment() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Process a booking payment with real-time status updates
   */
  const processBookingPayment = useCallback(
    async ({
      userId,
      amount,
      currency = "AED",
      paymentMethod,
      bookingDetails,
    }) => {
      // Reset state
      setIsProcessing(true);
      setError(null);
      setReceipt(null);
      setPaymentStatus({
        status: "starting",
        message: "Initializing payment...",
      });

      try {
        const result = await processPayment({
          userId,
          amount,
          currency,
          paymentMethod,
          bookingDetails,
          onStatusUpdate: (statusUpdate) => {
            console.log("[Payment Status]", statusUpdate);
            setPaymentStatus(statusUpdate);
            setTransactionRef(statusUpdate.transactionRef);
          },
        });

        if (result.success) {
          setReceipt(result.receipt);
          setPaymentStatus({
            status: PAYMENT_STATUS.COMPLETED,
            message: result.message,
            transactionRef: result.transactionRef,
          });
          return { success: true, ...result };
        } else if (result.requiresAction) {
          setPaymentStatus({
            status: PAYMENT_STATUS.REQUIRES_ACTION,
            message: result.message,
            actionUrl: result.actionUrl,
            transactionRef: result.transactionRef,
          });
          return { success: false, requiresAction: true, ...result };
        } else {
          setError({
            code: result.errorCode,
            message: result.userMessage || result.message,
            supportInfo: result.supportInfo,
          });
          setPaymentStatus({
            status: PAYMENT_STATUS.FAILED,
            message: result.userMessage || result.message,
            transactionRef: result.transactionRef,
          });
          return { success: false, ...result };
        }
      } catch (err) {
        const errorMsg = err.message || "An unexpected error occurred";
        setError({ code: "UNEXPECTED_ERROR", message: errorMsg });
        setPaymentStatus({ status: PAYMENT_STATUS.FAILED, message: errorMsg });
        return { success: false, error: errorMsg };
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  /**
   * Request a refund for a completed payment
   */
  const requestPaymentRefund = useCallback(
    async ({ transactionRef, userId, reason, amount = null }) => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await requestRefund({
          transactionRef,
          userId,
          reason,
          amount,
        });

        if (!result.success) {
          setError({ message: result.message });
        }

        return result;
      } catch (err) {
        const errorMsg = err.message || "Failed to process refund";
        setError({ message: errorMsg });
        return { success: false, message: errorMsg };
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  /**
   * Cancel a pending payment
   */
  const cancelPendingPayment = useCallback(
    async (transactionRef, userId, reason) => {
      setIsProcessing(true);

      try {
        const result = await cancelPayment(transactionRef, userId, reason);

        if (result.success) {
          setPaymentStatus({
            status: PAYMENT_STATUS.CANCELLED,
            message: result.message,
          });
        }

        return result;
      } catch (err) {
        return { success: false, message: err.message };
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  /**
   * Check status of a payment
   */
  const checkPaymentStatus = useCallback(
    async (ref) => {
      const txnRef = ref || transactionRef;
      if (!txnRef)
        return { success: false, message: "No transaction reference" };

      try {
        const result = await getPaymentStatus(txnRef);
        if (result.found) {
          setPaymentStatus({
            status: result.status,
            message: result.message,
            transactionRef: txnRef,
          });
        }
        return result;
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [transactionRef],
  );

  /**
   * Get payment history for the user
   */
  const getHistory = useCallback(async (userId, options = {}) => {
    try {
      return await getUserPaymentHistory(userId, options);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Get payment receipt
   */
  const fetchReceipt = useCallback(async (ref, userId) => {
    try {
      const result = await getPaymentReceipt(ref, userId);
      if (result.success) {
        setReceipt(result.receipt);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setPaymentStatus(null);
    setIsProcessing(false);
    setError(null);
    setReceipt(null);
    setTransactionRef(null);
  }, []);

  return {
    // Actions
    processBookingPayment,
    requestPaymentRefund,
    cancelPendingPayment,
    checkPaymentStatus,
    getHistory,
    fetchReceipt,
    resetPayment,

    // State
    paymentStatus,
    isProcessing,
    error,
    receipt,
    transactionRef,

    // Constants (for UI)
    PAYMENT_STATUS,
    PAYMENT_ERROR_CODES,
  };
}

/**
 * Payment status display component helper
 */
export const getPaymentStatusUI = (status) => {
  const statusConfig = {
    [PAYMENT_STATUS.INITIATED]: {
      color: "blue",
      icon: "🔄",
      text: "Initializing...",
      showSpinner: true,
    },
    [PAYMENT_STATUS.VALIDATING]: {
      color: "blue",
      icon: "🔍",
      text: "Validating...",
      showSpinner: true,
    },
    [PAYMENT_STATUS.PROCESSING]: {
      color: "yellow",
      icon: "⏳",
      text: "Processing...",
      showSpinner: true,
    },
    [PAYMENT_STATUS.AWAITING_CONFIRMATION]: {
      color: "yellow",
      icon: "📨",
      text: "Awaiting confirmation...",
      showSpinner: true,
    },
    [PAYMENT_STATUS.COMPLETED]: {
      color: "green",
      icon: "✅",
      text: "Payment Successful!",
      showSpinner: false,
    },
    [PAYMENT_STATUS.FAILED]: {
      color: "red",
      icon: "❌",
      text: "Payment Failed",
      showSpinner: false,
    },
    [PAYMENT_STATUS.REFUNDED]: {
      color: "blue",
      icon: "💰",
      text: "Refunded",
      showSpinner: false,
    },
    [PAYMENT_STATUS.CANCELLED]: {
      color: "gray",
      icon: "🚫",
      text: "Cancelled",
      showSpinner: false,
    },
    [PAYMENT_STATUS.TIMEOUT]: {
      color: "orange",
      icon: "⏱️",
      text: "Timed Out",
      showSpinner: false,
    },
    [PAYMENT_STATUS.REQUIRES_ACTION]: {
      color: "purple",
      icon: "🔐",
      text: "Verification Required",
      showSpinner: false,
    },
    [PAYMENT_STATUS.UNDER_REVIEW]: {
      color: "yellow",
      icon: "🔍",
      text: "Under Review",
      showSpinner: false,
    },
  };

  return (
    statusConfig[status] || {
      color: "gray",
      icon: "❓",
      text: "Unknown Status",
      showSpinner: false,
    }
  );
};

export default usePayment;
