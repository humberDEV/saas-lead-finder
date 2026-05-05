export interface PlanConfig {
  key: string;
  displayName: string;
  /** Env var holding the Stripe Price ID (empty for free) */
  priceEnvVar: string;
  searches: number;
  priceMonthly: number;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    key: "free",
    displayName: "Free",
    priceEnvVar: "",
    searches: 3,
    priceMonthly: 0,
  },
  pro: {
    key: "pro",
    displayName: "Starter",
    priceEnvVar: "STRIPE_STARTER_PRICE_ID", // legacy env var name from production
    searches: 150,
    priceMonthly: 19,
  },
  agency: {
    key: "agency",
    displayName: "Agency",
    priceEnvVar: "STRIPE_PRO_PRICE_ID", // legacy env var name from production
    searches: 400,
    priceMonthly: 29,
  },
};

/** plan key -> search limit */
export const PLAN_LIMITS: Record<string, number> = Object.fromEntries(
  Object.values(PLANS).map((p) => [p.key, p.searches])
);

/** plan key -> Stripe Price ID (reads env at call time) */
export function getStripePriceId(planKey: string): string | null {
  const plan = PLANS[planKey];
  if (!plan || !plan.priceEnvVar) return null;
  return process.env[plan.priceEnvVar] ?? null;
}
