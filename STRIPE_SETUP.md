# Stripe Payment Integration Setup

This guide will help you set up Stripe payment gateway for the TravelGuru booking system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Backend API endpoint to create payment intents (for security)

## Frontend Setup

### 1. Environment Variables

Create a `.env` file in the root directory with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_API_BASE_URL=http://localhost:3001/api
```

**Important:** Never commit your `.env` file to version control. Add it to `.gitignore`.

### 2. Get Your Stripe Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Add it to your `.env` file

## Backend Setup (Required for Production)

You **MUST** create a backend endpoint to securely create payment intents. Never use your Stripe secret key in the frontend.

### Example Backend Endpoint (Node.js/Express)

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Supabase Edge Function Alternative

You can also use Supabase Edge Functions:

1. Create a new Edge Function in your Supabase project
2. Install Stripe: `npm install stripe`
3. Create the function to handle payment intent creation
4. Update `VITE_API_BASE_URL` to point to your Supabase function URL

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

### Test Mode vs Live Mode

- **Test Mode:** Use `pk_test_...` keys for development
- **Live Mode:** Use `pk_live_...` keys for production (requires account verification)

## Payment Flow

1. User selects service, package, and date
2. User clicks "Book Now" → Redirected to checkout
3. Payment intent is created via backend API
4. User enters payment details via Stripe Elements
5. Payment is processed
6. On success:
   - Booking is created in database
   - User is redirected to confirmation page

## Security Notes

- ✅ **DO:** Use backend API to create payment intents
- ✅ **DO:** Validate amounts on the backend
- ✅ **DO:** Store payment intent IDs with bookings
- ❌ **DON'T:** Use secret keys in frontend code
- ❌ **DON'T:** Trust frontend amount calculations
- ❌ **DON'T:** Skip webhook verification

## Webhooks (Recommended)

Set up Stripe webhooks to handle:
- `payment_intent.succeeded` - Confirm booking
- `payment_intent.payment_failed` - Handle failures
- `charge.refunded` - Handle refunds

## Support

For Stripe integration help:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com


