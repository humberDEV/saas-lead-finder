import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendReactivationEmail } from "@/lib/email";
import { trackEvent } from "@/lib/events";

/**
 * GET /api/cron/reactivation
 *
 * Sends a reactivation email to users who:
 *   - Registered between 3 and 7 days ago
 *   - Haven't searched in the last 3 days (or never searched)
 *   - Never hit the free limit (first_limit_reached_at IS NULL)
 *   - Have an email address
 *   - Haven't already received the reactivation email
 *
 * For users who did search, personalizes the email with their last niche + city.
 * Vercel Cron calls this daily at 10:00 UTC via vercel.json.
 */
export async function GET(req: Request) {
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

  // Users registered 3–7 days ago, no limit hit, have email,
  // and haven't searched in the last 3 days (last_search_at is null or older than 3 days ago)
  const { data: candidates, error } = await supabase
    .from("users")
    .select("id, email, name, tokens, last_search_at")
    .gte("created_at", sevenDaysAgo)
    .lte("created_at", threeDaysAgo)
    .is("first_limit_reached_at", null)
    .not("email", "is", null)
    .or(`last_search_at.is.null,last_search_at.lte.${threeDaysAgo}`);

  if (error) {
    console.error("[cron/reactivation] Query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!candidates?.length) {
    return NextResponse.json({ sent: 0 });
  }

  // Filter out users who already got the email
  const ids = candidates.map((u: any) => u.id);
  const { data: alreadySent } = await supabase
    .from("product_events")
    .select("user_id")
    .eq("event", "reactivation_email_sent")
    .in("user_id", ids);

  const sentSet = new Set((alreadySent ?? []).map((r: any) => r.user_id));
  const toSend = candidates.filter((u: any) => !sentSet.has(u.id));

  if (!toSend.length) {
    return NextResponse.json({ sent: 0, skipped: candidates.length });
  }

  // Fetch last search for users who have searched at least once
  const searchedIds = toSend
    .filter((u: any) => u.last_search_at !== null)
    .map((u: any) => u.id);

  const lastSearchMap = new Map<string, { niche: string; city: string }>();

  if (searchedIds.length > 0) {
    // One query per user isn't ideal but Supabase doesn't support DISTINCT ON easily;
    // fetch all recent searches and keep the latest per user
    const { data: recentSearches } = await supabase
      .from("search_history")
      .select("user_id, niche, city, created_at")
      .in("user_id", searchedIds)
      .order("created_at", { ascending: false });

    for (const row of recentSearches ?? []) {
      if (!lastSearchMap.has(row.user_id)) {
        lastSearchMap.set(row.user_id, { niche: row.niche, city: row.city });
      }
    }
  }

  let sent = 0;
  for (const user of toSend) {
    try {
      const lastSearch = lastSearchMap.get(user.id) ?? null;
      await sendReactivationEmail(user.email, user.name, lastSearch, user.tokens);
      await trackEvent(user.id, "reactivation_email_sent");
      sent++;
    } catch (err) {
      console.error("[cron/reactivation] Failed for user", user.id, err);
    }
  }

  return NextResponse.json({ sent, skipped: candidates.length - toSend.length });
}
