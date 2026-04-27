import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/tokens";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await getOrCreateUser(userId);
    if (user.plan === "free") return NextResponse.json([]);
    const history = await db.searchHistory.findByUser({ userId: user.id, limit: 40 });
    return NextResponse.json(history);
  } catch {
    return NextResponse.json([]);
  }
}
