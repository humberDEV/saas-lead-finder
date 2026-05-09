import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight, CheckCircle, Sparkles, Zap,
} from "lucide-react";
import CursorGlow from "./CursorGlow";
import Reveal from "./Reveal";
import GlobeMap from "./GlobeMap";
import HeroLiveFeed from "./HeroLiveFeed";

const TICKER_ITEMS = [
  { name: "Barbería El Rincón", city: "Madrid", rating: "4.8" },
  { name: "Clínica Dental Arco", city: "Valencia", rating: "4.6" },
  { name: "Taller Mecánico Castro", city: "Barcelona", rating: "4.3" },
  { name: "Peluquería Avant", city: "Sevilla", rating: "4.9" },
  { name: "Reformas González", city: "Bilbao", rating: "4.5" },
  { name: "Fisio Centro Norte", city: "Zaragoza", rating: "4.7" },
  { name: "Estética Luna", city: "Málaga", rating: "4.8" },
  { name: "CrossFit Zona Sur", city: "Murcia", rating: "4.4" },
  { name: "Gestoría Pérez", city: "Alicante", rating: "4.5" },
  { name: "Óptica Central", city: "Granada", rating: "4.7" },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const BG = {
  base:  "#0e0b1e",
  deep:  "#0b0917",
  mid:   "#120f26",
  alt:   "#100d22",
};

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
      period: "/mes",
      desc: tPlans("pro.desc"),
      features: (tPlans.raw("pro.features") as string[]).map((text: string) => ({ text, ok: true })),
      cta: tPlans("pro.cta"),
      popular: false,
      checkoutKey: "pro",
    },
  ];

  void tFaqs;

  return (
    <div className="min-h-screen text-white antialiased" style={{ background: BG.base }}>
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

      <div aria-hidden className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: "repeat", backgroundSize: "180px" }}
      />
      <CursorGlow />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav
          className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md border-b border-violet-500/[0.08]"
          style={{ background: "rgba(14,11,30,0.92)" }}
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="font-bold tracking-tight">
                Hunt<span className="text-violet-400">ly</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-violet-200/50 hover:text-violet-100 transition-colors hidden sm:block">
                    {t("nav.signIn")}
                  </button>
                </SignInButton>
                {/* Goes straight to pricing anchor — no sign-in gate */}
                <Link
                  href="#precios"
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                >
                  Comprar ahora
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        <main className="pt-14">

          {/* ── HERO ── */}
          <section
            className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            style={{ minHeight: "calc(100svh - 56px)" }}
          >
            {/* Dot grid */}
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.18) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 0%, transparent 100%)",
                opacity: 0.16,
              }}
            />
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.14) 0%, transparent 70%)" }}
            />
            <div aria-hidden className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
            />
            <div aria-hidden className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)" }}
            />

            {/* Animated live card — right side, only xl+ */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
              <HeroLiveFeed />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 bg-violet-500/[0.10] border border-violet-500/25 rounded-full px-4 py-1.5 mb-10">
                  <Zap className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-200 tracking-wide">Prospección local automatizada</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1
                  className="font-black tracking-tighter leading-[0.92] text-white mb-7 max-w-3xl"
                  style={{ fontSize: "clamp(36px, 6.5vw, 88px)" }}
                >
                  {t("hero.title1")}
                  <br />
                  {t("hero.title2")}
                  <br />
                  <span className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                    {t("hero.title3")}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-base md:text-lg text-violet-200/70 mb-12 max-w-sm leading-relaxed">
                  {t("hero.subtitle")}
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="flex flex-col items-center gap-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
                      >
                        {t("hero.ctaPrimary")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard"
                      className="group flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                    >
                      {t("hero.ctaDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-violet-300/50">{t("hero.freeNote")}</span>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-violet-300/50">
                    <span>① Elige nicho y ciudad</span>
                    <span className="text-violet-700">·</span>
                    <span>② Huntly escanea</span>
                    <span className="text-violet-700">·</span>
                    <span>③ Contacta y cierra</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
            </div>
          </section>

          {/* ── TICKER — in flow, not fixed ── */}
          <div
            className="border-y border-violet-500/[0.08] py-3 overflow-hidden"
            style={{ background: "rgba(11,9,23,0.95)" }}
          >
            <div className="flex animate-marquee whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 mx-8 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Sin web
                  </span>
                  <span className="text-xs font-medium text-violet-200/65">{item.name}</span>
                  <span className="text-violet-800">·</span>
                  <span className="text-xs text-violet-300/40">{item.city}</span>
                  <span className="text-violet-800">·</span>
                  <span className="text-xs text-yellow-500/65 font-medium">★ {item.rating}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── BEFORE / AFTER ── */}
          <section className="px-6 pt-8 pb-20 md:pb-24" style={{ background: BG.alt }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-300/40 uppercase tracking-widest mb-8 text-center">
                  Sin Huntly · Con Huntly
                </p>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                <Reveal delay={0}>
                  <div className="rounded-2xl border border-red-500/10 p-1 h-full" style={{ background: "rgba(239,68,68,0.025)" }}>
                    <div className="rounded-xl border border-dashed border-red-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-red-400/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Proceso manual en Google Maps<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-red-400/40 text-center py-2.5 font-medium">Sin Huntly</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-2xl border border-emerald-500/10 p-1 h-full" style={{ background: "rgba(52,211,153,0.025)" }}>
                    <div className="rounded-xl border border-dashed border-emerald-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-emerald-400/40 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Dashboard con leads en segundos<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400/40 text-center py-2.5 font-medium">Con Huntly</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PAIN ── */}
          <section
            className="relative px-6 py-20 md:py-28 overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.alt}, ${BG.mid}, ${BG.alt})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(248,113,113,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-300/50 uppercase tracking-widest mb-12">
                  {t("problem.label")}
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h2
                  className="font-black tracking-tighter leading-[1.0] text-white mb-14 max-w-3xl"
                  style={{ fontSize: "clamp(24px, 4vw, 48px)" }}
                >
                  ¿Cuántas horas llevas<br />
                  <span className="text-violet-200/40">buscando clientes en Google Maps?</span>
                </h2>
              </Reveal>
              <div className="space-y-5 md:space-y-6">
                <Reveal delay={0}><p className="font-black tracking-tighter leading-tight text-violet-200/30" style={{ fontSize: "clamp(18px, 2.5vw, 30px)" }}>Otra vez abrir Maps.</p></Reveal>
                <Reveal delay={60}><p className="font-black tracking-tighter leading-tight text-violet-200/40" style={{ fontSize: "clamp(21px, 3vw, 38px)" }}>Otra vez revisar si tienen web.</p></Reveal>
                <Reveal delay={120}><p className="font-black tracking-tighter leading-tight text-violet-100/55" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>Otra vez copiar el teléfono.</p></Reveal>
                <Reveal delay={180}><p className="font-black tracking-tighter leading-tight text-violet-100/75" style={{ fontSize: "clamp(27px, 4.2vw, 54px)" }}>Otra vez que no contesten.</p></Reveal>
                <Reveal delay={240}>
                  <p
                    className="font-black tracking-tighter leading-tight"
                    style={{ fontSize: "clamp(38px, 6vw, 76px)", color: "#f87171", textShadow: "0 0 80px rgba(248,113,113,0.25)" }}
                  >
                    Horas<br />sin facturar.
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── STORYTELLING 1 ── */}
          <section className="px-6 py-20 md:py-28" style={{ background: BG.mid }}>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-5">Para qué sirve</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-5"
                    style={{ fontSize: "clamp(24px, 3.2vw, 44px)" }}
                  >
                    Deja de perder horas<br />
                    <span className="text-violet-200/45">buscando clientes<br />a mano en Google Maps.</span>
                  </h2>
                  <p className="text-sm text-violet-200/60 leading-relaxed max-w-xs">
                    Huntly escanea Google Maps por ti. Filtra los negocios sin web, extrae su teléfono y los puntúa para que solo contactes los que tienen oportunidad real.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div
                  className="rounded-2xl border border-dashed border-violet-500/15 overflow-hidden"
                  style={{ aspectRatio: "16/10", background: "rgba(139,92,246,0.03)" }}
                >
                  <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
                    <span className="text-[9px] font-mono text-violet-400/30 uppercase tracking-widest text-center leading-relaxed">
                      Vídeo: búsqueda manual en Google Maps<br />aquí — 1280 × 800 recomendado
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── STORYTELLING 2 — globe ── */}
          <section
            className="relative px-6 py-20 md:py-28 overflow-hidden"
            style={{ background: BG.base }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 50% 60% at 70% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-5">Cobertura global</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-5"
                    style={{ fontSize: "clamp(24px, 3.2vw, 44px)" }}
                  >
                    No te limites<br />
                    <span className="text-violet-200/45">a tu ciudad.</span>
                  </h2>
                  <p className="text-sm text-violet-200/60 leading-relaxed max-w-xs">
                    Huntly funciona en cualquier país hispanohablante del mundo. Busca clientes en Madrid, Ciudad de México, Buenos Aires o Bogotá con el mismo proceso.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["España", "México", "Argentina", "Colombia", "Perú", "Chile", "+más"].map((c) => (
                      <span key={c} className="text-[10px] font-mono text-violet-300/55 bg-violet-500/[0.07] border border-violet-500/15 rounded-full px-2.5 py-1 uppercase tracking-wide">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-2xl overflow-hidden border border-violet-500/15" style={{ height: 360 }}>
                  <GlobeMap />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── DEMO ── */}
          <section id="demo" className="px-6 py-20 md:py-24" style={{ background: BG.mid }}>
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-4">{t("demo.label")}</p>
                <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(22px, 3vw, 40px)" }}>
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="rounded-2xl overflow-hidden border border-violet-500/15 bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 24px 48px rgba(0,0,0,0.5)" }}
                >
                  <video className="w-full bg-black brightness-110" autoPlay loop muted playsInline
                    src="https://res.cloudinary.com/dufnkxsfm/video/upload/v1777248069/minidemo_kzfinl.mp4"
                  />
                </div>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-8 flex justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(139,92,246,0.3)]">
                        {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(139,92,246,0.3)]">
                      {t("demo.ctaButton")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── SOCIAL PROOF ── */}
          <section className="px-6 py-16 md:py-20" style={{ background: BG.alt }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-300/45 uppercase tracking-widest mb-8 text-center">
                  Lo que dicen los usuarios
                </p>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="rounded-2xl border border-dashed border-violet-500/[0.12] p-6 h-full"
                      style={{ background: "rgba(139,92,246,0.03)" }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-violet-800/30 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-2 w-20 bg-violet-700/25 rounded-full" />
                          <div className="h-1.5 w-14 bg-violet-800/20 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-2 bg-violet-700/20 rounded-full" />
                        <div className="h-2 bg-violet-700/20 rounded-full w-5/6" />
                        <div className="h-2 bg-violet-700/20 rounded-full w-4/6" />
                      </div>
                      <span className="text-[9px] font-mono text-violet-400/30 uppercase tracking-widest">Testimonio real aquí</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── compact to fit in viewport ── */}
          <section id="precios" className="px-6 py-14 md:py-20" style={{ background: BG.deep }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-3">
                  {t("pricingSection.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-3"
                  style={{ fontSize: "clamp(22px, 3.5vw, 42px)" }}
                >
                  {t("pricingSection.title")}
                  <span className="text-violet-400">{t("pricingSection.titleHighlight")}</span>
                </h2>
              </Reveal>

              {/* 20× value callout */}
              <Reveal delay={60}>
                <div
                  className="rounded-2xl border border-violet-500/20 p-5 mb-8 max-w-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="shrink-0 leading-none">
                      <span
                        className="font-black text-transparent bg-clip-text"
                        style={{ fontSize: "clamp(40px, 5vw, 60px)", backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)" }}
                      >
                        20×
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-snug mb-1">
                        recuperas la inversión con tu primera venta web.
                      </p>
                      <p className="text-violet-200/60 text-xs leading-relaxed">
                        Los usuarios de Huntly pagan <span className="text-violet-200/80">$9 al mes</span>. Una sola web vale 200€ o más. Cierra uno y el plan está pagado 20 veces.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <div
                      className={`group relative rounded-3xl flex flex-col p-6 h-full transition-all duration-200 ${
                        !plan.popular ? "hover:-translate-y-1" : ""
                      }`}
                      style={{
                        background: plan.popular
                          ? "linear-gradient(160deg, rgba(139,92,246,0.18) 0%, rgba(11,9,23,1) 55%)"
                          : "rgba(139,92,246,0.04)",
                        boxShadow: plan.popular
                          ? "0 0 0 1px rgba(139,92,246,0.40), 0 0 60px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)"
                          : "0 0 0 1px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.02)",
                      }}
                    >
                      {/* Hover glow on non-popular cards */}
                      {!plan.popular && (
                        <div
                          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.28), 0 0 40px rgba(139,92,246,0.08)" }}
                        />
                      )}

                      {plan.popular && (
                        <div
                          className="absolute top-0 left-8 right-8 h-px"
                          style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.9), transparent)" }}
                        />
                      )}

                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-mono text-violet-300/55 uppercase tracking-widest">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t("pricingSection.mostPopular")}
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className="font-black tracking-tight"
                            style={{
                              fontSize: "clamp(36px, 4vw, 52px)",
                              color: plan.popular ? "#fff" : "rgba(221,214,254,0.65)",
                            }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-violet-300/45 text-sm">{plan.period}</span>
                        </div>
                        <p className="text-xs text-violet-200/55 mt-1.5 leading-relaxed">{plan.desc}</p>
                      </div>

                      <ul className="space-y-2.5 mb-7 flex-1">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            {feat.ok ? (
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-emerald-500/80"}`} />
                            ) : (
                              <span className="w-3.5 h-3.5 shrink-0 mt-1.5 flex items-center"><span className="w-2.5 h-px bg-violet-700/40 block" /></span>
                            )}
                            <span className={`text-xs leading-snug ${feat.ok ? (plan.popular ? "text-violet-100/85" : "text-violet-200/60") : "text-violet-300/25"}`}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <SignedOut>
                        {"checkoutKey" in plan && plan.checkoutKey ? (
                          <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                            <button className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200/70 border border-violet-500/20"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        ) : (
                          <SignInButton mode="modal">
                            <button className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200/70 border border-violet-500/20"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        )}
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                          className={`block text-center w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                            plan.popular
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                              : "bg-violet-500/[0.09] hover:bg-violet-500/[0.18] text-violet-200/70 border border-violet-500/20"
                          }`}
                        >
                          {plan.cta}
                        </Link>
                      </SignedIn>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section
            className="relative px-6 py-28 md:py-40 text-center overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.mid}, ${BG.base})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-300/45 uppercase tracking-widest mb-8">Empieza ahora</p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-5"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-violet-400">{t("finalCta.title2")}</span>
                </h2>
                <p className="text-violet-200/55 text-base mb-10">{t("finalCta.subtitle")}</p>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex flex-col items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.12)" }}
                      >
                        {t("finalCta.ctaButton")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard"
                      className="group flex items-center gap-2.5 px-9 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                    >
                      {t("finalCta.ctaDashboard")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <span className="text-xs text-violet-300/40">{t("finalCta.freeNote")}</span>
                  <Link href="#precios" className="text-xs text-violet-300/40 hover:text-violet-200/65 transition-colors">
                    {t("finalCta.viewPlans")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="border-t border-violet-500/[0.07] py-8 px-6" style={{ background: BG.base }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-300/35">Huntly</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-violet-300/35">
                <Link href="#demo" className="hover:text-violet-200/65 transition-colors">{t("footer.howItWorks")}</Link>
                <Link href="#precios" className="hover:text-violet-200/65 transition-colors">{t("footer.pricing")}</Link>
                <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200/65 transition-colors">{t("footer.contact")}</Link>
              </div>
              <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
