import { loadStripe } from "@stripe/stripe-js";
export const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY!);
