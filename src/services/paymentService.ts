import { supabase } from "../supabaseClient";

// ============================================================================
// TRAVEL GURU - PAYMENT SERVICE
// Aligned with Supabase Edge Functions and payment tracking system
// ============================================================================

const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string;
  if (!url) throw new Error("Missing Supabase URL configuration");
  return url;
};

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  description?: string;
  receiptEmail?: string;
  metadata?: {
    service_id?: number;
    service_name?: string;
    package_id?: number | null;
    package_name?: string | null;
    user_id?: string;
    user_email?: string;
    booking_id?: number;
    booking_date?: string;
    transaction_ref?: string;
    [key: string]: unknown;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId?: string;
  error?: string;
}

/**
 * Create a Stripe PaymentIntent via Supabase Edge Function
 */
export const createPaymentIntent = async (
  params: CreatePaymentIntentParams,
): Promise<PaymentIntentResponse> => {
  try {
    if (!params.amount || params.amount <= 0) {
      throw new Error("Invalid amount. Must be greater than 0.");
    }

    // Get session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Please log in to make a payment.");
    }

    const supabaseUrl = getSupabaseUrl();

    // Amount should be in fils (smallest currency unit)
    const amountInFils = Math.round(params.amount * 100);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: amountInFils,
          currency: params.currency || "aed",
          service_id: params.metadata?.service_id,
          package_id: params.metadata?.package_id,
          booking_date: params.metadata?.booking_date,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create payment intent");
    }

    if (!data?.clientSecret) {
      throw new Error("Invalid response from payment server");
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create payment intent";
    return {
      clientSecret: "",
      error: message,
    };
  }
};

/**
 * Verify payment status via Supabase Edge Function
 */
export const verifyPaymentStatus = async (params: {
  paymentIntentId?: string;
  transactionRef?: string;
}): Promise<{
  found: boolean;
  status?: string;
  stripeStatus?: string;
  amount?: number;
  currency?: string;
  transactionRef?: string;
  bookingId?: number;
  message: string;
  error?: string;
}> => {
  try {
    // Get session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Please log in to verify payment.");
    }

    const supabaseUrl = getSupabaseUrl();

    const response = await fetch(
      `${supabaseUrl}/functions/v1/verify-payment-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paymentIntentId: params.paymentIntentId,
          transactionRef: params.transactionRef,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify payment");
    }

    return data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to verify payment";
    return {
      found: false,
      message: "Unable to verify payment status",
      error: message,
    };
  }
};

/**
 * Get user's payment history from payment_logs
 */
export const getUserPaymentHistory = async (
  limit = 20,
): Promise<{
  success: boolean;
  payments: Array<{
    transactionRef: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    bookingId?: number;
  }>;
  error?: string;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Please log in to view payment history.");
    }

    const { data, error } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const payments = (data || []).map((p) => ({
      transactionRef: p.transaction_ref,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.created_at,
      bookingId: p.booking_id,
    }));

    return { success: true, payments };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load payment history";
    return { success: false, payments: [], error: message };
  }
};
