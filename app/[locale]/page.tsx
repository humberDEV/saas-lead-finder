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

// Base background: dark purple-tinted, not pure black
const BG = {
  base:  "#0e0b1e",
  deep:  "#0b0917",
  mid:   "#120f26",
  alt:   "#100d22",
  light: "#150f2a",
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
          style={{ background: "rgba(14,11,30,0.90)" }}
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
                  <button className="text-sm text-violet-300/50 hover:text-violet-100 transition-colors hidden sm:block">
                    {t("nav.signIn")}
                  </button>
                </SignInButton>
                <SignInButton mode="modal" forceRedirectUrl="/checkout/go">
                  <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                    Comprar ahora
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors">
                  {t("nav.dashboard")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </nav>

        {/* ── TICKER — fixed below nav ── */}
        <div
          className="fixed top-14 inset-x-0 z-40 border-b border-violet-500/[0.08] py-2.5 overflow-hidden"
          style={{ background: "rgba(14,11,30,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex animate-marquee whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 mx-8 shrink-0">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Sin web
                </span>
                <span className="text-xs font-medium text-violet-200/70">{item.name}</span>
                <span className="text-violet-800">·</span>
                <span className="text-xs text-violet-400/40">{item.city}</span>
                <span className="text-violet-800">·</span>
                <span className="text-xs text-yellow-500/70 font-medium">★ {item.rating}</span>
              </span>
            ))}
          </div>
        </div>

        <main className="pt-[96px]">

          {/* ── HERO ── */}
          <section
            className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden"
            style={{ minHeight: "calc(100svh - 96px - 60px)" }}
          >
            {/* Dot grid */}
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.18]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.18) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 100%)",
              }}
            />
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(139,92,246,0.13) 0%, transparent 70%)" }}
            />
            <div aria-hidden className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
            />
            <div aria-hidden className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)" }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 bg-violet-500/[0.08] border border-violet-500/20 rounded-full px-4 py-1.5 mb-10">
                  <Zap className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-300/70 tracking-wide">Prospección local automatizada</span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1
                  className="font-black tracking-tighter leading-[0.92] text-white mb-7 max-w-4xl"
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
                <p className="text-base md:text-lg text-violet-200/50 mb-12 max-w-sm leading-relaxed">
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
                  <span className="text-xs text-violet-400/40">{t("hero.freeNote")}</span>
                  {/* Easy messaging */}
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-violet-400/40">
                    <span>① Elige nicho y ciudad</span>
                    <span className="text-violet-800">·</span>
                    <span>② Huntly escanea</span>
                    <span className="text-violet-800">·</span>
                    <span>③ Contacta y cierra</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-violet-400 to-transparent mx-auto" />
            </div>
          </section>

          {/* ── BEFORE / AFTER ── */}
          <section className="px-6 pt-8 pb-20 md:pb-28" style={{ background: BG.alt }}>
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/30 uppercase tracking-widest mb-8 text-center">
                  Sin Huntly · Con Huntly
                </p>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                <Reveal delay={0}>
                  <div className="rounded-2xl border border-red-500/10 p-1 h-full" style={{ background: "rgba(239,68,68,0.025)" }}>
                    <div className="rounded-xl border border-dashed border-red-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-red-400/30 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Proceso manual en Google Maps<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-red-900/80 text-center py-2.5 font-medium">Sin Huntly</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-2xl border border-emerald-500/10 p-1 h-full" style={{ background: "rgba(52,211,153,0.025)" }}>
                    <div className="rounded-xl border border-dashed border-emerald-500/15 h-64 flex flex-col items-center justify-center gap-3 p-6">
                      <span className="text-[9px] font-mono text-emerald-400/30 uppercase tracking-widest text-center leading-relaxed">
                        Imagen real aquí<br />Dashboard con leads en segundos<br />800 × 480
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/80 text-center py-2.5 font-medium">Con Huntly</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── PAIN ── */}
          <section
            className="relative px-6 py-20 md:py-32 overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.alt}, ${BG.mid}, ${BG.alt})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(248,113,113,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/30 uppercase tracking-widest mb-14">
                  {t("problem.label")}
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h2
                  className="font-black tracking-tighter leading-[1.0] text-white mb-16 max-w-3xl"
                  style={{ fontSize: "clamp(24px, 4vw, 48px)" }}
                >
                  ¿Cuántas horas llevas<br />
                  <span className="text-violet-300/30">buscando clientes en Google Maps?</span>
                </h2>
              </Reveal>
              <div className="space-y-5 md:space-y-7">
                <Reveal delay={0}><p className="font-black tracking-tighter leading-tight text-violet-200/25" style={{ fontSize: "clamp(18px, 2.5vw, 30px)" }}>Otra vez abrir Maps.</p></Reveal>
                <Reveal delay={60}><p className="font-black tracking-tighter leading-tight text-violet-200/35" style={{ fontSize: "clamp(21px, 3vw, 38px)" }}>Otra vez revisar si tienen web.</p></Reveal>
                <Reveal delay={120}><p className="font-black tracking-tighter leading-tight text-violet-200/50" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>Otra vez copiar el teléfono.</p></Reveal>
                <Reveal delay={180}><p className="font-black tracking-tighter leading-tight text-violet-100/70" style={{ fontSize: "clamp(27px, 4.2vw, 54px)" }}>Otra vez que no contesten.</p></Reveal>
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
          <section className="px-6 py-20 md:py-32" style={{ background: BG.mid }}>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-6">Para qué sirve</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-6"
                    style={{ fontSize: "clamp(26px, 3.5vw, 48px)" }}
                  >
                    Deja de perder horas<br />
                    <span className="text-violet-300/40">buscando clientes<br />a mano en Google Maps.</span>
                  </h2>
                  <p className="text-sm text-violet-200/40 leading-relaxed max-w-xs">
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
                    <span className="text-[9px] font-mono text-violet-400/25 uppercase tracking-widest text-center leading-relaxed">
                      Vídeo: búsqueda manual en Google Maps<br />aquí — 1280 × 800 recomendado
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── STORYTELLING 2 — globe ── */}
          <section
            className="relative px-6 py-20 md:py-32 overflow-hidden"
            style={{ background: BG.base }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 50% 60% at 70% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <Reveal>
                <div>
                  <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-6">Cobertura global</p>
                  <h2
                    className="font-black tracking-tighter leading-[1.05] text-white mb-6"
                    style={{ fontSize: "clamp(26px, 3.5vw, 48px)" }}
                  >
                    No te limites<br />
                    <span className="text-violet-300/40">a tu ciudad.</span>
                  </h2>
                  <p className="text-sm text-violet-200/40 leading-relaxed max-w-xs">
                    Huntly funciona en cualquier país hispanohablante del mundo. Busca clientes en Madrid, Ciudad de México, Buenos Aires o Bogotá con el mismo proceso, sin cambiar nada.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {["España", "México", "Argentina", "Colombia", "Perú", "Chile", "+más"].map((c) => (
                      <span key={c} className="text-[10px] font-mono text-violet-300/40 bg-violet-500/[0.06] border border-violet-500/15 rounded-full px-2.5 py-1 uppercase tracking-wide">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="rounded-2xl overflow-hidden border border-violet-500/15" style={{ height: 380 }}>
                  <GlobeMap />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── DEMO ── */}
          <section id="demo" className="px-6 py-20 md:py-28" style={{ background: BG.mid }}>
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-5">{t("demo.label")}</p>
                <h2 className="font-black tracking-tighter text-white mb-10" style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>
                  {t("demo.title")}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div
                  className="rounded-2xl overflow-hidden border border-violet-500/15 bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 32px 64px rgba(0,0,0,0.5)" }}
                >
                  <video className="w-full bg-black brightness-110" autoPlay loop muted playsInline
                    src="https://res.cloudinary.com/dufnkxsfm/video/upload/v1777248069/minidemo_kzfinl.mp4"
                  />
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-10 flex justify-center">
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
          <section className="px-6 py-20 md:py-28" style={{ background: BG.alt }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/30 uppercase tracking-widest mb-10 text-center">
                  Lo que dicen los usuarios
                </p>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div
                      className="rounded-2xl border border-dashed border-violet-500/[0.10] p-6 h-full"
                      style={{ background: "rgba(139,92,246,0.03)" }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-violet-900/40 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-2 w-20 bg-violet-800/30 rounded-full" />
                          <div className="h-1.5 w-14 bg-violet-900/30 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-2 bg-violet-800/20 rounded-full" />
                        <div className="h-2 bg-violet-800/20 rounded-full w-5/6" />
                        <div className="h-2 bg-violet-800/20 rounded-full w-4/6" />
                      </div>
                      <span className="text-[9px] font-mono text-violet-500/20 uppercase tracking-widest">Testimonio real aquí</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precios" className="px-6 py-24 md:py-32" style={{ background: BG.deep }}>
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/60 uppercase tracking-widest mb-5">
                  {t("pricingSection.label")}
                </p>
                <h2
                  className="font-black tracking-tighter text-white mb-4"
                  style={{ fontSize: "clamp(26px, 4vw, 50px)" }}
                >
                  {t("pricingSection.title")}
                  <span className="text-violet-400">{t("pricingSection.titleHighlight")}</span>
                </h2>
              </Reveal>

              {/* Value callout — 20× */}
              <Reveal delay={80}>
                <div
                  className="rounded-2xl border border-violet-500/20 p-6 mb-14 max-w-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(11,9,23,1) 100%)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="shrink-0 leading-none">
                      <span
                        className="font-black text-transparent bg-clip-text"
                        style={{
                          fontSize: "clamp(48px, 6vw, 72px)",
                          backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)",
                        }}
                      >
                        20×
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base leading-snug mb-1">
                        recuperas la inversión con tu primera venta web.
                      </p>
                      <p className="text-violet-200/45 text-sm leading-relaxed">
                        Los usuarios de Huntly pagan <span className="text-violet-300/70">$9 al mes</span>. Una sola web diseñada vale 200 € o más. Cierra uno y el plan está pagado 20 veces. La mayoría lo recupera en las primeras semanas.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-5">
                {PLANS.map((plan, i) => (
                  <Reveal key={i} delay={i * 70}>
                    <div
                      className="relative rounded-3xl flex flex-col p-8 h-full"
                      style={{
                        background: plan.popular
                          ? "linear-gradient(160deg, rgba(139,92,246,0.16) 0%, rgba(11,9,23,1) 55%)"
                          : "rgba(139,92,246,0.04)",
                        boxShadow: plan.popular
                          ? "0 0 0 1px rgba(139,92,246,0.40), 0 0 80px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)"
                          : "0 0 0 1px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.02)",
                      }}
                    >
                      {plan.popular && (
                        <div
                          className="absolute top-0 left-8 right-8 h-px"
                          style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.9), transparent)" }}
                        />
                      )}

                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-mono text-violet-300/40 uppercase tracking-widest">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t("pricingSection.mostPopular")}
                          </span>
                        )}
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className="font-black tracking-tight"
                            style={{
                              fontSize: "clamp(44px, 5vw, 60px)",
                              color: plan.popular ? "#fff" : "rgba(221,214,254,0.55)",
                            }}
                          >
                            {plan.price}
                          </span>
                          <span className="text-violet-400/40 text-sm">{plan.period}</span>
                        </div>
                        <p className="text-xs text-violet-200/35 mt-2 leading-relaxed">{plan.desc}</p>
                      </div>

                      <ul className="space-y-3.5 mb-10 flex-1">
                        {plan.features.map((feat, j) => (
                          <li key={j} className="flex items-start gap-3">
                            {feat.ok ? (
                              <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-violet-400" : "text-emerald-500/70"}`} />
                            ) : (
                              <span className="w-4 h-4 shrink-0 mt-1.5 flex items-center"><span className="w-3 h-px bg-violet-800/40 block" /></span>
                            )}
                            <span className={`text-sm leading-snug ${feat.ok ? (plan.popular ? "text-violet-100/80" : "text-violet-200/50") : "text-violet-300/20"}`}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <SignedOut>
                        {"checkoutKey" in plan && plan.checkoutKey ? (
                          <SignInButton mode="modal" forceRedirectUrl={`/checkout/${plan.checkoutKey}`}>
                            <button className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.08] hover:bg-violet-500/[0.14] text-violet-200/60 border border-violet-500/15"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        ) : (
                          <SignInButton mode="modal">
                            <button className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                              plan.popular
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                                : "bg-violet-500/[0.08] hover:bg-violet-500/[0.14] text-violet-200/60 border border-violet-500/15"
                            }`}>
                              {plan.cta}
                            </button>
                          </SignInButton>
                        )}
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href={"checkoutKey" in plan && plan.checkoutKey ? `/checkout/${plan.checkoutKey}` : "/pricing"}
                          className={`block text-center w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            plan.popular
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                              : "bg-violet-500/[0.08] hover:bg-violet-500/[0.14] text-violet-200/60 border border-violet-500/15"
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
            className="relative px-6 py-32 md:py-48 text-center overflow-hidden"
            style={{ background: `linear-gradient(to bottom, ${BG.mid}, ${BG.base})` }}
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.09) 0%, transparent 70%)" }}
            />
            <div className="relative max-w-4xl mx-auto">
              <Reveal>
                <p className="text-[10px] font-mono text-violet-400/30 uppercase tracking-widest mb-10">Empieza ahora</p>
                <h2
                  className="font-black tracking-tighter leading-[0.95] text-white mb-6"
                  style={{ fontSize: "clamp(28px, 5vw, 66px)" }}
                >
                  {t("finalCta.title1")}
                  <br />
                  <span className="text-violet-400">{t("finalCta.title2")}</span>
                </h2>
                <p className="text-violet-200/40 text-base mb-12">{t("finalCta.subtitle")}</p>
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
                  <span className="text-xs text-violet-400/30">{t("finalCta.freeNote")}</span>
                  <Link href="#precios" className="text-xs text-violet-400/30 hover:text-violet-300/60 transition-colors">
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
                <Sparkles className="w-4 h-4 text-violet-700" />
                <span className="text-sm font-semibold text-violet-300/30">Huntly</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-violet-300/30">
                <Link href="#demo" className="hover:text-violet-200/60 transition-colors">{t("footer.howItWorks")}</Link>
                <Link href="#precios" className="hover:text-violet-200/60 transition-colors">{t("footer.pricing")}</Link>
                <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200/60 transition-colors">{t("footer.contact")}</Link>
              </div>
              <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
