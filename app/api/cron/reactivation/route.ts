import { NextResponse } from "next/server";

/**
 * GET /api/cron/reactivation
 *
 * Kept as a no-op so the existing Vercel Cron remains harmless. Marketing and
 * lifecycle emails are disabled to reserve the Resend quota for billing email.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const isVercel = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = cronHeader === process.env.CRON_SECRET;

  if (!isVercel && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ sent: 0, disabled: true });
}
