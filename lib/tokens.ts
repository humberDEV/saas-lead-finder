import { clerkClient } from "@clerk/nextjs/server";
import { db } from "./db";
import { PLAN_LIMITS } from "./plans";
import { trackEvent } from "./events";
import { sendWelcomeEmail } from "./email";
import { supabase } from "./supabase";

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
    // If the caller didn't pass the profile, fetch it from Clerk so we
    // always have the email at creation time (needed for the welcome email).
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
        // Non-fatal — user still gets created, email just won't be sent now
      }
    }

    // Race condition guard: if two requests arrive simultaneously for a new user,
    // only the one that actually inserts the row should send the welcome email.
    let isNew = false;
    try {
      user = await db.user.create({
        data: {
          clerkId: clerkUserId,
          tokens: PLAN_LIMITS["free"],
          email: email ?? undefined,
          name: name ?? undefined,
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
      if (user.email) {
        await trackEvent(user.id, "welcome_email_sent");
        sendWelcomeEmail(user.email, user.name).catch(() => {});
      }
    }
    return user;
  }

  // Sync missing email/name from Clerk
  const hadEmail = !!user.email;
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

  // If email was missing at creation and just got synced, send welcome email now.
  // Guard via product_events to prevent duplicates if multiple requests race here.
  if (!hadEmail && user.email) {
    const { data: alreadySent } = await supabase
      .from("product_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event", "welcome_email_sent")
      .limit(1)
      .maybeSingle();

    if (!alreadySent) {
      await trackEvent(user.id, "welcome_email_sent");
      sendWelcomeEmail(user.email, user.name).catch(() => {});
    }
  }

  return user;
}
