import { supabase } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── helpers ──────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item) || "(none)";
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function pct(num: number, den: number) {
  if (!den) return "—";
  return ((num / den) * 100).toFixed(1) + "%";
}

// ─── data fetching ────────────────────────────────────────────────────────────

async function fetchStats() {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    { data: allUsers },
    { data: visitsToday },
    { data: visitsWeek },
    { data: newUsers30d },
    { data: subs30d },
    { data: pageViewsMonth },
  ] = await Promise.all([
    supabase.from("users").select("plan, utm_source, utm_campaign, utm_term"),
    supabase
      .from("page_views")
      .select("utm_source, session_id, country")
      .gte("created_at", todayStart),
    supabase
      .from("page_views")
      .select("utm_source, session_id, country, created_at")
      .gte("created_at", weekAgo),
    supabase
      .from("users")
      .select("id, utm_source, utm_campaign, utm_term, created_at")
      .gte("created_at", monthAgo),
    supabase
      .from("product_events")
      .select("user_id, properties, created_at")
      .eq("event", "subscription_started")
      .gte("created_at", monthAgo),
    supabase
      .from("page_views")
      .select("session_id")
      .gte("created_at", monthAgo),
  ]);

  // MRR
  const planCounts = groupBy(allUsers ?? [], (u) => u.plan);
  const planBreakdown = Object.entries(PLANS)
    .filter(([key]) => key !== "free")
    .map(([key, p]) => ({
      key,
      name: p.displayName,
      count: planCounts[key]?.length ?? 0,
      price: p.priceMonthly,
      mrr: (planCounts[key]?.length ?? 0) * p.priceMonthly,
    }))
    .filter((p) => p.count > 0);

  const totalMrr = planBreakdown.reduce((s, p) => s + p.mrr, 0);
  const totalUsers = allUsers?.length ?? 0;
  const paidUsers = (allUsers ?? []).filter((u) => u.plan !== "free").length;

  // Visits today
  const visitsTodayBySource = groupBy(
    visitsToday ?? [],
    (v) => v.utm_source ?? "organic / direct"
  );
  const visitsTodayRows = Object.entries(visitsTodayBySource)
    .map(([source, rows]) => ({
      source,
      sessions: new Set(rows.map((r) => r.session_id)).size,
      hits: rows.length,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // Visits this week by source
  const visitsWeekBySource = groupBy(
    visitsWeek ?? [],
    (v) => v.utm_source ?? "organic / direct"
  );
  const visitsWeekRows = Object.entries(visitsWeekBySource)
    .map(([source, rows]) => ({
      source,
      sessions: new Set(rows.map((r) => r.session_id)).size,
      hits: rows.length,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // Visits last 7 days — one row per day
  const dayBuckets: Record<string, Set<string>> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayBuckets[d.toISOString().slice(0, 10)] = new Set();
  }
  for (const v of visitsWeek ?? []) {
    const day = v.created_at.slice(0, 10);
    if (dayBuckets[day]) dayBuckets[day].add(v.session_id);
  }
  const visitsByDay = Object.entries(dayBuckets).map(([date, sessions]) => ({
    date,
    sessions: sessions.size,
  }));
  const maxDaySessions = Math.max(...visitsByDay.map((d) => d.sessions), 1);

  // Top countries this week
  const countryGroups = groupBy(
    visitsWeek ?? [],
    (v) => v.country ?? "Unknown"
  );
  const topCountries = Object.entries(countryGroups)
    .map(([country, rows]) => ({
      country,
      sessions: new Set(rows.map((r) => r.session_id)).size,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  // Funnel (last 30 days)
  const uniqueVisitors30d = new Set(
    (pageViewsMonth ?? []).map((v) => v.session_id)
  ).size;
  const signups30d = newUsers30d?.length ?? 0;
  const paid30d = subs30d?.length ?? 0;

  // Campaigns that converted (last 30 days)
  // Get user IDs who paid, then look up their UTMs
  const paidUserIds = new Set((subs30d ?? []).map((s) => s.user_id));
  const convertingUsers = (allUsers ?? []).filter(
    (u: any) => paidUserIds.has(u.id) && (u.utm_campaign || u.utm_source)
  );

  const campaignGroups = groupBy(
    convertingUsers,
    (u) =>
      [u.utm_campaign ?? "(none)", u.utm_source ?? "(none)", u.utm_term ?? ""]
        .join("|")
  );
  const topCampaigns = Object.entries(campaignGroups)
    .map(([key, users]) => {
      const [campaign, source, term] = key.split("|");
      return { campaign, source, term, conversions: users.length };
    })
    .sort((a, b) => b.conversions - a.conversions);

  // Registrations with UTM attribution (last 30 days)
  const registrationsBySource = groupBy(
    newUsers30d ?? [],
    (u) => u.utm_source ?? "organic / direct"
  );
  const registrationSourceRows = Object.entries(registrationsBySource)
    .map(([source, users]) => ({
      source,
      signups: users.length,
    }))
    .sort((a, b) => b.signups - a.signups);

  return {
    totalMrr,
    planBreakdown,
    totalUsers,
    paidUsers,
    visitsTodayRows,
    visitsTodayTotal: new Set((visitsToday ?? []).map((v) => v.session_id))
      .size,
    visitsWeekRows,
    visitsWeekTotal: new Set((visitsWeek ?? []).map((v) => v.session_id)).size,
    visitsByDay,
    maxDaySessions,
    topCountries,
    funnel: {
      visitors: uniqueVisitors30d,
      signups: signups30d,
      paid: paid30d,
    },
    topCampaigns,
    registrationSourceRows,
  };
}

// ─── component ────────────────────────────────────────────────────────────────

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || searchParams.key !== secret) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: 14,
          color: "#64748b",
        }}
      >
        401 Unauthorized
      </div>
    );
  }

  const stats = await fetchStats();
  const now = new Date().toUTCString();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
          Huntly Admin
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
          {now}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        <Card label="MRR" value={`$${fmt(stats.totalMrr)}`} />
        <Card label="Usuarios pagos" value={fmt(stats.paidUsers)} />
        <Card label="Total usuarios" value={fmt(stats.totalUsers)} />
      </div>

      {/* Plan breakdown */}
      {stats.planBreakdown.length > 0 && (
        <Section title="Desglose por plan">
          <Table
            cols={["Plan", "Usuarios", "Precio/mes", "MRR"]}
            rows={stats.planBreakdown.map((p) => [
              p.name,
              fmt(p.count),
              `$${p.price}`,
              `$${fmt(p.mrr)}`,
            ])}
          />
        </Section>
      )}

      {/* Traffic section */}
      <Section title="Tráfico — Hoy">
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
          {fmt(stats.visitsTodayTotal)} sesiones únicas
        </p>
        <Table
          cols={["Fuente", "Sesiones", "Pageviews"]}
          rows={stats.visitsTodayRows.map((r) => [
            r.source,
            fmt(r.sessions),
            fmt(r.hits),
          ])}
          empty="Sin visitas hoy todavía"
        />
      </Section>

      <Section title="Tráfico — Últimos 7 días">
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
          {fmt(stats.visitsWeekTotal)} sesiones únicas
        </p>

        {/* Mini bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 16 }}>
          {stats.visitsByDay.map((d) => (
            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: "100%",
                  background: "#6366f1",
                  borderRadius: 3,
                  height: Math.max(
                    3,
                    Math.round((d.sessions / stats.maxDaySessions) * 50)
                  ),
                  minHeight: d.sessions > 0 ? 3 : 0,
                }}
              />
              <span style={{ fontSize: 10, color: "#64748b" }}>
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>

        <Table
          cols={["Fuente", "Sesiones", "Pageviews"]}
          rows={stats.visitsWeekRows.map((r) => [
            r.source,
            fmt(r.sessions),
            fmt(r.hits),
          ])}
          empty="Sin datos"
        />
      </Section>

      {/* Countries */}
      {stats.topCountries.length > 0 && (
        <Section title="Países — Últimos 7 días">
          <Table
            cols={["País", "Sesiones"]}
            rows={stats.topCountries.map((c) => [c.country, fmt(c.sessions)])}
          />
        </Section>
      )}

      {/* Funnel */}
      <Section title="Embudo — Últimos 30 días">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <FunnelCard label="Visitantes únicos" value={fmt(stats.funnel.visitors)} pct="100%" />
          <FunnelCard
            label="Registros"
            value={fmt(stats.funnel.signups)}
            pct={pct(stats.funnel.signups, stats.funnel.visitors)}
          />
          <FunnelCard
            label="Pagaron"
            value={fmt(stats.funnel.paid)}
            pct={pct(stats.funnel.paid, stats.funnel.signups)}
          />
        </div>
        <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
          Visitor→registro: {pct(stats.funnel.signups, stats.funnel.visitors)} · Registro→pago: {pct(stats.funnel.paid, stats.funnel.signups)}
        </p>
      </Section>

      {/* Registrations by source */}
      {stats.registrationSourceRows.length > 0 && (
        <Section title="Registros por fuente — Últimos 30 días">
          <Table
            cols={["Fuente", "Registros"]}
            rows={stats.registrationSourceRows.map((r) => [
              r.source,
              fmt(r.signups),
            ])}
          />
        </Section>
      )}

      {/* Converting campaigns */}
      <Section title="Campañas que convierten — Últimos 30 días">
        <Table
          cols={["Campaña", "Fuente", "Keyword (utm_term)", "Conversiones"]}
          rows={stats.topCampaigns.map((c) => [
            c.campaign || "—",
            c.source || "—",
            c.term || "—",
            String(c.conversions),
          ])}
          empty="Sin conversiones atribuidas aún (requiere UTMs en URL + registro)"
          highlight={0}
        />
      </Section>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 10,
        padding: "20px 24px",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#f1f5f9" }}>
        {value}
      </p>
    </div>
  );
}

function FunnelCard({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>{label}</p>
      <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#6366f1", fontWeight: 600 }}>
        {pct}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Table({
  cols,
  rows,
  empty,
  highlight,
}: {
  cols: string[];
  rows: string[][];
  empty?: string;
  highlight?: number;
}) {
  const tdStyle = (i: number): React.CSSProperties => ({
    padding: "10px 14px",
    borderBottom: "1px solid #1e293b",
    fontSize: 13,
    color: i === highlight ? "#a5b4fc" : "#cbd5e1",
    fontWeight: i === highlight ? 600 : 400,
    textAlign: i > 0 ? "right" : "left",
    whiteSpace: "nowrap",
  });

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th
                key={c}
                style={{
                  padding: "10px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: i > 0 ? "right" : "left",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                style={{ padding: "20px 14px", fontSize: 13, color: "#475569", textAlign: "center" }}
              >
                {empty ?? "Sin datos"}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "#0f172a" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={tdStyle(ci)}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
