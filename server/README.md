# Travel Guroo Payment Server

Node.js backend server for handling Stripe payments securely.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Get from Stripe Dashboard (https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...

# Get from Stripe Webhooks (https://dashboard.stripe.com/test/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Get from Supabase Project Settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Server configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /health
```

### Create Payment Intent

```
POST /api/create-payment-intent
Body: {
  amount: number,
  currency?: string,
  metadata?: object,
  description?: string,
  receiptEmail?: string
}
```

### Create Booking with Payment

```
POST /api/create-booking-with-payment
Body: {
  userId: string,
  userEmail: string,
  serviceId: number,
  serviceName: string,
  packageId?: number,
  packageName?: string,
  bookingDate: string,
  amount: number,
  currency?: string,
  additionalDetails?: object
}
```

### Get Payment Status

```
GET /api/payment-intent/:id
```

### Stripe Webhook

```
POST /api/webhook
```

## Frontend Configuration

In your frontend `.env` file, add:

```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing

Use Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Webhook Testing

Use Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

## Production Deployment

1. Set environment variables on your hosting platform
2. Use HTTPS for webhook endpoint
3. Configure webhook URL in Stripe Dashboard
4. Update FRONTEND_URL to your production domain
