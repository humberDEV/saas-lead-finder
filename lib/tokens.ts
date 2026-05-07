import { db } from "./db";
import { PLAN_LIMITS } from "./plans";
import { trackEvent } from "./events";

/**
 * Returns the user (creating them if needed), syncing email/name from Clerk
 * and resetting tokens if 30 days have passed. Single source of truth.
 */
export async function getOrCreateUser(
  clerkUserId: string,
  clerkProfile?: { email?: string | null; name?: string | null }
) {
  let user = await db.user.findUnique({ where: { clerkId: clerkUserId } });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: clerkUserId,
        tokens: PLAN_LIMITS["free"],
        email: clerkProfile?.email ?? undefined,
        name: clerkProfile?.name ?? undefined,
      },
    });
    await trackEvent(user.id, "user_signed_up");
    return user;
  }

  // Sync missing email/name from Clerk
  const needsSync =
    (clerkProfile?.email && !user.email) ||
    (clerkProfile?.name && !user.name);

  const syncPatch: Record<string, any> = {};
  if (clerkProfile?.email && !user.email) syncPatch.email = clerkProfile.email;
  if (clerkProfile?.name && !user.name) syncPatch.name = clerkProfile.name;

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
        ...syncPatch,
      },
    });
  } else if (needsSync) {
    user = await db.user.update({
      where: { clerkId: clerkUserId },
      data: syncPatch,
    });
  }

  return user;
}
