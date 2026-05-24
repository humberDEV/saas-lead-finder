import { db } from "@/lib/db";
import { DEMO_LIMITS } from "@/lib/plans";
import { businessDemoKey } from "@/lib/demo-keys";

export { businessDemoKey };

/** Misma ventana que los tokens de búsqueda (30 días desde `tokens_reset_at`). */
export const BILLING_CYCLE_MS = 30 * 86_400_000;

/** Legacy DB plan keys → límites en `plans.ts` */
const PLAN_ALIASES: Record<string, string> = {
  agency: "pro",
};

export function getDemoLimitForPlan(plan: string): number {
  const key = PLAN_ALIASES[plan] ?? plan;
  return DEMO_LIMITS[key] ?? 0;
}

export function isUnlimitedDemoPlan(plan: string): boolean {
  return getDemoLimitForPlan(plan) < 0;
}

/** Periodo de facturación alineado con tokens (Stripe `invoice.paid` o reset free). */
export function getBillingPeriodFromReset(tokensResetAt: string): {
  start: string;
  end: string;
} {
  const startMs = new Date(tokensResetAt).getTime();
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + BILLING_CYCLE_MS).toISOString(),
  };
}

export type DemoQuotaInfo = {
  limit: number;
  used: number;
  remaining: number | null;
  periodStart: string;
  periodEnd: string;
  canCreate: boolean;
};

export async function getDemoQuotaForUser(
  userId: string,
  plan: string,
  tokensResetAt: string
): Promise<DemoQuotaInfo> {
  const limit = getDemoLimitForPlan(plan);
  const { start, end } = getBillingPeriodFromReset(tokensResetAt);

  if (limit === 0) {
    return {
      limit: 0,
      used: 0,
      remaining: 0,
      periodStart: start,
      periodEnd: end,
      canCreate: false,
    };
  }

  const used = await db.demo.countByUserSince(userId, start);

  if (limit < 0) {
    return {
      limit: -1,
      used,
      remaining: null,
      periodStart: start,
      periodEnd: end,
      canCreate: true,
    };
  }

  const remaining = Math.max(0, limit - used);
  return {
    limit,
    used,
    remaining,
    periodStart: start,
    periodEnd: end,
    canCreate: used < limit,
  };
}

export async function findExistingDemoForBusiness(
  userId: string,
  name: string,
  address: string
) {
  const key = businessDemoKey(name, address);
  const demos = await db.demo.findMany({ where: { userId } });
  for (const demo of demos) {
    if (!demo) continue;
    const raw = demo.businessData as Record<string, unknown>;
    const demoName = String(raw.name ?? "").trim();
    const demoAddress = String(raw.address ?? "").trim();
    if (!demoName || !demoAddress) continue;
    if (businessDemoKey(demoName, demoAddress) === key) return demo;
  }
  return null;
}
