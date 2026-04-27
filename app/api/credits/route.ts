import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await getOrCreateUser(userId);
    return NextResponse.json({
      remaining: user.tokens,
      plan: user.plan,
    });
  } catch {
    return NextResponse.json({ remaining: null, plan: "free" });
  }
}
