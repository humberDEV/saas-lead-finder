import { db, PLAN_LIMITS } from "./db";

/**
 * Returns the user (creating them if needed), resetting tokens if 30 days
 * have passed since the last reset. Single source of truth for token logic.
 */
export async function getOrCreateUser(clerkUserId: string) {
  let user = await db.user.findUnique({ where: { clerkId: clerkUserId } });

  if (!user) {
    user = await db.user.create({ data: { clerkId: clerkUserId, tokens: 3 } });
  }

  // Monthly reset: if 30+ days since last reset, restore tokens for the plan
  const daysSinceReset =
    (Date.now() - new Date(user.tokensResetAt).getTime()) / 86_400_000;

  if (daysSinceReset >= 30) {
    const limit = PLAN_LIMITS[user.plan] ?? 3;
    user = await db.user.update({
      where: { clerkId: clerkUserId },
      data: {
        tokens: limit,
        tokens_reset_at: new Date().toISOString(),
      },
    });
  }

  return user;
}
