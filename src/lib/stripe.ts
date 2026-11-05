import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!client) {
    client = new Stripe(key, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });
  }
  return client;
}

export function stripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
}
