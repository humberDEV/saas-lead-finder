import { cookies } from "next/headers";
import { db } from "./db";
import { trackEvent } from "./events";

export type ApplyReferralResult =
  | { ok: true; referrerName: string | null }
  | { ok: false; error: "invalid_code" | "already_referred" | "self_referral" };

/** Normalizes pasted referral links or raw codes to an uppercase code. */
export function parseReferralCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/\/api\/ref\/([A-Za-z0-9]+)/i);
  if (urlMatch) return urlMatch[1].toUpperCase();

  const clean = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length >= 6 && clean.length <= 16) return clean;
  return null;
}

export async function applyReferralCode(
  user: { id: string; clerkId: string; referredBy: string | null },
  rawInput: string
): Promise<ApplyReferralResult> {
  if (user.referredBy) return { ok: false, error: "already_referred" };

  const code = parseReferralCode(rawInput);
  if (!code) return { ok: false, error: "invalid_code" };

  const referrer = await db.user.findByReferralCode(code).catch(() => null);
  if (!referrer) return { ok: false, error: "invalid_code" };
  if (referrer.clerkId === user.clerkId || referrer.id === user.id) {
    return { ok: false, error: "self_referral" };
  }

  const existingReferral = await db.referral.findUnpaidByReferredUser(user.id).catch(() => null);
  if (existingReferral) return { ok: false, error: "already_referred" };

  await db.user.update({
    where: { id: user.id },
    data: { referred_by: referrer.id },
  });

  await db.referral
    .create({ referrerUserId: referrer.id, referredUserId: user.id })
    .catch(() => {});

  try {
    const cookieStore = await cookies();
    cookieStore.set("huntly_ref", code, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  } catch {
    // cookies() only in request context
  }

  await trackEvent(user.id, "referral_code_claimed", { referrerId: referrer.id }).catch(() => {});

  return { ok: true, referrerName: referrer.name ?? null };
}
