"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Target, Phone, Clock, Briefcase,
  ArrowRight, Sparkles, AlertCircle, CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../SidebarContext";

interface Stats {
  searchesThisMonth: number;
  opportunitiesFound: number;
  totalLeads: number;
  pending: number;
  contacted: number;
  interested: number;
  closed: number;
  discarded: number;
  pctStrong: number;
  plan: string;
}

// ── Donut chart (pure SVG, no dependency) ────────────────────────────────────
function DonutChart({
  segments,
  total,
}: {
  segments: { color: string; value: number }[];
  total: number;
}) {
  const R = 38;
  const cx = 50, cy = 50;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  const slices = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const slice = {
        ...s,
        dashArray: `${frac * circ} ${circ}`,
        dashOffset: -(offset * circ),
      };
      offset += frac;
      return slice;
    });

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-zinc-600 text-center">Sin leads aún.<br />Guarda tu primera oportunidad.</p>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1a1a2a" strokeWidth="14" />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={s.color}
          strokeWidth="12"
          strokeDasharray={s.dashArray}
          strokeDashoffset={s.dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="17" fontWeight="bold" fontFamily="ui-sans-serif,system-ui,sans-serif">
        {total}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="ui-sans-serif,system-ui,sans-serif">
        leads
      </text>
    </svg>
  );
}

// ── Recommendations ───────────────────────────────────────────────────────────
const RECS: { condition: (s: Stats) => boolean; textFn: (s: Stats) => string }[] = [
  {
    condition: (s) => s.searchesThisMonth === 0,
    textFn: () => "No has hecho búsquedas este mes. Lanza una ahora y encuentra tu próximo cliente.",
  },
  {
    condition: (s) => s.totalLeads > 0 && s.contacted === 0,
    textFn: (s) => `Tienes ${s.pending} leads pendientes sin contactar. Empieza por los de score verde.`,
  },
  {
    condition: (s) => s.pctStrong < 30 && s.searchesThisMonth > 2,
    textFn: () => "Pocas oportunidades fuertes. Prueba con clínicas, abogados, nutricionistas o talleres en ciudades medianas.",
  },
  {
    condition: (s) => s.contacted > 0 && s.interested === 0,
    textFn: () => "Has contactado negocios pero ninguno marcado como interesado. Revisa tu mensaje de apertura.",
  },
  {
    condition: (s) => s.closed > 0,
    textFn: (s) => `Tienes ${s.closed} lead${s.closed > 1 ? "s" : ""} cerrado${s.closed > 1 ? "s" : ""}. Pide una recomendación — es la forma más barata de conseguir el siguiente.`,
  },
];

function getRecommendation(s: Stats): string {
  for (const r of RECS) {
    if (r.condition(s)) return r.textFn(s);
  }
  return "Sigue prospectando. Cuantas más búsquedas, más probabilidades de encontrar el lead perfecto.";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-neutral-900/60 border border-neutral-800 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-56 bg-neutral-900/60 border border-neutral-800 rounded-2xl animate-pulse" />
        <div className="h-56 bg-neutral-900/60 border border-neutral-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { plan, credits } = useSidebar();
  const { user } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.firstName || user?.username || "ahí";
  const monthLabel = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const donutSegments = stats
    ? [
        { color: "#f59e0b", value: stats.pending },
        { color: "#6366f1", value: stats.contacted },
        { color: "#3b82f6", value: stats.interested },
        { color: "#10b981", value: stats.closed },
      ]
    : [];

  const pipeline = stats
    ? [
        { label: "Pendientes",  value: stats.pending,   color: "bg-amber-500",   textColor: "text-amber-400",   track: "bg-amber-500/15" },
        { label: "Contactados", value: stats.contacted, color: "bg-indigo-500",  textColor: "text-indigo-400",  track: "bg-indigo-500/15" },
        { label: "Interesados", value: stats.interested,color: "bg-blue-500",    textColor: "text-blue-400",    track: "bg-blue-500/15" },
        { label: "Cerrados",    value: stats.closed,    color: "bg-emerald-500", textColor: "text-emerald-400", track: "bg-emerald-500/15" },
      ]
    : [];

  const pipelineMax = Math.max(...pipeline.map((p) => p.value), 1);

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.07),transparent)]">
      <main className="max-w-4xl mx-auto p-6 md:p-10 pb-24">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
          <p className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1 capitalize">{monthLabel}</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Hola, {firstName}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Aquí tienes tu resumen de oportunidades.</p>
        </motion.div>

        {/* ── Primary CTA ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="mb-8">
          <Link
            href="/search"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            <Search className="w-4 h-4" />
            Nueva búsqueda
            {credits !== null && credits > 0 && (
              <span className="bg-white/15 px-2 py-0.5 rounded-lg text-xs font-bold">{credits} restantes</span>
            )}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <Skeleton />
        ) : stats ? (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: <Search className="w-4 h-4 text-indigo-400" />, bg: "bg-indigo-500/10 border-indigo-500/20", label: "Búsquedas", value: stats.searchesThisMonth, sub: "este mes" },
                { icon: <Target className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10 border-emerald-500/20", label: "Oportunidades", value: stats.opportunitiesFound, sub: "analizadas" },
                { icon: <Briefcase className="w-4 h-4 text-violet-400" />, bg: "bg-violet-500/10 border-violet-500/20", label: "En cartera", value: stats.totalLeads, sub: "leads guardados" },
                { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10 border-emerald-500/20", label: "Cerrados", value: stats.closed, sub: "clientes ganados" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 + i * 0.05 }}
                  className={`rounded-2xl border p-4 ${card.bg}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white leading-none">{card.value}</p>
                  <p className="text-xs font-semibold text-zinc-400 mt-1">{card.label}</p>
                  <p className="text-[10px] text-zinc-600">{card.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* ── Charts row ── */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">

              {/* Donut */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.28 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
              >
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-4">Distribución de leads</p>
                <div className="flex items-center gap-5">
                  <div className="w-32 h-32 shrink-0">
                    <DonutChart segments={donutSegments} total={stats.totalLeads} />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    {[
                      { label: "Pendientes",  value: stats.pending,   color: "bg-amber-500" },
                      { label: "Contactados", value: stats.contacted, color: "bg-indigo-500" },
                      { label: "Interesados", value: stats.interested,color: "bg-blue-500" },
                      { label: "Cerrados",    value: stats.closed,    color: "bg-emerald-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                        <span className="text-xs text-zinc-400 flex-1 truncate">{item.label}</span>
                        <span className="text-xs font-bold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Pipeline funnel */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.34 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
              >
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-4">Pipeline de ventas</p>
                <div className="space-y-3">
                  {pipeline.map((stage, i) => (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-zinc-400">{stage.label}</span>
                        <span className={`text-xs font-black ${stage.textColor}`}>{stage.value}</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.value / pipelineMax) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                          className={`h-full rounded-full ${stage.color}`}
                        />
                      </div>
                    </div>
                  ))}
                  {stats.totalLeads === 0 && (
                    <p className="text-xs text-zinc-600 text-center pt-4">
                      Guarda leads desde la búsqueda para verlos aquí.
                    </p>
                  )}
                </div>
              </motion.div>

            </div>

            {/* ── Recommendation ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="flex items-start gap-3 bg-indigo-500/8 border border-indigo-500/15 rounded-2xl px-5 py-4 mb-6"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">{getRecommendation(stats)}</p>
            </motion.div>

            {/* ── Quick nav tiles ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="grid sm:grid-cols-3 gap-3"
            >
              <Link href="/search" className="group flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl p-4 transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Buscar leads</p>
                  <p className="text-[11px] text-zinc-600">{stats.searchesThisMonth} este mes</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-indigo-400 ml-auto transition-colors" />
              </Link>

              <Link href="/crm" className="group flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 hover:border-violet-500/30 rounded-2xl p-4 transition-all">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Mi Cartera</p>
                  <p className="text-[11px] text-zinc-600">{stats.totalLeads} leads</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-violet-400 ml-auto transition-colors" />
              </Link>

              <Link href="/pricing" className="group flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/30 rounded-2xl p-4 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Planes</p>
                  <p className="text-[11px] text-zinc-600 capitalize">{plan === "free" ? "Actualizar" : `Plan ${plan}`}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 ml-auto transition-colors" />
              </Link>
            </motion.div>

          </>
        ) : null}

        {/* ── Free upsell ── */}
        {!loading && plan === "free" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-5 flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl px-5 py-4"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300 mb-0.5">Plan gratuito</p>
              <p className="text-xs text-amber-400/70">El historial, la cartera y el seguimiento de leads están disponibles en los planes Go y Pro.</p>
            </div>
            <Link href="/pricing" className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap">
              Ver planes <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}

      </main>
    </div>
  );
}
