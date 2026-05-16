"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search, Target, Phone, Sparkles, ArrowRight,
  Building2, TrendingUp, MapPin, Layers, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useTranslations, useLocale } from "next-intl";
import { useSidebar } from "../SidebarContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RecentSearch {
  niche: string;
  city: string;
  total: number;
  noWeb: number;
  whatsapp: number;
  contactable: number;
  createdAt: string;
}

interface IntelligenceData {
  searchesThisMonth: number;
  totalSearches: number;
  noWebsiteFound: number;
  contactableLeads: number;
  whatsappCount: number;
  planLimit: number;
  plan: string;
  activityByDay: { date: string; searches: number; opportunities: number }[];
  topNiches: { niche: string; searches: number; whatsappRate: number; avgResults: number }[];
  recentSearches: RecentSearch[];
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 28 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const iRef = useRef(0);

  useEffect(() => {
    if (!text) return;
    iRef.current = 0;
    setDisplayed("");
    setDone(false);

    const tick = setInterval(() => {
      iRef.current++;
      setDisplayed(text.slice(0, iRef.current));
      if (iRef.current >= text.length) {
        clearInterval(tick);
        setTimeout(() => setDone(true), 700);
      }
    }, speed);

    return () => clearInterval(tick);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <span className="inline-block w-[2px] h-6 bg-indigo-400 ml-0.5 align-middle animate-pulse" />
      )}
    </span>
  );
}

// ── Activity bar chart ────────────────────────────────────────────────────────
const CHART_H = 72;
const BAR_MAX = 60;

function ActivityChart({
  data,
  emptyLabel,
  locale,
}: {
  data: { date: string; opportunities: number }[];
  emptyLabel: string;
  locale: string;
}) {
  const max = Math.max(...data.map((d) => d.opportunities), 1);
  const todayKey = new Date().toISOString().split("T")[0];
  const hasAny = data.some((d) => d.opportunities > 0);

  return (
    <div>
      <div className="flex items-end gap-[3px] w-full" style={{ height: CHART_H }}>
        {data.map((d, i) => {
          const isToday = d.date === todayKey;
          const heightPx = d.opportunities > 0
            ? Math.max(Math.round((d.opportunities / max) * BAR_MAX), 8)
            : 3;

          return (
            <motion.div
              key={d.date}
              initial={{ height: 0 }}
              animate={{ height: heightPx }}
              transition={{ duration: 0.5, delay: i * 0.018, ease: "easeOut" }}
              className={`flex-1 rounded-[3px] ${
                d.opportunities > 0
                  ? isToday
                    ? "bg-indigo-400"
                    : "bg-indigo-600/60 hover:bg-indigo-500/70 transition-colors"
                  : "bg-neutral-800/70"
              }`}
            />
          );
        })}
      </div>

      <div className="flex mt-2">
        {data.map((d, i) => {
          const show = i === 0 || i === 6 || i === 13;
          return (
            <div key={d.date} className="flex-1 text-center">
              {show && (
                <span
                  className={`text-[9px] ${
                    d.date === todayKey ? "text-indigo-400 font-bold" : "text-zinc-700"
                  }`}
                >
                  {new Date(d.date + "T12:00:00").toLocaleDateString(locale, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!hasAny && (
        <p className="text-xs text-zinc-600 text-center mt-3">{emptyLabel}</p>
      )}
    </div>
  );
}

// ── Horizontal ranked bars ────────────────────────────────────────────────────
function RankedBars({
  items,
  barColor,
  emptyLabel,
}: {
  items: { label: string; rate: number; sub: string }[];
  barColor: string;
  emptyLabel: string;
}) {
  const maxRate = Math.max(...items.map((i) => i.rate), 1);

  if (items.length === 0) {
    return (
      <p className="text-xs text-zinc-600 py-6 text-center leading-relaxed">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-200 truncate flex-1 mr-3 leading-tight">
              {item.label}
            </span>
            <span className="text-xs font-black text-white shrink-0">
              {item.rate}%
            </span>
          </div>
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.rate / maxRate) * 100}%` }}
              transition={{ duration: 0.65, delay: 0.3 + i * 0.07, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Progress ring (SVG) ───────────────────────────────────────────────────────
function ProgressRing({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const r = 15;
  const circ = 2 * Math.PI * r;
  const stroke = pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#6366f1";

  return (
    <svg width="38" height="38" className="-rotate-90">
      <circle cx="19" cy="19" r={r} fill="none" stroke="#1e1e2e" strokeWidth="3" />
      <circle
        cx="19" cy="19" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Related niches map ────────────────────────────────────────────────────────
const RELATED: Record<string, string[]> = {
  "Abogados": ["Gestorías", "Asesorías fiscales", "Notarías"],
  "Clínicas Dentales": ["Fisioterapeutas", "Psicólogos", "Nutricionistas"],
  "Dentistas": ["Fisioterapeutas", "Psicólogos", "Nutricionistas"],
  "Peluquerías": ["Barberías", "Centros de Estética"],
  "Barberías": ["Peluquerías", "Centros de Estética"],
  "Centros de Estética": ["Peluquerías", "Barberías"],
  "Restaurantes": ["Cafeterías", "Catering", "Pastelerías"],
  "Gimnasios": ["Yoga y Pilates", "Entrenadores Personales", "Nutricionistas"],
  "Yoga y Pilates": ["Gimnasios", "Fisioterapeutas", "Nutricionistas"],
  "Fisioterapeutas": ["Psicólogos", "Nutricionistas"],
  "Psicólogos": ["Fisioterapeutas", "Coaching", "Nutricionistas"],
  "Fontaneros": ["Electricistas", "Reformas"],
  "Electricistas": ["Fontaneros", "Reformas", "Instaladores de Alarmas"],
  "Talleres": ["Autoescuelas", "Seguros"],
  "Fotógrafos": ["Videógrafos", "Diseño gráfico"],
  "Contabilidad": ["Gestorías", "Asesorías fiscales", "Abogados"],
  "Inmobiliarias": ["Arquitectos", "Reformas"],
  // English
  "Lawyers & Legal Advisors": ["Accounting & Tax Services", "Insurance"],
  "Dental Clinics": ["Physiotherapists", "Psychologists & Therapists", "Nutritionists & Dietitians"],
  "Barbershops": ["Hair Salons", "Beauty Centers"],
  "Hair Salons": ["Barbershops", "Beauty Centers"],
  "Gyms & CrossFit": ["Yoga & Pilates Studios", "Personal Trainers"],
  "Yoga & Pilates Studios": ["Gyms & CrossFit", "Physiotherapists"],
  "Plumbers": ["Electricians", "Home Renovation & Construction"],
  "Electricians": ["Plumbers", "Alarm Installers"],
  "Restaurants & Cafés": ["Catering", "Bakeries"],
  "Photographers": ["Videographers"],
};

function getRelated(niche: string): string[] {
  if (RELATED[niche]) return RELATED[niche].slice(0, 3);
  for (const [key, values] of Object.entries(RELATED)) {
    if (
      niche.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(niche.toLowerCase())
    ) {
      return values.slice(0, 3);
    }
  }
  return [];
}

// ── Recommendations ───────────────────────────────────────────────────────────
interface Rec {
  text: string;
  niche?: string;
  city?: string;
}

interface RecT {
  firstSearch: string;
  defaultRec: string;
  related: (niche: string, where: string, suggestion: string, extra: string) => string;
  sameCity: (city: string) => string;
  sameNiches: (count: number, city: string) => string;
  inCity: (city: string) => string;
  also: (suggestion: string) => string;
}

function buildRecs(d: IntelligenceData, tRec: RecT): Rec[] {
  if (d.totalSearches === 0) {
    return [{ text: tRec.firstSearch }];
  }

  const recs: Rec[] = [];

  const searchedNiches = new Set(d.topNiches.map((n) => n.niche.toLowerCase()));
  const topNiche = d.topNiches[0];
  if (topNiche) {
    const suggestions = getRelated(topNiche.niche).filter(
      (r) => !searchedNiches.has(r.toLowerCase())
    );
    if (suggestions.length > 0) {
      const topCity = d.recentSearches[0]?.city;
      const where = topCity ? tRec.inCity(topCity) : "";
      const suggested = suggestions[0];
      const extra = suggestions[1] ? tRec.also(suggestions[1]) : "";
      recs.push({
        text: tRec.related(topNiche.niche, where, suggested, extra),
        niche: suggested,
        city: topCity,
      });
    }
  }

  const topCity = d.recentSearches[0]?.city ?? "";
  const isGenericCity = topCity && !topCity.includes(",") && topCity.split(" ").length <= 2;
  const sameCity = d.recentSearches.length >= 2 &&
    d.recentSearches.every((s) => s.city.toLowerCase() === topCity.toLowerCase());
  if (isGenericCity && sameCity && recs.length < 2) {
    recs.push({ text: tRec.sameCity(topCity) });
  }

  if (d.topNiches.length >= 3 && sameCity && recs.length < 2) {
    recs.push({ text: tRec.sameNiches(d.topNiches.length, topCity) });
  }

  if (recs.length === 0) {
    recs.push({ text: tRec.defaultRec });
  }

  return recs.slice(0, 2);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-neutral-900/60 border border-neutral-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-32 bg-neutral-900/60 border border-neutral-800 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-52 bg-neutral-900/60 border border-neutral-800 rounded-2xl" />
        <div className="h-52 bg-neutral-900/60 border border-neutral-800 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { plan, credits } = useSidebar();
  const { user, isLoaded: userLoaded } = useUser();
  const t = useTranslations("dashboardHome");
  const locale = useLocale();
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greetingText, setGreetingText] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!userLoaded) return;
    const name = user?.firstName || user?.username || "ahí";
    const h = new Date().getHours();
    const day = new Date().getDay();

    const days = t.raw("greetingDays") as string[];
    const d = days[day];
    const dc = d.charAt(0).toUpperCase() + d.slice(1);
    const tg =
      h < 6  ? t("greetingLateNight") :
      h < 12 ? t("greetingMorning") :
      h < 20 ? t("greetingAfternoon") : t("greetingEvening");

    const sub = (s: string) =>
      s.replace(/{tg}/g, tg)
       .replace(/{name}/g, name)
       .replace(/{d}/g, d)
       .replace(/{dc}/g, dc);

    const base = (t.raw("greetingBase") as string[]).map(sub);
    const dayExtras = (t.raw(`greetingByDay${day}`) as string[]).map(sub);
    const extras: string[] = [...dayExtras];
    if (h < 6)  extras.push(...(t.raw("greetingLateNightExtras") as string[]).map(sub));
    if (h >= 22) extras.push(...(t.raw("greetingLateExtras") as string[]).map(sub));

    const pool = [...base, ...extras];
    setGreetingText(pool[Math.floor(Math.random() * pool.length)]);
  }, [userLoaded, user, t]);

  const tRec: RecT = {
    firstSearch: t("recFirstSearch"),
    defaultRec: t("recDefault"),
    related: (niche, where, suggestion, extra) =>
      t("recRelated", { niche, where, suggestion, extra }),
    sameCity: (city) => t("recSameCity", { city }),
    sameNiches: (count, city) => t("recSameNiches", { count, city }),
    inCity: (city) => t("recIn", { city }),
    also: (suggestion) => t("recAlso", { suggestion }),
  };

  const recs = data ? buildRecs(data, tRec) : [];
  const monthLabel = new Date().toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(99,102,241,0.07),transparent)]">
      <main className="max-w-4xl mx-auto p-6 md:p-10 pb-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between gap-4 mb-8 flex-wrap"
        >
          <div>
            <p className="text-[10px] font-mono text-indigo-500/70 uppercase tracking-widest mb-1 capitalize">
              {monthLabel}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight min-h-[2rem]">
              {greetingText ? <Typewriter text={greetingText} /> : "\u00A0"}
            </h1>
            <p className="text-zinc-600 text-xs mt-1">{t("radar")}</p>
          </div>
          <Link
            href="/search"
            className="group flex items-center gap-2.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl transition-all shadow-[0_0_24px_rgba(99,102,241,0.28)] hover:shadow-[0_0_36px_rgba(99,102,241,0.45)] shrink-0"
          >
            <Search className="w-4 h-4" />
            {t("newSearch")}
            {credits !== null && credits > 0 && (
              <span className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {credits}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <Skeleton />
        ) : data ? (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {/* No website */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {data.noWebsiteFound}
                </p>
                <p className="text-xs font-semibold text-zinc-400 mt-1">{t("statNoWeb")}</p>
                <p className="text-[10px] text-zinc-600">{t("statNoWebSub")}</p>
              </motion.div>

              {/* Contactable */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.10 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {data.contactableLeads}
                </p>
                <p className="text-xs font-semibold text-zinc-400 mt-1">{t("statContactable")}</p>
                <p className="text-[10px] text-zinc-600">{t("statContactableSub")}</p>
              </motion.div>

              {/* Unique niches */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.14 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {data.topNiches.length}
                </p>
                <p className="text-xs font-semibold text-zinc-400 mt-1">{t("statNiches")}</p>
                <p className="text-[10px] text-zinc-600">{t("statNichesSub")}</p>
              </motion.div>

              {/* Monthly progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <ProgressRing used={data.searchesThisMonth} limit={data.planLimit} />
                </div>
                <p className="text-2xl font-black text-white leading-none">
                  {data.searchesThisMonth}
                </p>
                <p className="text-xs font-semibold text-zinc-400 mt-1">{t("statSearches")}</p>
                <p className="text-[10px] text-zinc-600">{t("statSearchesSub", { limit: data.planLimit })}</p>
              </motion.div>
            </div>

            {/* ── Activity chart ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22 }}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 mb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  {t("activityLabel")}
                </p>
                <span className="text-[10px] text-zinc-600">{t("activitySub")}</span>
              </div>
              <ActivityChart
                data={data.activityByDay}
                emptyLabel={t("activityEmpty")}
                locale={locale}
              />
            </motion.div>

            {/* ── Niche + Zone analysis ── */}
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              {/* Niches */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.28 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    {t("nichesLabel")}
                  </p>
                  <span className="text-[9px] text-zinc-700 ml-auto">
                    {t("nichesWhatsappPct")}
                  </span>
                </div>
                <RankedBars
                  items={data.topNiches.map((n) => ({
                    label: n.niche,
                    rate: n.whatsappRate,
                    sub: `${n.searches === 1 ? t("nicheSearch", { count: n.searches }) : t("nicheSearchPlural", { count: n.searches })} · ${t("nicheAvg", { avg: n.avgResults })}`,
                  }))}
                  barColor="bg-violet-500"
                  emptyLabel={
                    data.totalSearches < 2
                      ? t("nichesEmpty")
                      : t("nichesNoData")
                  }
                />
              </motion.div>

              {/* Recent searches */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.33 }}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    {t("recentLabel")}
                  </p>
                </div>
                {data.recentSearches.length === 0 ? (
                  <p className="text-xs text-zinc-600 py-6 text-center">
                    {t("recentEmpty")}
                  </p>
                ) : (
                  <div className="space-y-0">
                    {data.recentSearches.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 py-2.5 ${
                          i < data.recentSearches.length - 1
                            ? "border-b border-neutral-800/50"
                            : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                            {s.niche}
                          </p>
                          <p className="text-[10px] text-zinc-600 truncate">{s.city}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-black text-emerald-400">{s.whatsapp}</p>
                            <p className="text-[9px] text-zinc-600">{t("recentWhatsapp")}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-zinc-400">{s.total}</p>
                            <p className="text-[9px] text-zinc-600">{t("recentTotal")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Recommendations ── */}
            {recs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.43 }}
                className="space-y-2.5 mb-5"
              >
                {recs.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-indigo-500/7 border border-indigo-500/14 rounded-2xl px-5 py-3.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 leading-relaxed">{rec.text}</p>
                      {rec.niche && (
                        <Link
                          href={`/search?niche=${encodeURIComponent(rec.niche)}${rec.city ? `&city=${encodeURIComponent(rec.city)}` : ""}`}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {t("recSearch", { niche: rec.niche })} <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── Quick nav ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.48 }}
              className="grid sm:grid-cols-2 gap-3"
            >
              <Link
                href="/search"
                className="group flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl p-4 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{t("newSearch")}</p>
                  <p className="text-[11px] text-zinc-600">
                    {credits !== null
                      ? t("navSearchCredits", { count: credits })
                      : t("navSearchDefault")}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-indigo-400 ml-auto transition-colors" />
              </Link>

              <Link
                href="/crm"
                className="group flex items-center gap-3 bg-neutral-900/60 border border-neutral-800 hover:border-violet-500/30 rounded-2xl p-4 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{t("navCRMTitle")}</p>
                  <p className="text-[11px] text-zinc-600">{t("navCRMSub")}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-violet-400 ml-auto transition-colors" />
              </Link>
            </motion.div>
          </>
        ) : null}

        {/* ── Free upsell ── */}
        {!loading && plan === "free" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-5 flex items-start gap-3 bg-amber-500/7 border border-amber-500/18 rounded-2xl px-5 py-4"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300 mb-0.5">
                {t("freeUpsellTitle")}
              </p>
              <p className="text-xs text-amber-400/70">
                {t("freeUpsellBody")}
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap"
            >
              {t("viewPlans")} <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
