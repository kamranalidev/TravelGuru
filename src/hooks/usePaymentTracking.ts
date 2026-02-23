import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

// ============================================================================
// PAYMENT STATUS CONSTANTS (matching backend)
// ============================================================================
export const PAYMENT_STATUS = {
  INITIATED: "initiated",
  VALIDATING: "validating",
  PROCESSING: "processing",
  AWAITING_CONFIRMATION: "awaiting_confirmation",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  CANCELLED: "cancelled",
  TIMEOUT: "timeout",
  REQUIRES_ACTION: "requires_action",
  ON_HOLD: "on_hold",
  UNDER_REVIEW: "under_review",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ============================================================================
// PAYMENT ERROR CODES
// ============================================================================
export const PAYMENT_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "PAYMENT_TIMEOUT",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  CARD_DECLINED: "CARD_DECLINED",
  INVALID_CARD: "INVALID_CARD",
  EXPIRED_CARD: "EXPIRED_CARD",
  FRAUD_DETECTED: "FRAUD_DETECTED",
  DUPLICATE_TRANSACTION: "DUPLICATE_TRANSACTION",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================
const ERROR_MESSAGES: Record<string, string> = {
  [PAYMENT_ERROR_CODES.NETWORK_ERROR]:
    "Network connection issue. Your payment was not processed. Please check your internet and try again.",
  [PAYMENT_ERROR_CODES.TIMEOUT]:
    "Payment request timed out. No charges were made. Please try again.",
  [PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS]:
    "Insufficient funds in your account. Please use a different payment method.",
  [PAYMENT_ERROR_CODES.CARD_DECLINED]:
    "Your card was declined. Please contact your bank or use a different card.",
  [PAYMENT_ERROR_CODES.INVALID_CARD]:
    "Invalid card details. Please check your card information and try again.",
  [PAYMENT_ERROR_CODES.EXPIRED_CARD]:
    "Your card has expired. Please use a different card.",
  [PAYMENT_ERROR_CODES.FRAUD_DETECTED]:
    "Transaction flagged for security review. Please contact support if this is unexpected.",
  [PAYMENT_ERROR_CODES.DUPLICATE_TRANSACTION]:
    "This appears to be a duplicate transaction. Please check your booking history.",
  [PAYMENT_ERROR_CODES.SERVER_ERROR]:
    "Our payment system is temporarily unavailable. Your card was not charged. Please try again later.",
  [PAYMENT_ERROR_CODES.VALIDATION_ERROR]:
    "Invalid payment details provided. Please review and try again.",
  [PAYMENT_ERROR_CODES.RATE_LIMITED]:
    "Too many payment attempts. Please wait a few minutes before trying again.",
  [PAYMENT_ERROR_CODES.UNKNOWN_ERROR]:
    "An unexpected error occurred. If you were charged, please contact support with your transaction ID.",
};

// ============================================================================
// TYPES
// ============================================================================
export interface PaymentStatusUpdate {
  status: PaymentStatus;
  message: string;
  transactionRef?: string;
  timestamp?: string;
  processingTime?: number;
  step?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionRef?: string;
  bookingId?: number;
  confirmationNumber?: string;
  message: string;
  errorCode?: string;
  receipt?: {
    transactionRef: string;
    amount: number;
    currency: string;
    paidAt: string;
    bookingId?: number;
  };
}

export interface PaymentHistoryItem {
  transactionRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  statusMessage: string;
  statusEmoji: string;
  createdAt: string;
  updatedAt: string;
  bookingId?: number;
}

// ============================================================================
// GENERATE TRANSACTION REF (Client-side)
// ============================================================================
export const generateTransactionRef = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const checksum = generateChecksum(timestamp + randomPart);
  return `TXN-${timestamp}-${randomPart}-${checksum}`.toUpperCase();
};

const generateChecksum = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 4);
};

// ============================================================================
// STATUS HELPERS
// ============================================================================
export const getStatusMessage = (status: PaymentStatus): string => {
  const messages: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.INITIATED]:
      "Payment has been initiated. Processing will begin shortly.",
    [PAYMENT_STATUS.VALIDATING]: "Validating your payment details...",
    [PAYMENT_STATUS.PROCESSING]:
      "Your payment is being processed. Please wait...",
    [PAYMENT_STATUS.AWAITING_CONFIRMATION]:
      "Payment received. Awaiting confirmation from your bank.",
    [PAYMENT_STATUS.COMPLETED]:
      "✅ Payment successful! Your booking is confirmed.",
    [PAYMENT_STATUS.FAILED]:
      "❌ Payment failed. No charges were made to your account.",
    [PAYMENT_STATUS.REFUNDED]:
      "💰 Payment has been refunded to your original payment method.",
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]:
      "💵 Partial refund processed to your original payment method.",
    [PAYMENT_STATUS.CANCELLED]: "Payment was cancelled. No charges were made.",
    [PAYMENT_STATUS.TIMEOUT]:
      "⏱️ Payment timed out. No charges were made. Please try again.",
    [PAYMENT_STATUS.REQUIRES_ACTION]:
      "🔐 Additional verification required. Please complete the authentication.",
    [PAYMENT_STATUS.ON_HOLD]: "⏸️ Payment is on hold pending verification.",
    [PAYMENT_STATUS.UNDER_REVIEW]:
      "🔍 Payment is under security review. You will be notified shortly.",
  };
  return messages[status] || "Unknown status. Please contact support.";
};

export const getStatusEmoji = (status: PaymentStatus): string => {
  const emojis: Record<PaymentStatus, string> = {
    [PAYMENT_STATUS.INITIATED]: "🔄",
    [PAYMENT_STATUS.VALIDATING]: "🔍",
    [PAYMENT_STATUS.PROCESSING]: "⏳",
    [PAYMENT_STATUS.AWAITING_CONFIRMATION]: "📨",
    [PAYMENT_STATUS.COMPLETED]: "✅",
    [PAYMENT_STATUS.FAILED]: "❌",
    [PAYMENT_STATUS.REFUNDED]: "💰",
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "💵",
    [PAYMENT_STATUS.CANCELLED]: "🚫",
    [PAYMENT_STATUS.TIMEOUT]: "⏱️",
    [PAYMENT_STATUS.REQUIRES_ACTION]: "🔐",
    [PAYMENT_STATUS.ON_HOLD]: "⏸️",
    [PAYMENT_STATUS.UNDER_REVIEW]: "🔍",
  };
  return emojis[status] || "❓";
};

// ============================================================================
// LOG PAYMENT TO DATABASE
// ============================================================================
export const logPaymentToDatabase = async (params: {
  transactionRef: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bookingId?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> => {
  try {
    const { error } = await supabase.from("payment_logs").insert({
      transaction_ref: params.transactionRef,
      user_id: params.userId,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      status: params.status,
      booking_id: params.bookingId || null,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[Payment Log] Failed to log:", error);
    }
  } catch (err) {
    console.error("[Payment Log] Exception:", err);
  }
};

// ============================================================================
// UPDATE PAYMENT LOG
// ============================================================================
export const updatePaymentLog = async (
  transactionRef: string,
  updates: {
    status?: PaymentStatus;
    bookingId?: number;
    metadata?: Record<string, unknown>;
  },
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) {
      updateData.status = updates.status;
    }
    if (updates.bookingId) {
      updateData.booking_id = updates.bookingId;
    }
    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    const { error } = await supabase
      .from("payment_logs")
      .update(updateData)
      .eq("transaction_ref", transactionRef);

    if (error) {
      console.error("[Payment Log] Failed to update:", error);
    }
  } catch (err) {
    console.error("[Payment Log] Update exception:", err);
  }
};

// ============================================================================
// GET PAYMENT STATUS
// ============================================================================
export const getPaymentStatus = async (
  transactionRef: string,
): Promise<{
  found: boolean;
  status?: PaymentStatus;
  message: string;
  amount?: number;
  currency?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("transaction_ref", transactionRef)
      .single();

    if (error || !data) {
      return {
        found: false,
        message:
          "Transaction not found. Please contact support with your reference.",
      };
    }

    return {
      found: true,
      status: data.status as PaymentStatus,
      message: getStatusMessage(data.status as PaymentStatus),
      amount: data.amount,
      currency: data.currency,
    };
  } catch (err) {
    console.error("[Payment Status] Error:", err);
    return {
      found: false,
      message: "Unable to retrieve payment status. Please try again.",
    };
  }
};

// ============================================================================
// GET USER PAYMENT HISTORY
// ============================================================================
export const getUserPaymentHistory = async (
  userId: string,
  limit = 20,
): Promise<{
  success: boolean;
  payments: PaymentHistoryItem[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, payments: [], error: error.message };
    }

    const payments: PaymentHistoryItem[] = (data || []).map((p) => ({
      transactionRef: p.transaction_ref,
      amount: p.amount,
      currency: p.currency,
      status: p.status as PaymentStatus,
      statusMessage: getStatusMessage(p.status as PaymentStatus),
      statusEmoji: getStatusEmoji(p.status as PaymentStatus),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      bookingId: p.booking_id,
    }));

    return { success: true, payments };
  } catch (err) {
    console.error("[Payment History] Error:", err);
    return {
      success: false,
      payments: [],
      error: "Failed to load payment history",
    };
  }
};

// ============================================================================
// USE PAYMENT TRACKING HOOK
// ============================================================================
export const usePaymentTracking = () => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPayment = useCallback(
    async (userId: string, amount: number, currency = "AED") => {
      const ref = generateTransactionRef();
      setTransactionRef(ref);
      setStatus(PAYMENT_STATUS.INITIATED);
      setStatusMessage(getStatusMessage(PAYMENT_STATUS.INITIATED));
      setIsProcessing(true);
      setError(null);

      // Log to database
      await logPaymentToDatabase({
        transactionRef: ref,
        userId,
        amount,
        currency,
        status: PAYMENT_STATUS.INITIATED,
        metadata: { initiatedAt: new Date().toISOString() },
      });

      return ref;
    },
    [],
  );

  const updateStatus = useCallback(
    async (
      newStatus: PaymentStatus,
      bookingId?: number,
      metadata?: Record<string, unknown>,
    ) => {
      setStatus(newStatus);
      setStatusMessage(getStatusMessage(newStatus));

      if (transactionRef) {
        await updatePaymentLog(transactionRef, {
          status: newStatus,
          bookingId,
          metadata: {
            ...metadata,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      // Update processing state
      const terminalStatuses: PaymentStatus[] = [
        PAYMENT_STATUS.COMPLETED,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.CANCELLED,
        PAYMENT_STATUS.TIMEOUT,
        PAYMENT_STATUS.REFUNDED,
      ];

      if (terminalStatuses.includes(newStatus)) {
        setIsProcessing(false);
      }
    },
    [transactionRef],
  );

  const setPaymentError = useCallback(
    (errorCode: string, customMessage?: string) => {
      const message =
        customMessage ||
        ERROR_MESSAGES[errorCode] ||
        ERROR_MESSAGES[PAYMENT_ERROR_CODES.UNKNOWN_ERROR];
      setError(message);
      setIsProcessing(false);
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus(null);
    setStatusMessage("");
    setTransactionRef(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    status,
    statusMessage,
    transactionRef,
    isProcessing,
    error,
    startPayment,
    updateStatus,
    setPaymentError,
    reset,
    // Constants
    PAYMENT_STATUS,
    PAYMENT_ERROR_CODES,
  };
};

export default usePaymentTracking;
