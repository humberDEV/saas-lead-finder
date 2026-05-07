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
  go: {
    key: "go",
    displayName: "Go",
    priceEnvVar: "STRIPE_GO_PRICE_ID",
    searches: 100,
    priceMonthly: 9,
  },
  pro: {
    key: "pro",
    displayName: "Pro",
    priceEnvVar: "STRIPE_STARTER_PRICE_ID", // legacy env var name — do not rename
    searches: 250,
    priceMonthly: 19,
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
