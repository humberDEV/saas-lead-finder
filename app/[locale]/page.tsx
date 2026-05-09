import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle, LogIn, MapPin,
  Sparkles, ArrowUpRight, Search, ChevronDown, Copy, Phone,
} from "lucide-react";

const TICKER_ITEMS = [
  { name: "Barbería El Rincón", city: "Madrid", phone: "+34 612 345 678", rating: "4.8" },
  { name: "Clínica Dental Arco", city: "Valencia", phone: "+34 963 112 445", rating: "4.6" },
  { name: "Taller Mecánico Castro", city: "Barcelona", phone: "+34 932 887 001", rating: "4.3" },
  { name: "Peluquería Avant", city: "Sevilla", phone: "+34 954 221 789", rating: "4.9" },
  { name: "Reformas González", city: "Bilbao", phone: "+34 944 556 320", rating: "4.5" },
  { name: "Fisio Centro Norte", city: "Zaragoza", phone: "+34 976 331 654", rating: "4.7" },
  { name: "Estética Luna", city: "Málaga", phone: "+34 952 667 123", rating: "4.8" },
  { name: "CrossFit Zona Sur", city: "Murcia", phone: "+34 968 445 877", rating: "4.4" },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ── SIN WEB badge ─────────────────────────────────────────────────────────────
function NoWebBadge({ size = "xs" }: { size?: "xs" | "sm" | "md" }) {
  if (size === "md") {
    return (
      <span
        className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full"
        style={{ boxShadow: "0 0 14px rgba(52,211,153,0.3)" }}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        SIN WEB
      </span>
    );
  }
  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center gap-1 bg-emerald-500/12 border border-emerald-500/35 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{ boxShadow: "0 0 8px rgba(52,211,153,0.2)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        SIN WEB
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-0.5 bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
      style={{ boxShadow: "0 0 6px rgba(52,211,153,0.18)" }}
    >
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
      SIN WEB
    </span>
  );
}

// ── Browser frame ─────────────────────────────────────────────────────────────
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/[0.08]"
      style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)" }}
    >
      <div className="bg-[#16162a] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#0d0d20] border border-white/[0.07] rounded-md px-3 py-1 text-[11px] text-zinc-600 text-center">
          huntly.app/search
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-bold text-white">Huntly</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const t = await getTranslations("landing");
  const tPlans = await getTranslations("plans");
  const tFaqs = await getTranslations();

  const PLANS = [
    {
      name: tPlans("free.name"),
      price: "$0",
      period: "/mes",
      desc: tPlans("free.desc"),
      features: [
        ...((tPlans.raw("free.features") as string[]).map((text: string) => ({ text, ok: true }))),
        ...((tPlans.raw("free.disabledFeatures") as string[]).map((text: string) => ({ text, ok: false }))),
      ],
      cta: tPlans("free.cta"),
      popular: false,
    },
    {
      name: tPlans("go.name"),
      price: "$9",
      originalPrice: "$19",
      period: "/mes",
      desc: tPlans("go.desc"),
      features: (tPlans.raw("go.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("go.cta"),
      popular: true,
      checkoutKey: "go",
    },
    {
      name: tPlans("pro.name"),
      price: "$19",
      originalPrice: "$39",
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      popular: false,
      checkoutKey: "pro",
    },
  ];

  const FAQS = tFaqs.raw("faqs") as Array<{ q: string; a: string }>;

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Huntly",
            applicationCategory: "BusinessApplication",
            offers: { "@type": "AggregateOffer", lowPrice: "0", highPrice: "19", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Grain overlay */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.032]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: "repeat", backgroundSize: "180px" }}
      />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-[#0d0d14]/90 backdrop-blur-md border-b border-white/[0.05]">
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-bold tracking-tight">
                Hunt<span className="text-indigo-500">ly</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#como-funciona" className="text-sm text-zinc-300 hover:text-white transition-colors hidden md:block">
                {t("nav.howItWorks")}
              </Link>
              <Link href="#precios" className="text-sm text-zinc-300 hover:text-white transition-colors hidden md:block">
                {t("nav.pricing")}
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                    <LogIn className="w-3.5 h-3.5" /> {t("nav.signIn")}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        <main className="pt-14">

          {/* ── HERO ── */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 900px 700px at 60% 40%, rgba(99,102,241,0.14) 0%, transparent 70%)" }}
            />

            <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">

              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs text-indigo-300 font-medium">Prospección inteligente con Google Maps</span>
                </div>
                <h1 className="text-5xl md:text-[58px] font-black leading-[1.0] tracking-tighter mb-5">
                  {t("hero.title1")}
                  <br />
                  {t("hero.title2")}
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {t("hero.title3")}
                  </span>
                </h1>
                <p className="text-[17px] text-zinc-400 leading-relaxed mb-8 max-w-sm">
                  {t("hero.subtitle")}
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm shadow-[0_0_32px_rgba(99,102,241,0.35)] hover:shadow-[0_0_48px_rgba(99,102,241,0.5)]">
                        {t("hero.ctaPrimary")}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm shadow-[0_0_32px_rgba(99,102,241,0.35)]">
                      {t("hero.ctaDashboard")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                  <Link
                    href="#demo"
                    className="flex items-center gap-1.5 px-5 py-3 text-sm text-zinc-400 hover:text-white transition-colors rounded-xl border border-white/[0.08] hover:border-white/20"
                  >
                    {t("hero.ctaDemo")}
                  </Link>
                </div>
                <p className="text-xs text-zinc-500">{t("hero.freeNote")}</p>
              </div>

              {/* RIGHT — rich lead mockup */}
              <div className="hidden md:block">
                <BrowserFrame>
                  <div className="bg-[#0d0d14] p-4">

                    {/* Search bar */}
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 bg-[#111120] border border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-zinc-400 flex-1 truncate">Barberías</span>
                        <ChevronDown className="w-3 h-3 text-zinc-700 shrink-0" />
                      </div>
                      <div className="flex-1 bg-[#111120] border border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3 h-3 text-zinc-700 shrink-0" />
                        <span className="text-[10px] text-zinc-400 truncate">Madrid, Centro</span>
                      </div>
                      <button className="px-3 py-2.5 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Search className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>

                    {/* Results header */}
                    <div className="flex items-center gap-2 mb-3 px-0.5">
                      <span className="text-[11px] font-bold text-white">🚨 3 oportunidades encontradas</span>
                      <div className="ml-auto flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-emerald-400 font-medium">Live</span>
                      </div>
                    </div>

                    {/* Card 1 — main lead, full detail */}
                    <div
                      className="bg-[#0c1710] border border-emerald-500/20 rounded-xl p-3 mb-2"
                      style={{ boxShadow: "0 0 24px rgba(52,211,153,0.05), inset 0 0 0 1px rgba(52,211,153,0.08)" }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white leading-tight">Barbería El Rincón</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2 h-2 text-zinc-700 shrink-0" />
                            <span className="text-[9px] text-zinc-600">Calle Mayor 14, Madrid</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.5 rounded">T1</span>
                          <NoWebBadge size="xs" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-yellow-400 font-medium">★ 4.8</span>
                        <span className="text-[9px] text-zinc-600">247 reseñas</span>
                        <span className="text-[9px] text-zinc-700">·</span>
                        <span className="text-[9px] text-zinc-600">Operativo</span>
                      </div>

                      <div className="flex items-center gap-1 mb-2 bg-emerald-500/6 border border-emerald-500/12 rounded-lg px-2 py-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-[8px] text-emerald-400">Web no detectada · Teléfono disponible</span>
                      </div>

                      {/* Score bar */}
                      <div className="mb-2">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[8px] text-zinc-600">Alta probabilidad</span>
                          <span className="text-[8px] font-bold text-emerald-400">95/100</span>
                        </div>
                        <div className="h-[3px] bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                            style={{ width: "95%" }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Phone className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                        <span className="text-[9px] font-mono text-zinc-500">+34 612 345 678</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button className="flex-1 bg-emerald-500 text-black text-[8px] font-bold py-1.5 rounded-lg">WhatsApp</button>
                        <button className="flex-1 bg-white/[0.05] border border-white/[0.08] text-white text-[8px] py-1.5 rounded-lg">Llamar</button>
                      </div>
                    </div>

                    {/* Card 2 — secondary lead */}
                    <div className="bg-[#111120] border border-white/[0.06] rounded-xl p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-white truncate">Clínica Dental Arco</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-2 h-2 text-zinc-700 shrink-0" />
                            <span className="text-[9px] text-zinc-600 truncate">Av. del Puerto, Valencia</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[8px] font-bold text-indigo-400/60 bg-indigo-500/8 border border-indigo-500/15 px-1 py-0.5 rounded">T2</span>
                          <NoWebBadge size="xs" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] text-yellow-400">★ 4.6</span>
                        <span className="text-[9px] text-zinc-600">83 reseñas</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="flex-1 bg-emerald-500/80 text-black text-[8px] font-bold py-1 rounded-lg">WA</button>
                        <button className="flex-1 bg-white/[0.04] border border-white/[0.06] text-white text-[8px] py-1 rounded-lg">Llamar</button>
                      </div>
                    </div>

                  </div>
                </BrowserFrame>
              </div>
            </div>
          </section>

          {/* ── TICKER ── */}
          <div className="bg-[#0a0a12] border-y border-white/[0.04] py-3 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs text-zinc-400 shrink-0">
                  <span
                    className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    SIN WEB
                  </span>
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{item.city}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-yellow-500">★ {item.rating}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-zinc-600">{item.phone}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── STAT BAR ── */}
          <div className="bg-[#0f1117] border-b border-white/[0.04]">
            <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">{t("statBar.stat1")}</span>
              <span className="text-zinc-700 hidden sm:inline">·</span>
              <span className="font-medium text-zinc-300">{t("statBar.stat2")}</span>
              <span className="text-zinc-700 hidden sm:inline">·</span>
              <span className="font-medium text-zinc-300">{t("statBar.stat3")}</span>
            </div>
          </div>

          {/* ── PROBLEMA ── */}
          <section className="bg-[#0d0d14]">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-start">
                <div>
                  <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-5">{t("problem.label")}</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] text-white mb-5">
                    {t("problem.title1")}
                    <br />
                    <span
                      className="text-red-400"
                      style={{ textShadow: "0 0 40px rgba(248,113,113,0.45)" }}
                    >
                      {t("problem.title2")}
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-base leading-relaxed max-w-sm mb-6">
                    {t("problem.subtitle")}
                  </p>
                  <p className="text-sm text-zinc-600 italic">
                    "Deja de revisar Google Maps a mano."
                  </p>
                </div>

                <div className="space-y-0 pt-2">
                  {[
                    { stat: t("problem.stat1"), detail: t("problem.detail1") },
                    { stat: t("problem.stat2"), detail: t("problem.detail2") },
                    { stat: t("problem.stat3"), detail: t("problem.detail3") },
                  ].map((item, i) => (
                    <div key={i} className="py-5 flex items-start gap-4 border-b border-white/[0.05] last:border-0">
                      <div
                        className="mt-1 w-0.5 self-stretch rounded-full shrink-0"
                        style={{
                          background: "linear-gradient(to bottom, rgba(239,68,68,0.9), rgba(239,68,68,0.1))",
                          boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-red-400 font-black text-lg leading-tight mb-1">{item.stat}</span>
                        <span className="block text-zinc-500 text-sm leading-relaxed">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── WOW — "Google Maps está lleno de clientes ocultos" ── */}
          <section className="bg-[#0f1117]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <div className="grid md:grid-cols-[1fr_1fr] gap-12 items-center">

                {/* Left — copy */}
                <div>
                  <p className="text-xs font-mono text-emerald-500 uppercase tracking-wide mb-4">Oportunidad detectada</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-white mb-4">
                    Google Maps está lleno de{" "}
                    <span
                      className="text-emerald-400"
                      style={{ textShadow: "0 0 30px rgba(52,211,153,0.35)" }}
                    >
                      clientes ocultos.
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-base leading-relaxed mb-6">
                    Huntly detecta negocios con señales claras: sin web, buen volumen de reseñas, teléfono disponible y actividad reciente.
                  </p>
                  <div className="space-y-2.5">
                    {[
                      "Negocios sin web. Teléfono listo. WhatsApp listo.",
                      "Cada negocio sin web es una oportunidad que alguien todavía no reclamó.",
                      "Huntly no te da una lista. Te da oportunidades accionables.",
                    ].map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="text-sm text-zinc-300 leading-relaxed">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — featured lead card */}
                <div>
                  <div
                    className="rounded-2xl border border-emerald-500/20 p-6"
                    style={{
                      background: "linear-gradient(135deg, rgba(12,23,16,1) 0%, rgba(13,13,20,1) 100%)",
                      boxShadow: "0 0 80px rgba(52,211,153,0.07), 0 0 0 1px rgba(52,211,153,0.12)",
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="text-xl font-black text-white">Barbería El Rincón</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span className="text-sm text-zinc-500">Madrid, España</span>
                        </div>
                      </div>
                      <NoWebBadge size="md" />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <span className="text-[10px] text-zinc-600 block mb-0.5">Valoración</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-yellow-400 font-bold">★ 4.8</span>
                          <span className="text-zinc-500 text-xs">· 247 reseñas</span>
                        </div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <span className="text-[10px] text-zinc-600 block mb-0.5">Teléfono</span>
                        <span className="text-sm font-mono text-zinc-300">+34 612 345 678</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/6 border border-emerald-500/15 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-sm text-emerald-400 font-medium">Web no detectada · Teléfono disponible · Alta probabilidad</span>
                    </div>

                    {/* Score */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-zinc-600">Score de oportunidad</span>
                        <span className="text-xs font-black text-emerald-400">95 / 100</span>
                      </div>
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                          style={{ width: "95%" }}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2.5">
                      <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold py-2.5 rounded-xl transition-colors">
                        Enviar WhatsApp
                      </button>
                      <button className="flex-1 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white text-sm py-2.5 rounded-xl transition-colors">
                        Llamar
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-sm text-zinc-600 mt-4">
                    Ese negocio probablemente necesita{" "}
                    <span className="text-zinc-400 font-medium">justo lo que tú vendes.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── DEMO / VIDEO ── */}
          <section id="demo" className="bg-[#0d0d14]">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="mb-10">
                <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-3">{t("demo.label")}</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                  {t("demo.title")}
                </h2>
                <p className="text-zinc-400 text-sm mt-2 max-w-lg">
                  {t("demo.subtitle")}
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div
                  className="rounded-2xl overflow-hidden border border-white/15 bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.5)" }}
                >
                  <video
                    className="w-full bg-black brightness-110"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="https://res.cloudinary.com/dufnkxsfm/video/upload/v1777248069/minidemo_kzfinl.mp4"
                  />
                </div>
              </div>

              <div className="mt-10 text-center">
                <p className="text-zinc-500 text-sm mb-4">{t("demo.ctaQuestion")}</p>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]">
                      {t("demo.ctaButton")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]"
                  >
                    {t("demo.ctaButton")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </section>

          {/* ── CÓMO FUNCIONA ── */}
          <section id="como-funciona" className="bg-[#0f1117]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">{t("howItWorks.label")}</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-14">
                {t("howItWorks.title")}<span className="text-indigo-400">{t("howItWorks.titleHighlight")}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.05] border border-white/[0.06] rounded-2xl overflow-hidden">

                {/* Step 01 */}
                <div className="bg-[#0d0d14] p-8">
                  <span className="block text-xs font-mono text-indigo-500 mb-3">01</span>
                  <p className="text-white font-semibold leading-snug mb-1">{t("howItWorks.step1Title")}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{t("howItWorks.step1Note")}</p>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/[0.05] space-y-2">
                    <div className="bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-[10px] text-zinc-400 flex items-center justify-between">
                      Barberías <ChevronDown className="w-3 h-3 text-zinc-700" />
                    </div>
                    <div className="bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-[10px] text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-2.5 h-2.5 text-zinc-700" /> Madrid, Centro
                    </div>
                    <button className="w-full bg-indigo-600/80 rounded-lg py-1.5 text-[10px] font-bold text-white text-center">
                      Buscar oportunidades
                    </button>
                  </div>
                </div>

                {/* Step 02 — filtering in action */}
                <div className="bg-[#0d0d14] p-8">
                  <span className="block text-xs font-mono text-indigo-500 mb-3">02</span>
                  <p className="text-white font-semibold leading-snug mb-1">{t("howItWorks.step2Title")}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{t("howItWorks.step2Note")}</p>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/[0.05] space-y-1.5">
                    {[
                      { name: "Barbería El Rincón", ok: true, label: "Alta prob." },
                      { name: "Peluquería Nova", ok: true, label: "Explorar" },
                      { name: "Reformas García", ok: false, label: null },
                      { name: "CrossFit Zona Sur", ok: true, label: "Alta prob." },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${item.ok ? "bg-emerald-500/5" : "opacity-30"}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.ok ? "bg-emerald-400" : "bg-zinc-700"}`} />
                        <span className={`flex-1 text-[9px] truncate ${item.ok ? "text-zinc-300" : "text-zinc-600"}`}>{item.name}</span>
                        {item.ok ? (
                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">SIN WEB</span>
                        ) : (
                          <span className="text-[8px] text-zinc-700 shrink-0">Tiene web</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 03 — WhatsApp ready */}
                <div className="bg-[#0d0d14] p-8">
                  <span className="block text-xs font-mono text-indigo-500 mb-3">03</span>
                  <p className="text-white font-semibold leading-snug mb-1">{t("howItWorks.step3Title")}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{t("howItWorks.step3Note")}</p>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/[0.05]">
                    <p className="text-[9px] text-zinc-600 mb-2 uppercase tracking-wide font-medium">Mensaje generado</p>
                    <div className="bg-[#0a1a0f] border border-emerald-900/40 rounded-xl p-2.5 mb-2.5">
                      <p className="text-[9px] text-zinc-300 leading-relaxed line-clamp-3">
                        {t("howItWorks.step3Preview")}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 bg-emerald-500 text-black text-[8px] font-bold py-1.5 rounded-lg">WhatsApp</button>
                      <button className="flex-1 bg-white/[0.06] border border-white/[0.08] text-white text-[8px] py-1.5 rounded-lg">{t("howItWorks.call")}</button>
                      <button className="w-7 bg-white/[0.04] border border-white/[0.06] text-zinc-500 py-1.5 rounded-lg flex items-center justify-center">
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── PARA QUIÉN ES ── */}
          <section className="bg-[#0d0d14]">
            <div className="max-w-5xl mx-auto px-6 py-20">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">{t("audience.label")}</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-10">
                {t("audience.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: t("audience.audience1Title"),
                    desc: t("audience.audience1Desc"),
                    tag: "Freelancer",
                  },
                  {
                    title: t("audience.audience2Title"),
                    desc: t("audience.audience2Desc"),
                    tag: "Agencia",
                  },
                  {
                    title: t("audience.audience3Title"),
                    desc: t("audience.audience3Desc"),
                    tag: "IA + webs",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-colors"
                  >
                    <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full mb-3">
                      {item.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ROI — antes del pricing ── */}
          <section className="bg-[#0f1117]">
            <div className="max-w-5xl mx-auto px-6 py-16">
              <div
                className="rounded-2xl border border-white/[0.07] p-6 md:p-8"
                style={{ background: "linear-gradient(135deg, rgba(15,17,23,1) 0%, rgba(13,13,20,1) 100%)" }}
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
                  <div>
                    <p className="text-xs font-mono text-emerald-500 uppercase tracking-wide mb-2">ROI</p>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-1">
                      Con cerrar un cliente, Huntly se paga solo.
                    </h3>
                    <p className="text-sm text-zinc-500">Encuentra clientes antes que tu competencia.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:gap-8 shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-600 mb-1">Cliente web típico</p>
                      <p className="text-2xl md:text-3xl font-black text-white">$300</p>
                      <p className="text-[10px] text-zinc-600">proyecto</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-600 mb-1">Huntly Go</p>
                      <p className="text-2xl md:text-3xl font-black text-white">$9</p>
                      <p className="text-[10px] text-zinc-600">al mes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-600 mb-1">ROI potencial</p>
                      <p
                        className="text-2xl md:text-3xl font-black text-emerald-400"
                        style={{ textShadow: "0 0 20px rgba(52,211,153,0.4)" }}
                      >
                        x33
                      </p>
                      <p className="text-[10px] text-zinc-600">un cliente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precios" className="bg-[#0d0d14]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">{t("pricingSection.label")}</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-3">
                {t("pricingSection.title")}<span className="text-indigo-400">{t("pricingSection.titleHighlight")}</span>
              </h2>

              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-10 max-w-lg">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-400 leading-relaxed">
                  <span className="text-white font-medium">{t("pricingSection.valueNote")}</span>{" "}
                  <span className="text-emerald-400">{t("pricingSection.valueHighlight")}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 items-start max-w-4xl mx-auto">
                {PLANS.map((plan, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl border flex flex-col p-6 transition-colors ${
                      plan.popular
                        ? "border-indigo-500/35 bg-indigo-950/15 shadow-[0_0_48px_rgba(99,102,241,0.07)]"
                        : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.12]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-5 bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {t("pricingSection.mostPopular")}
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
                      <p className="text-xs text-zinc-500">{plan.desc}</p>
                    </div>
                    <div className="mb-5">
                      {"originalPrice" in plan && plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-zinc-600 line-through">{plan.originalPrice as string}</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            -{Math.round((1 - parseInt(plan.price.replace("$", "")) / parseInt((plan.originalPrice as string).replace("$", ""))) * 100)}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                        <span className="text-zinc-500 text-sm">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm">
                          {feat.ok ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-white/[0.10] shrink-0" />
                          )}
                          <span className={feat.ok ? "text-zinc-300" : "text-zinc-700"}>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      {"checkoutKey" in plan && plan.checkoutKey ? (
                        <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                          <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                            plan.popular
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]"
                          }`}>
                            {plan.cta}
                          </button>
                        </SignInButton>
                      ) : (
                        <SignInButton mode="modal">
                          <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                            plan.popular
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]"
                          }`}>
                            {plan.cta}
                          </button>
                        </SignInButton>
                      )}
                    </SignedOut>
                    <SignedIn>
                      <Link
                        href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                        className={`block text-center w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          plan.popular
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]"
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </SignedIn>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="bg-[#0f1117]">
            <div className="max-w-2xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">{t("faq.label")}</p>
              <h2 className="text-3xl font-black tracking-tighter text-white mb-10">{t("faq.title")}</h2>
              <div itemScope itemType="https://schema.org/FAQPage" className="space-y-2">
                {FAQS.map((faq, i) => (
                  <details
                    key={i}
                    itemProp="mainEntity"
                    itemScope
                    itemType="https://schema.org/Question"
                    name="faq"
                    className="group bg-[#0d0d14] border border-white/[0.06] rounded-xl overflow-hidden open:border-white/[0.10]"
                  >
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                      <span itemProp="name" className="text-sm font-semibold text-white">{faq.q}</span>
                      <svg
                        className="w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200 group-open:rotate-180"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div
                      itemProp="acceptedAnswer"
                      itemScope
                      itemType="https://schema.org/Answer"
                      className="px-5 pb-5"
                    >
                      <p itemProp="text" className="text-zinc-400 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section className="bg-[#0d0d14]">
            <div className="max-w-6xl mx-auto px-6 py-28">
              <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-white mb-4">
                    {t("finalCta.title1")}
                    <br />
                    <span className="text-indigo-400">{t("finalCta.title2")}</span>
                  </h2>
                  <p className="text-zinc-400 text-sm mt-2">
                    {t("finalCta.subtitle")}
                  </p>
                  <p className="text-zinc-600 text-xs mt-3">{t("finalCta.freeNote")}</p>
                </div>
                <div className="flex flex-col gap-3 min-w-[220px]">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="group flex items-center justify-center gap-2 w-full px-7 py-3.5 bg-white text-[#0d0d14] text-sm font-bold rounded-xl hover:bg-zinc-100 transition-colors">
                        {t("finalCta.ctaButton")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="group flex items-center justify-center gap-2 w-full px-7 py-3.5 bg-white text-[#0d0d14] text-sm font-bold rounded-xl hover:bg-zinc-100 transition-colors">
                      {t("finalCta.ctaDashboard")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <Link href="#precios" className="text-center text-xs text-zinc-500 hover:text-white transition-colors py-2">
                    {t("finalCta.viewPlans")}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="bg-[#0d0d14] border-t border-white/[0.05] py-8">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-zinc-500">Huntly</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-700">
                <Link href="#como-funciona" className="hover:text-zinc-400 transition-colors">{t("footer.howItWorks")}</Link>
                <Link href="#precios" className="hover:text-zinc-400 transition-colors">{t("footer.pricing")}</Link>
                <Link href="mailto:huntly@outlook.es" className="hover:text-zinc-400 transition-colors">{t("footer.contact")}</Link>
              </div>
              <p className="text-sm text-zinc-700">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
