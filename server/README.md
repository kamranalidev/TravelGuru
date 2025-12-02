# TravelGuru Payment Server

Simple Express server for testing Stripe payment integration.

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Copy the example env file and add your Stripe keys:

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe secret key:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
PORT=3001
```

**Get your Stripe keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_test_` for test mode)
3. Paste it in `.env` file

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Update Frontend Environment

In the root `.env` file, make sure you have:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_API_BASE_URL=http://localhost:3001/api
```

## API Endpoints

### POST `/api/create-payment-intent`

Creates a Stripe payment intent.

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "usd",
  "metadata": {
    "service_id": 1,
    "package_id": 2,
    "user_id": "user-uuid",
    "booking_date": "2025-01-15"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### GET `/api/payment-intent/:id`

Retrieves payment intent status.

**Response:**
```json
{
  "id": "pi_xxx",
  "status": "succeeded",
  "amount": 100.00,
  "currency": "usd",
  "metadata": {}
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "TravelGuru Payment Server is running"
}
```

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/25)
- Any 3-digit CVC
- Any ZIP code

### Test Flow

1. Start the server: `npm start`
2. Start the frontend: `npm run dev` (in root directory)
3. Go through booking flow
4. Use test card `4242 4242 4242 4242` at checkout
5. Check server logs for payment intent creation

## Troubleshooting

### "STRIPE_SECRET_KEY not set"
- Make sure you created `.env` file
- Check that `STRIPE_SECRET_KEY` is set correctly
- Restart the server after changing `.env`

### CORS Errors
- Server is configured to allow all origins by default
- If issues persist, check browser console for specific error

### Payment Intent Creation Fails
- Verify your Stripe secret key is correct
- Check server logs for detailed error messages
- Ensure you're using test mode keys (`sk_test_...`)

## Production Notes

For production deployment:

1. Use live mode keys (`sk_live_...`)
2. Set up webhook endpoint with proper signature verification
3. Add rate limiting
4. Add authentication/authorization
5. Use environment-specific configuration
6. Set up proper logging and monitoring


