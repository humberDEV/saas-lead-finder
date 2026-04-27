import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const STRIPE_PLANS: Record<string, { priceId: string; plan: string; tokens: number }> = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    plan: "starter",
    tokens: 120,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    plan: "pro",
    tokens: 400,
  },
};
