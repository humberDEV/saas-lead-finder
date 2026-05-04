import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/events";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined;
    const name = clerkUser?.firstName
      ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
      : undefined;

    const user = await getOrCreateUser(userId, { email, name });

    // Update last_login_at + track login (at most once per session via client cache)
    await db.user.update({
      where: { clerkId: userId },
      data: { last_login_at: new Date().toISOString() },
    }).catch(() => {});

    await trackEvent(user.id, "user_logged_in").catch(() => {});

    return NextResponse.json({
      remaining: user.tokens,
      plan: user.plan,
    });
  } catch {
    return NextResponse.json({ remaining: null, plan: "free" });
  }
}
