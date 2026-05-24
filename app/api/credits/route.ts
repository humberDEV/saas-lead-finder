import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getOrCreateUser } from "@/lib/tokens";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/events";
import { getDemoQuotaForUser } from "@/lib/demo-quota";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined;
    const name = clerkUser?.firstName
      ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
      : undefined;

    const cookieStore = await cookies();
    const referralCode = cookieStore.get("huntly_ref")?.value ?? undefined;

    const user = await getOrCreateUser(userId, { email, name, referralCode });

    // Update last_login_at + track login (at most once per session via client cache)
    await db.user.update({
      where: { clerkId: userId },
      data: { last_login_at: new Date().toISOString() },
    }).catch(() => {});

    await trackEvent(user.id, "user_logged_in").catch(() => {});

    const demoQuota = await getDemoQuotaForUser(
      user.id,
      user.plan ?? "free",
      user.tokensResetAt
    );

    return NextResponse.json({
      remaining: user.tokens,
      bonusTokens: user.bonusTokens,
      totalRemaining: user.tokens + user.bonusTokens,
      plan: user.plan,
      demoQuota,
    });
  } catch {
    return NextResponse.json({ remaining: null, plan: "free" });
  }
}
