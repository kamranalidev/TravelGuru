const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
    [key: string]: any;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId?: string;
  error?: string;
}

export const createPaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> => {
  try {
    if (!params.amount || params.amount <= 0) {
      throw new Error("Invalid amount. Must be greater than 0.");
    }

    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "aed",
        description: params.description,
        receiptEmail: params.receiptEmail,
        metadata: params.metadata || {},
      }),
    });

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
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return {
      clientSecret: "",
      error: error.message || "Failed to create payment intent",
    };
  }
};

export const createBookingWithPayment = async (params: {
  userId: string;
  serviceId: number;
  serviceName: string;
  packageId?: number | null;
  packageName?: string | null;
  bookingDate: string;
  amount: number;
  currency?: string;
  userEmail?: string;
  additionalDetails?: any;
}): Promise<{
  bookingId?: number;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/create-booking-with-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId,
        userEmail: params.userEmail,
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        packageId: params.packageId || null,
        packageName: params.packageName || null,
        bookingDate: params.bookingDate,
        amount: params.amount,
        currency: params.currency || "aed",
        additionalDetails: params.additionalDetails || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking with payment");
    }

    return {
      bookingId: data.bookingId,
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (error: any) {
    console.error("Error creating booking with payment:", error);
    return {
      error: error.message || "Failed to create booking with payment",
    };
  }
};

export const verifyPaymentStatus = async (
  paymentIntentId: string
): Promise<{
  status: string;
  amount?: number;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/payment-intent/${paymentIntentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify payment");
    }

    return {
      status: data.status,
      amount: data.amount,
    };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return {
      status: "error",
      error: error.message || "Failed to verify payment",
    };
  }
};