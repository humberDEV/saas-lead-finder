"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Target, Phone, Clock, TrendingUp, Briefcase,
  ArrowRight, Sparkles, CheckCircle, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
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

const RECOMMENDATIONS = [
  {
    condition: (s: Stats) => s.opportunitiesFound > 0 && s.contacted === 0,
    text: "Tienes oportunidades guardadas sin contactar. Empieza por las que tienen score verde — son las de mayor potencial.",
  },
  {
    condition: (s: Stats) => s.pctStrong < 30 && s.searchesThisMonth > 2,
    text: "Tus últimas búsquedas tienen pocas oportunidades fuertes. Prueba con clínicas, abogados, nutricionistas o talleres en ciudades medianas.",
  },
  {
    condition: (s: Stats) => s.pending > 10,
    text: `Tienes ${0} leads pendientes acumulados. Dedica 20 min hoy a contactar los 3 con mayor score.`,
    textFn: (s: Stats) =>
      `Tienes ${s.pending} leads pendientes acumulados. Dedica 20 min hoy a contactar los 3 con mayor score.`,
  },
  {
    condition: (s: Stats) => s.contacted > 0 && s.interested === 0,
    text: "Has contactado negocios pero ninguno marcado como interesado. Revisa si necesitas cambiar el mensaje de apertura.",
  },
  {
    condition: (s: Stats) => s.searchesThisMonth === 0,
    text: "No has hecho búsquedas este mes. Lanza una búsqueda ahora y encuentra tu próximo cliente.",
  },
  {
    condition: (s: Stats) => s.closed > 0,
    text: "Tienes leads cerrados. Pide una recomendación a esos clientes — es la forma más barata de conseguir el siguiente.",
  },
];

function getRecommendation(stats: Stats): string {
  for (const rec of RECOMMENDATIONS) {
    if (rec.condition(stats)) {
      return rec.textFn ? rec.textFn(stats) : rec.text;
    }
  }
  return "Sigue buscando nichos nuevos. Cuantas más búsquedas, más datos tienes para elegir a quién contactar primero.";
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs font-semibold text-zinc-400 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function DashboardHome() {
  const { plan } = useSidebar();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const recommendation = stats ? getRecommendation(stats) : null;

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.06),transparent)]">
      <main className="max-w-4xl mx-auto p-6 md:p-10 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <p className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-2">
            {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Tu panel de <span className="text-indigo-400">oportunidades</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Mide tu actividad, gestiona tus leads y cierra más clientes.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8"
        >
          <Link
            href="/search"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-black font-black text-sm rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4" />
            Nueva búsqueda
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<Search className="w-4 h-4 text-indigo-400" />}
                label="Búsquedas este mes"
                value={stats.searchesThisMonth}
                color="bg-indigo-500/15"
                delay={0.08}
              />
              <StatCard
                icon={<Target className="w-4 h-4 text-emerald-400" />}
                label="Oportunidades encontradas"
                value={stats.opportunitiesFound}
                sub="negocios analizados"
                color="bg-emerald-500/15"
                delay={0.12}
              />
              <StatCard
                icon={<Briefcase className="w-4 h-4 text-violet-400" />}
                label="Leads en cartera"
                value={stats.totalLeads}
                color="bg-violet-500/15"
                delay={0.16}
              />
              <StatCard
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                label="Pendientes de contactar"
                value={stats.pending}
                color="bg-amber-500/15"
                delay={0.20}
              />
              <StatCard
                icon={<Phone className="w-4 h-4 text-blue-400" />}
                label="Contactados"
                value={stats.contacted}
                sub={`${stats.interested} interesados · ${stats.closed} cerrados`}
                color="bg-blue-500/15"
                delay={0.24}
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 text-rose-400" />}
                label="Oportunidades fuertes"
                value={`${stats.pctStrong}%`}
                sub="score ≥ 80 en cartera"
                color="bg-rose-500/15"
                delay={0.28}
              />
            </div>

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="flex items-start gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-5 py-4 mb-8"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-200 leading-relaxed">{recommendation}</p>
            </motion.div>
          </>
        ) : null}

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          <Link
            href="/crm"
            className="group flex items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl p-5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Mi Cartera</p>
                <p className="text-xs text-zinc-500">
                  {stats ? `${stats.totalLeads} leads guardados` : "Gestiona tus leads"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            href="/search"
            className="group flex items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/30 rounded-2xl p-5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Search className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Buscar leads</p>
                <p className="text-xs text-zinc-500">
                  {stats ? `${stats.searchesThisMonth} búsquedas este mes` : "Encuentra nuevas oportunidades"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </Link>
        </motion.div>

        {/* Plan upsell for free users */}
        {plan === "free" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-6 flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl px-5 py-4"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300 mb-0.5">Estás en el plan gratuito</p>
              <p className="text-xs text-amber-400/70 leading-relaxed">
                El historial, la cartera completa y el seguimiento de oportunidades están disponibles en los planes de pago.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              Ver planes <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}

      </main>
    </div>
  );
}
