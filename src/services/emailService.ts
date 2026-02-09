export interface BookingConfirmationEmailParams {
    to?: string;
    bookingId: number | string;
    customerName?: string;
    serviceName?: string;
    location?: string;
    bookingDate?: string;
    packageName?: string;
    totalAmount?: number;
    paymentIntentId?: string;
}
export interface EmailResponse {
    success: boolean;
    messageId?: string;
    message?: string;
    error?: string;
    skipped?: boolean;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
/**
 * Send a booking confirmation email via the backend API.
 * The backend will fetch all booking details from the database,
 * so only booking_id is required.
 */
export const sendBookingConfirmationEmail = async (params: BookingConfirmationEmailParams): Promise<EmailResponse> => {
    const timestamp = new Date().toISOString();
    try {
        const response = await fetch(`${API_BASE_URL}/send-booking-confirmation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ booking_id: params.bookingId }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[${timestamp}] ❌ [EmailService] API error:`, errorData);
            throw new Error(errorData.error ||
                `HTTP ${response.status}: Failed to send confirmation email`);
        }
        const data = await response.json();
        return data;
    }
    catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : "Failed to send confirmation email";
        console.error(`[${timestamp}] ❌ [EmailService] Error:`, message);
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes("fetch")) {
            console.error(`[${timestamp}] ❌ [EmailService] Network error - API server may be unreachable at ${API_BASE_URL}`);
        }
        return {
            success: false,
            error: message,
        };
    }
};
/**
 * Manually trigger a booking confirmation email resend.
 * Useful for resending emails if the original failed.
 */
export const resendBookingConfirmation = async (bookingId: number | string): Promise<EmailResponse> => {
    return sendBookingConfirmationEmail({ bookingId });
};
