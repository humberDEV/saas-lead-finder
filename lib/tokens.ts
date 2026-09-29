import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";
import { PLAN_LIMITS } from "./plans";
import { trackEvent } from "./events";

function generateReferralCode(): string {
  return randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

/**
 * Returns the user (creating them if needed), syncing email/name from Clerk
 * and resetting tokens if 30 days have passed. Single source of truth.
 */
export async function getOrCreateUser(
  clerkUserId: string,
  clerkProfile?: { email?: string | null; name?: string | null; referralCode?: string | null }
) {
  let user = await db.user.findUnique({ where: { clerkId: clerkUserId } });

  if (!user) {
    // If the caller didn't pass the profile, fetch it from Clerk so we
    // always have the email at creation time for billing and account recovery.
    let email = clerkProfile?.email ?? null;
    let name = clerkProfile?.name ?? null;
    if (!email) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);
        email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
        const firstName = clerkUser.firstName ?? "";
        const lastName = clerkUser.lastName ?? "";
        name = name ?? (firstName || lastName ? `${firstName} ${lastName}`.trim() : null);
      } catch {
        // Non-fatal — user still gets created.
      }
    }

    // Resolve referrer (anti-self-referral: code must belong to a different user)
    let referralCode = clerkProfile?.referralCode ?? null;
    if (!referralCode) {
      try {
        referralCode = (await cookies()).get("huntly_ref")?.value ?? null;
      } catch {
        // cookies() only available in a request context
      }
    }

    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findByReferralCode(referralCode).catch(() => null);
      if (referrer && referrer.clerkId !== clerkUserId) {
        referredBy = referrer.id;
      }
    }

    // Race condition guard for simultaneous requests from a new user.
    let isNew = false;
    try {
      user = await db.user.create({
        data: {
          clerkId: clerkUserId,
          tokens: PLAN_LIMITS["free"],
          email: email ?? undefined,
          name: name ?? undefined,
          referralCode: generateReferralCode(),
          referredBy,
        },
      });
      isNew = true;
    } catch {
      // Another concurrent request already created the user — fetch it instead.
      const existing = await db.user.findUnique({ where: { clerkId: clerkUserId } });
      if (!existing) throw new Error("Failed to create user");
      user = existing;
    }

    if (isNew) {
      await trackEvent(user.id, "user_signed_up");
      // Create referral record if user came via a referral link
      if (referredBy) {
        await db.referral.create({ referrerUserId: referredBy, referredUserId: user.id }).catch(() => {});
      }
    }
    return user;
  }

  // Backfill referral code for existing users that don't have one yet
  if (!user.referralCode) {
    user = await db.user.update({
      where: { clerkId: clerkUserId },
      data: { referral_code: generateReferralCode() },
    }).catch(() => user!);
  }

  // Sync missing email/name from Clerk
  const needsSync =
    (clerkProfile?.email && !user.email) ||
    (clerkProfile?.name && !user.name);

  const syncPatch: Record<string, any> = {};
  if (clerkProfile?.email && !user.email) syncPatch.email = clerkProfile.email;
  if (clerkProfile?.name && !user.name) syncPatch.name = clerkProfile.name;

  // Monthly reset for FREE users only — paid users are reset via invoice.paid webhook
  // so their tokens align exactly with their Stripe billing date.
  const daysSinceReset =
    (Date.now() - new Date(user.tokensResetAt).getTime()) / 86_400_000;

  const isFreeUser = user.plan === "free" || !user.stripeSubscriptionId;

  if (isFreeUser && daysSinceReset >= 30) {
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
