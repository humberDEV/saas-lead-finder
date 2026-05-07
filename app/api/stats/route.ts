import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await getOrCreateUser(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Searches this month
    const { data: historyRows } = await supabase
      .from("search_history")
      .select("result_count, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth);

    const searchesThisMonth = historyRows?.length ?? 0;
    const opportunitiesFound = historyRows?.reduce((sum, r) => sum + (r.result_count ?? 0), 0) ?? 0;

    // Saved leads stats
    const { data: leadRows } = await supabase
      .from("saved_leads")
      .select("status, score, temperature")
      .eq("user_id", user.id);

    const leads = leadRows ?? [];
    const totalLeads = leads.length;
    const pending = leads.filter((l) => l.status === "PENDIENTE").length;
    const contacted = leads.filter((l) =>
      ["CONTACTADO", "EN_CONTACTO", "INTERESADO", "CERRADO"].includes(l.status)
    ).length;
    const interested = leads.filter((l) => l.status === "INTERESADO").length;
    const closed = leads.filter((l) => l.status === "CERRADO").length;
    const discarded = leads.filter((l) => l.status === "DESCARTADO").length;

    // % strong opportunities (score >= 80 = "Oportunidad ideal" or "Ticket alto")
    const strongLeads = leads.filter((l) => l.score >= 80).length;
    const pctStrong = totalLeads > 0 ? Math.round((strongLeads / totalLeads) * 100) : 0;

    return NextResponse.json({
      searchesThisMonth,
      opportunitiesFound,
      totalLeads,
      pending,
      contacted,
      interested,
      closed,
      discarded,
      pctStrong,
      plan: user.plan,
    });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
