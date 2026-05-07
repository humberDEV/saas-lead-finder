import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";
import { supabase } from "@/lib/supabase";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await getOrCreateUser(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const cutoff14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const { data: historyRows } = await supabase
      .from("search_history")
      .select("niche, city, result_count, results, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    const rows = historyRows ?? [];
    const searchesThisMonth = rows.filter(
      (r) => new Date(r.created_at) >= startOfMonth
    ).length;
    const totalSearches = rows.length;
    const planLimit = PLAN_LIMITS[user.plan] ?? 5;

    let noWebsiteFound = 0;
    let contactableLeads = 0;
    let whatsappCount = 0;

    const nicheData: Record<string, { searches: number; total: number; whatsapp: number }> = {};
    const dayMap: Record<string, { searches: number; opportunities: number }> = {};

    for (const row of rows) {
      const results: any[] = Array.isArray(row.results) ? row.results : [];
      const rowDate = new Date(row.created_at);
      const dateKey = rowDate.toISOString().split("T")[0];
      const niche = (row.niche ?? "").trim();

      // Activity chart — last 14 days
      if (rowDate >= cutoff14) {
        if (!dayMap[dateKey]) dayMap[dateKey] = { searches: 0, opportunities: 0 };
        dayMap[dateKey].searches++;
        dayMap[dateKey].opportunities += results.filter((r) => r.score >= 40).length;
      }

      for (const r of results) {
        if (!r.has_website) noWebsiteFound++;
        if (r.phone && r.score > 0) contactableLeads++;
        if (r.has_whatsapp === true) whatsappCount++;
      }

      if (niche) {
        if (!nicheData[niche]) nicheData[niche] = { searches: 0, total: 0, whatsapp: 0 };
        nicheData[niche].searches++;
        nicheData[niche].total += results.length;
        nicheData[niche].whatsapp += results.filter((r) => r.has_whatsapp === true).length;
      }
    }

    // Last 14 days activity
    const activityByDay: { date: string; searches: number; opportunities: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      activityByDay.push({
        date: dateKey,
        searches: dayMap[dateKey]?.searches ?? 0,
        opportunities: dayMap[dateKey]?.opportunities ?? 0,
      });
    }

    // Top 5 niches by WhatsApp rate (directly actionable metric)
    const topNiches = Object.entries(nicheData)
      .map(([niche, v]) => ({
        niche,
        searches: v.searches,
        whatsappRate: v.total > 0 ? Math.round((v.whatsapp / v.total) * 100) : 0,
        avgResults: v.searches > 0 ? Math.round(v.total / v.searches) : 0,
      }))
      .sort((a, b) => b.whatsappRate - a.whatsappRate || b.searches - a.searches)
      .slice(0, 5);

    // Last 5 searches with per-search breakdown
    const recentSearches = rows.slice(0, 5).map((row) => {
      const results: any[] = Array.isArray(row.results) ? row.results : [];
      return {
        niche: row.niche ?? "",
        city: row.city ?? "",
        total: results.length,
        noWeb: results.filter((r) => !r.has_website).length,
        whatsapp: results.filter((r) => r.has_whatsapp === true).length,
        contactable: results.filter((r) => r.phone && r.score > 0).length,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({
      searchesThisMonth,
      totalSearches,
      noWebsiteFound,
      contactableLeads,
      whatsappCount,
      planLimit,
      plan: user.plan,
      activityByDay,
      topNiches,
      recentSearches,
    });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
