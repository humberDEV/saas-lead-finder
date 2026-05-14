import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendReactivationEmail } from "@/lib/email";
import { trackEvent } from "@/lib/events";

/**
 * POST /api/cron/reactivation
 *
 * Sends a reactivation email to users who:
 *   - Registered between 3 and 7 days ago
 *   - Have never searched (searches_count = 0)
 *   - Never hit the free limit (first_limit_reached_at IS NULL)
 *   - Have an email address
 *   - Haven't already received the reactivation email (no "reactivation_email_sent" event)
 *
 * Protect with CRON_SECRET so only your scheduler can call it.
 */
export async function GET(req: Request) {
  // Vercel Cron sends the CRON_SECRET via Authorization header automatically
  // when configured in vercel.json + env vars. Also accepts x-cron-secret for manual calls.
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");
  const isVercel = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = cronHeader === process.env.CRON_SECRET;

  if (!isVercel && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Users registered 3–7 days ago, no searches, no limit hit, have email
  const { data: candidates, error } = await supabase
    .from("users")
    .select("id, email, name")
    .gte("created_at", sevenDaysAgo)
    .lte("created_at", threeDaysAgo)
    .eq("searches_count", 0)
    .is("first_limit_reached_at", null)
    .not("email", "is", null);

  if (error) {
    console.error("[cron/reactivation] Query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!candidates?.length) {
    return NextResponse.json({ sent: 0 });
  }

  // Filter out users who already got the email (check product_events)
  const ids = candidates.map((u: any) => u.id);
  const { data: alreadySent } = await supabase
    .from("product_events")
    .select("user_id")
    .eq("event", "reactivation_email_sent")
    .in("user_id", ids);

  const sentSet = new Set((alreadySent ?? []).map((r: any) => r.user_id));
  const toSend = candidates.filter((u: any) => !sentSet.has(u.id));

  let sent = 0;
  for (const user of toSend) {
    try {
      await sendReactivationEmail(user.email, user.name);
      await trackEvent(user.id, "reactivation_email_sent");
      sent++;
    } catch (err) {
      console.error("[cron/reactivation] Failed for user", user.id, err);
    }
  }

  return NextResponse.json({ sent, skipped: candidates.length - toSend.length });
}
