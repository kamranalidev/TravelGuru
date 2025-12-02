/**
 * Payment Service
 * 
 * This service handles communication with your backend to create payment intents.
 * 
 * IMPORTANT: For production, you MUST create a backend endpoint to securely create
 * payment intents. Never use your Stripe secret key in the frontend.
 * 
 * Example backend endpoint (Node.js/Express):
 * 
 * app.post('/api/create-payment-intent', async (req, res) => {
 *   const { amount, currency, metadata } = req.body;
 *   
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: amount * 100, // Convert to cents
 *     currency: currency || 'usd',
 *     metadata: metadata,
 *   });
 *   
 *   res.json({ clientSecret: paymentIntent.client_secret });
 * });
 */

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  metadata?: {
    service_id?: number;
    package_id?: number | null;
    user_id?: string;
    booking_date?: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  error?: string;
}

/**
 * Create a payment intent via your backend API
 * 
 * Replace this URL with your actual backend endpoint
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const createPaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "usd",
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create payment intent");
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret };
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return {
      clientSecret: "",
      error: error.message || "Failed to create payment intent",
    };
  }
};

/**
 * For development/testing: Create a mock payment intent
 * This should NOT be used in production
 */
export const createMockPaymentIntent = async (
  _params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> => {
  // This is a mock implementation for development
  // In production, this must be replaced with a real backend call
  console.warn(
    "Using mock payment intent. Replace with real backend endpoint in production."
  );

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a mock client secret (this won't work with real Stripe)
  // For testing, you can use Stripe's test mode with a real backend
  return {
    clientSecret: "mock_client_secret_for_development_only",
    error: "Mock mode - configure backend endpoint for production",
  };
};


