import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";
import { db } from "@/lib/db";
import { applyReferralCode } from "@/lib/referral";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await getOrCreateUser(userId);
  const stats = await db.referral.statsByReferrer(user.id);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const referralUrl = user.referralCode
    ? `${baseUrl}/api/ref/${user.referralCode}`
    : null;

  const canClaimReferral = !user.referredBy;
  const showReferralPrompt = canClaimReferral && user.searchesCount === 0;

  return NextResponse.json({
    referralCode: user.referralCode,
    referralUrl,
    bonusTokens: user.bonusTokens,
    stats,
    canClaimReferral,
    showReferralPrompt,
    hasReferrer: Boolean(user.referredBy),
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const raw = body.code?.trim();
  if (!raw) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const user = await getOrCreateUser(userId);
  const result = await applyReferralCode(user, raw);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    referrerName: result.referrerName,
  });
}
