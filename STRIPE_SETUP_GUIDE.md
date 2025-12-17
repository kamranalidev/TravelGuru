# Stripe Payment Integration Setup Guide

This guide will help you set up the complete Stripe payment system for Travel Guroo using a Node.js backend server.

## Architecture Overview

```
Frontend (React) → Node.js Server → Stripe API → Supabase Database
                        ↑
                 Stripe Webhooks
```

## Step 1: Install Dependencies

### Frontend

Already installed: `@stripe/react-stripe-js`, `@stripe/stripe-js`

### Backend

```bash
cd server
npm install
```

## Step 2: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or login
3. Go to **Developers → API Keys**
4. Copy your **Publishable key** (pk*test*...)
5. Copy your **Secret key** (sk*test*...)

## Step 3: Configure Environment Variables

### Backend (.env in /server directory)

Create `server/.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get this in Step 6

# Supabase (from your Supabase project settings)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Server Config
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in root directory)

Add to your existing `.env`:

```env
# Stripe Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# API URL
VITE_API_URL=http://localhost:3001/api
```

## Step 4: Update Supabase Tables

Make sure your `bookings` table has these columns:

```sql
-- Add payment columns if they don't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'canceled')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending';
```

Also run the reviews rating migration:

```sql
-- Run the SQL in reviews_add_rating_column.sql
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
```

## Step 5: Start the Backend Server

```bash
cd server
npm run dev
```

You should see:

```
🚀 Travel Guroo Payment Server is running on port 3001
📍 Health check: http://localhost:3001/health
💳 Payment API: http://localhost:3001/api/create-payment-intent
🔔 Webhook: http://localhost:3001/api/webhook
```

## Step 6: Set Up Stripe Webhooks (For Production)

### Development Testing

Use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3001/api/webhook
```

This will give you a webhook secret (whsec\_...) - add it to your `server/.env`

### Production Setup

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret** to your production `.env`

## Step 7: Test the Integration

### Using the PaymentWrapper Component

```tsx
import { PaymentWrapper } from "../components";

function BookingPage() {
  const { session, profile } = useAuth();

  const handlePaymentSuccess = (bookingId, paymentIntentId) => {
    console.log("Payment successful!", { bookingId, paymentIntentId });
    // Redirect to confirmation page
    navigate(`/booking-confirmation/${bookingId}`);
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    // Show error message to user
  };

  return (
    <PaymentWrapper
      userId={session.user.id}
      userEmail={profile.email}
      serviceId={serviceId}
      serviceName="Desert Safari"
      bookingDate="2025-12-25"
      amount={299.0}
      currency="aed"
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

### Test Cards (Stripe Test Mode)

| Card Number         | Description                    |
| ------------------- | ------------------------------ |
| 4242 4242 4242 4242 | Successful payment             |
| 4000 0000 0000 0002 | Card declined                  |
| 4000 0025 0000 3155 | Requires 3D Secure (use 12/34) |

Use any future expiry date (e.g., 12/34) and any 3-digit CCV.

## Step 8: Verify Payment Flow

1. **Start both servers:**

   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   npm run dev
   ```

2. **Test booking:**

   - Navigate to a service booking page
   - Select a package and date
   - Click "Book Now"
   - Fill in payment details with test card
   - Submit payment

3. **Check results:**
   - Check console logs in both terminals
   - Verify booking in Supabase `bookings` table
   - Verify `payment_status` changed to "paid"
   - Verify `status` changed to "confirmed"

## Troubleshooting

### "Failed to create payment intent"

- Check `STRIPE_SECRET_KEY` in `server/.env`
- Ensure key starts with `sk_test_` or `sk_live_`
- Check backend server logs

### "Network request failed"

- Ensure backend server is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in `server/server.js`

### Webhook not receiving events

- Ensure `STRIPE_WEBHOOK_SECRET` is set
- Use Stripe CLI for local testing
- Check webhook endpoint is publicly accessible (production)

### Database not updating

- Check `SUPABASE_SERVICE_ROLE_KEY` in backend
- Verify table structure matches schema
- Check Supabase logs for errors

## Production Checklist

- [ ] Use Stripe live keys (`sk_live_`, `pk_live_`)
- [ ] Set up production webhook with HTTPS
- [ ] Enable webhook signature verification
- [ ] Use HTTPS for all API calls
- [ ] Add rate limiting to API endpoints
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Test with real payment methods
- [ ] Set up Stripe payment success/failure emails
- [ ] Add security headers (helmet.js)
- [ ] Enable CORS only for your domain

## Support

For Stripe-specific issues:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For implementation issues:

- Check server logs
- Check browser console
- Verify environment variables
