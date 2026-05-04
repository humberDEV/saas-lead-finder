import Stripe from "stripe";
import { PLANS, getStripePriceId } from "./plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

/** Builds the STRIPE_PLANS map at call time so env vars are resolved. */
export function getStripePlans(): Record<string, { priceId: string; plan: string; searches: number }> {
  const map: Record<string, { priceId: string; plan: string; searches: number }> = {};
  for (const plan of Object.values(PLANS)) {
    const priceId = getStripePriceId(plan.key);
    if (priceId) {
      map[plan.key] = { priceId, plan: plan.key, searches: plan.searches };
    }
  }
  return map;
}

// Keep backward-compat export for existing call sites
export const STRIPE_PLANS = getStripePlans();
