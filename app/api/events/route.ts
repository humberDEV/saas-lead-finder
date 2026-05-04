import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { trackEvent, type ProductEvent } from "@/lib/events";

const ALLOWED_EVENTS: ProductEvent[] = ["paywall_viewed"];

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { event, properties } = await request.json();
  if (!ALLOWED_EVENTS.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (user) {
    await trackEvent(user.id, event, properties);
  }

  return NextResponse.json({ ok: true });
}
