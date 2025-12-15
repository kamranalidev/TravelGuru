/**
 * Email Service
 * 
 * This service handles sending booking confirmation emails via the backend API.
 */

export interface BookingConfirmationEmailParams {
  to: string;
  bookingId: number | string;
  customerName?: string;
  serviceName: string;
  location?: string;
  bookingDate: string;
  packageName?: string;
  totalAmount: number;
  paymentIntentId?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Send booking confirmation email via backend API
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const sendBookingConfirmationEmail = async (
  params: BookingConfirmationEmailParams
): Promise<EmailResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-booking-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send confirmation email");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error sending booking confirmation email:", error);
    // Don't throw error - email failure shouldn't break the booking flow
    return {
      success: false,
      error: error.message || "Failed to send confirmation email",
    };
  }
};





