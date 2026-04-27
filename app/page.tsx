import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight, CheckCircle, LogIn, MapPin,
  Sparkles, ArrowUpRight, Search, ChevronDown, Copy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Huntly — Encuentra negocios locales a los que venderles una web",
  description:
    "Busca por nicho y ciudad. Huntly detecta negocios sin web, con teléfono disponible y señales claras de oportunidad. 3 búsquedas gratis.",
  keywords: "vender páginas web, conseguir clientes agencia web, negocios sin web, leads locales, freelance web, prospección web",
  openGraph: {
    title: "Huntly — Encuentra negocios locales a los que venderles una web",
    description: "Busca por nicho y ciudad. Detecta oportunidades reales. 3 búsquedas gratis.",
    images: ["/og-image.png"],
  },
};

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes",
    desc: "Para probar Huntly y encontrar tus primeros leads.",
    features: [
      { text: "3 búsquedas gratis", ok: true },
      { text: "Score de oportunidad en cada lead", ok: true },
      { text: "WhatsApp y llamada directa", ok: true },
      { text: "Ver en Google Maps", ok: true },
      { text: "Sin tarjeta", ok: true },
      { text: "Guardar en Mi Cartera", ok: false },
      { text: "Historial de búsquedas", ok: false },
    ],
    cta: "Empezar gratis",
    popular: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "/mes",
    desc: "Para freelancers que quieren buscar oportunidades cada semana.",
    features: [
      { text: "120 búsquedas/mes", ok: true },
      { text: "Score de oportunidad en cada lead", ok: true },
      { text: "WhatsApp y llamada directa", ok: true },
      { text: "Guardar leads en cartera", ok: true },
      { text: "Historial de búsquedas", ok: true },
      { text: "Soporte por email", ok: true },
    ],
    cta: "Contratar Starter",
    popular: true,
  },
  {
    name: "Agency",
    price: "$49",
    period: "/mes",
    desc: "Para agencias o equipos que hacen prospección de forma constante.",
    features: [
      { text: "400 búsquedas/mes", ok: true },
      { text: "Todo lo de Starter", ok: true },
      { text: "Soporte prioritario", ok: true },
      { text: "Acceso beta a nuevas funciones", ok: true },
      { text: "Pensado para alto volumen", ok: true },
    ],
    cta: "Contratar Agency",
    popular: false,
  },
];

const FAQS = [
  {
    q: "¿Huntly garantiza que voy a conseguir clientes?",
    a: "No. Huntly te ayuda a encontrar negocios con señales de oportunidad, pero cerrar clientes depende de tu oferta, mensaje y seguimiento.",
  },
  {
    q: "¿De dónde salen los resultados?",
    a: "Huntly usa datos públicos de negocios locales y los organiza para que puedas detectar oportunidades más rápido.",
  },
  {
    q: "¿Los teléfonos están verificados?",
    a: "Huntly muestra teléfonos disponibles en las fichas de negocio. Aun así, siempre recomendamos revisar el lead antes de contactar.",
  },
  {
    q: "¿Puedo buscar cualquier nicho?",
    a: "Sí. Puedes usar nichos predefinidos o escribir el sector que quieras.",
  },
  {
    q: "¿Necesito saber programar?",
    a: "No. Huntly está pensado para freelancers, agencias pequeñas y creadores que venden webs con IA, WordPress, Webflow, Framer o código.",
  },
  {
    q: "¿Qué pasa si un negocio ya tiene web?",
    a: "Huntly intenta priorizar negocios sin web o con señales de oportunidad, pero puede haber casos donde debas revisar el lead manualmente.",
  },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

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

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/[0.08]"
      style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}
    >
      {/* Browser chrome */}
      <div className="bg-[#16162a] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#0d0d20] border border-white/[0.07] rounded-md px-3 py-1 text-[11px] text-zinc-600 text-center">
          huntly.app/dashboard
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

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

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
            offers: { "@type": "AggregateOffer", lowPrice: "0", highPrice: "49", priceCurrency: "USD" },
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
                Cómo funciona
              </Link>
              <Link href="#precios" className="text-sm text-zinc-300 hover:text-white transition-colors hidden md:block">
                Precios
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                    <LogIn className="w-3.5 h-3.5" /> Entrar
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
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

            <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-[1fr_1.15fr] gap-12 items-center">

              {/* LEFT */}
              <div>
                <h1 className="text-5xl md:text-[60px] font-black leading-[1.0] tracking-tighter mb-5">
                  Encuentra negocios
                  <br />
                  locales a los que
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">venderles una web.</span>
                </h1>
                <p className="text-[18px] text-[#94a3b8] leading-relaxed mb-8 max-w-sm">
                  Busca por nicho y ciudad. Huntly encuentra negocios sin web, con teléfono disponible y señales claras para contactar.
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.3)]">
                        Encontrar mis primeros leads gratis
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.3)]">
                      Ir al Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                  <Link
                    href="#demo"
                    className="flex items-center gap-1.5 px-5 py-3 text-sm text-zinc-400 hover:text-white transition-colors rounded-xl border border-white/[0.08] hover:border-white/20"
                  >
                    Ver cómo funciona
                  </Link>
                </div>
                <p className="text-xs text-zinc-400">3 búsquedas gratis · Sin tarjeta · Sin permanencia</p>
              </div>

              {/* RIGHT — browser frame with mini dashboard */}
              <div className="hidden md:block">
                <BrowserFrame>
                  <div className="bg-[#0d0d14] p-4">
                    {/* Search bar */}
                    <div className="flex gap-2 mb-4 p-3 bg-[#111120] rounded-xl border border-white/[0.06]">
                      <div className="flex-1 bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-zinc-400 flex items-center gap-1.5">
                        <span>Barberías</span>
                        <ChevronDown className="w-3 h-3 text-zinc-600 ml-auto" />
                      </div>
                      <div className="flex-1 bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                        <span>Madrid, Centro</span>
                      </div>
                      <button className="px-4 py-2 bg-white text-black text-xs font-black rounded-lg whitespace-nowrap flex items-center gap-1">
                        <Search className="w-3 h-3" /> Buscar
                      </button>
                    </div>

                    {/* Results header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-sm">🚨</span>
                      <span className="text-xs font-bold text-white">3 oportunidades encontradas</span>
                      <div className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </div>
                    </div>

                    {/* 2 cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Barbería El Rincón", addr: "Calle Mayor 14", rating: "4.8", reviews: "47", phone: "+34 612 345 678" },
                        { name: "Peluquería Nova", addr: "Gran Vía 88", rating: "4.6", reviews: "31", phone: "+34 610 987 234" },
                      ].map((b, i) => (
                        <div key={i} className="bg-[#111120] border border-indigo-500/15 rounded-xl p-3">
                          <div className="flex items-start justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-white leading-tight">{b.name}</span>
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/12 border border-indigo-500/20 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                              T{i + 1}
                            </span>
                          </div>
                          <div className="text-[9px] text-zinc-600 mb-1.5 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {b.addr}
                          </div>
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="text-[10px] text-yellow-400">★ {b.rating}</span>
                            <span className="text-[9px] text-zinc-600">({b.reviews})</span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/8 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              SIN WEB
                            </span>
                          </div>
                          <div className="bg-emerald-500/6 border border-emerald-500/15 rounded-lg p-1.5 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              <span className="text-[9px] font-bold text-emerald-400">Alta probabilidad</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="flex-1 bg-emerald-500 text-black text-[9px] font-bold py-1.5 rounded">WA</button>
                            <button className="flex-1 bg-white/6 border border-white/10 text-white text-[9px] py-1.5 rounded">Llamar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </BrowserFrame>
              </div>
            </div>
          </section>

          {/* ── TICKER ── */}
          <div className="bg-[#0a0a12] py-3 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs text-zinc-300 shrink-0">
                  <span className="text-emerald-500 font-bold">●</span>
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{item.city}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-emerald-400 font-semibold">SIN WEB</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-zinc-400">{item.phone}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-yellow-500">★ {item.rating}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── STAT BAR ── */}
          <div className="bg-[#0f1117] border-y border-white/[0.04]">
            <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-zinc-200">
              <span>Búsquedas por ciudad y nicho</span>
              <span className="text-zinc-700 hidden sm:inline">·</span>
              <span>Resultados en segundos</span>
              <span className="text-zinc-700 hidden sm:inline">·</span>
              <span>Teléfonos disponibles</span>
            </div>
          </div>

          {/* ── PROBLEMA ── */}
          <section className="bg-[#0d0d14]">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="grid md:grid-cols-[1.3fr_1fr] gap-16 items-start">
                <div>
                  <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-5">El problema</p>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-white mb-5">
                    Buscar clientes a mano
                    <br />
                    <span
                      className="text-red-400"
                      style={{ textShadow: "0 0 40px rgba(248,113,113,0.5)" }}
                    >
                      es tiempo que no factura.
                    </span>
                  </h2>
                  <p className="text-zinc-300 text-base leading-relaxed max-w-sm">
                    Cada hora revisando Google Maps es una hora que no estás vendiendo webs ni entregando proyectos.
                  </p>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {[
                    { stat: "3–4 h/semana", detail: "buscando negocios, revisando webs y copiando teléfonos a mano" },
                    { stat: "Mucho ruido", detail: "negocios con web, sin teléfono o sin señales claras de oportunidad" },
                    { stat: "Sin seguimiento", detail: "leads perdidos entre notas, WhatsApp, hojas de cálculo y capturas" },
                  ].map((item) => (
                    <div key={item.stat} className="py-5 flex items-center gap-5">
                      <div className="w-1 h-10 rounded-full bg-red-500 shrink-0" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.6)" }} />
                      <div>
                        <span className="block text-red-400 font-bold text-sm">{item.stat}</span>
                        <span className="block text-zinc-300 text-sm mt-0.5">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── DEMO / VIDEO ── */}
          <section id="demo" className="bg-[#0f1117]">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="mb-10">
                <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-3">Producto real</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                  Así encuentras clientes.
                </h2>
                <p className="text-zinc-300 text-sm mt-2 max-w-lg">
                  Busca un nicho y una ciudad. Huntly detecta negocios sin web, prioriza oportunidades y te deja contactarlos en segundos.
                </p>
              </div>

              {/* Video */}
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

              {/* CTA */}
              <div className="mt-10 text-center">
                <p className="text-zinc-400 text-sm mb-4">¿Quieres probarlo con tu ciudad?</p>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]">
                      Buscar mis primeros leads gratis
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(99,102,241,0.25)]"
                  >
                    Buscar mis primeros leads gratis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </section>

          {/* ── CÓMO FUNCIONA ── */}
          <section id="como-funciona" className="bg-[#0d0d14]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">Cómo funciona</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-14">
                Tres pasos.<span className="text-indigo-400"> Nada más.</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
                {[
                  {
                    n: "01",
                    title: "Elige nicho y ciudad",
                    note: "Barberías en Madrid, clínicas en Valencia o cualquier sector local.",
                    preview: (
                      <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/[0.05]">
                        <div className="bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-[10px] text-zinc-400 flex items-center justify-between mb-2">
                          Barberías <ChevronDown className="w-3 h-3 text-zinc-600" />
                        </div>
                        <div className="bg-black/60 border border-white/[0.07] rounded-lg px-3 py-2 text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <MapPin className="w-2.5 h-2.5 text-zinc-600" /> Madrid, Centro
                        </div>
                      </div>
                    ),
                  },
                  {
                    n: "02",
                    title: "Huntly filtra oportunidades",
                    note: "Detecta negocios sin web, con teléfono disponible y señales de actividad.",
                    preview: (
                      <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/[0.05] space-y-1.5">
                        {["🟢 Barbería El Rincón · SIN WEB", "🟢 Peluquería Nova · SIN WEB", "🟡 Barbería Cortex · Revisando"].map((line, i) => (
                          <div key={i} className="text-[10px] text-zinc-400 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                            {line}
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    n: "03",
                    title: "Contacta y guarda el seguimiento",
                    note: "Envía un WhatsApp, llama o guarda el lead en tu cartera para hacer seguimiento.",
                    preview: (
                      <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/[0.05]">
                        <div className="text-[10px] text-zinc-600 mb-2">Mensaje generado:</div>
                        <div className="text-[10px] text-zinc-300 leading-relaxed mb-2 line-clamp-2">
                          "Me dedico al diseño web y vi que tienen 47 reseñas pero no tienen página..."
                        </div>
                        <div className="flex gap-1.5">
                          <div className="flex-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] text-emerald-400 font-bold py-1 text-center">WA</div>
                          <div className="flex-1 bg-white/5 border border-white/10 rounded text-[9px] text-white py-1 text-center">Llamar</div>
                          <div className="w-7 bg-white/5 border border-white/10 rounded text-[9px] text-zinc-400 py-1 flex items-center justify-center">
                            <Copy className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ].map((step) => (
                  <div key={step.n} className="bg-[#0f1117] p-8">
                    <span className="block text-xs font-mono text-indigo-500 mb-3">{step.n}</span>
                    <p className="text-white font-semibold leading-snug mb-1">{step.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.note}</p>
                    {step.preview}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PARA QUIÉN ES ── */}
          <section className="bg-[#0f1117]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">Para quién es</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-14">
                Hecho para gente que vende webs.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Freelancers web",
                    desc: "Encuentra negocios locales sin perder horas revisando Google Maps.",
                  },
                  {
                    title: "Agencias pequeñas",
                    desc: "Llena tu cartera con búsquedas por ciudad, sector y oportunidad.",
                  },
                  {
                    title: "Creadores con IA",
                    desc: "Si ya sabes crear webs rápido, Huntly te ayuda a encontrar a quién venderlas.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6"
                  >
                    <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="precios" className="bg-[#0f1117]">
            <div className="max-w-5xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">Precios</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-5">
                Sin permanencia.<span className="text-indigo-400"> Cancela cuando quieras.</span>
              </h2>

              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-4 mb-10 max-w-lg">
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-400 leading-relaxed">
                  <span className="text-white font-medium">Un cliente web puede valer mucho más que un mes de Huntly.</span>{" "}
                  <span className="text-emerald-400">Con cerrar uno, el plan se paga solo.</span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 items-start">
                {PLANS.map((plan, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl border flex flex-col p-6 ${plan.popular
                      ? "border-indigo-500/35 bg-indigo-950/15 shadow-[0_0_48px_rgba(99,102,241,0.07)]"
                      : "border-white/[0.07] bg-white/[0.015]"
                      }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-5 bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Más popular
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-white mb-0.5">{plan.name}</h3>
                      <p className="text-xs text-zinc-400">{plan.desc}</p>
                    </div>
                    <div className="mb-5 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                      <span className="text-zinc-400 text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm">
                          {feat.ok ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" />
                          )}
                          <span className={feat.ok ? "text-zinc-300" : "text-zinc-700"}>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.popular
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                          : "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]"
                          }`}>
                          {plan.cta}
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link
                        href="/pricing"
                        className={`block text-center w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.popular
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
          <section className="bg-[#0d0d14]">
            <div className="max-w-2xl mx-auto px-6 py-24">
              <p className="text-xs font-mono text-indigo-500 uppercase tracking-wide mb-4">FAQ</p>
              <h2 className="text-3xl font-black tracking-tighter text-white mb-10">Preguntas frecuentes</h2>
              <div itemScope itemType="https://schema.org/FAQPage" className="space-y-2">
                {FAQS.map((faq, i) => (
                  <details
                    key={i}
                    itemProp="mainEntity"
                    itemScope
                    itemType="https://schema.org/Question"
                    name="faq"
                    className="group bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden open:border-white/[0.10]"
                  >
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                      <span itemProp="name" className="text-sm font-semibold text-white">{faq.q}</span>
                      <svg
                        className="w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 group-open:rotate-180"
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
                      <p itemProp="text" className="text-zinc-300 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section className="bg-[#0f1117]">
            <div className="max-w-6xl mx-auto px-6 py-28">
              <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.0] text-white mb-4">
                    Tu próximo cliente web
                    <br />
                    <span className="text-indigo-400">puede estar en Google Maps.</span>
                  </h2>
                  <p className="text-zinc-400 text-sm mt-2">
                    Huntly te ayuda a encontrarlo, contactarlo y hacer seguimiento.
                  </p>
                  <p className="text-zinc-500 text-xs mt-3">3 búsquedas gratis · Sin tarjeta · Sin permanencia</p>
                </div>
                <div className="flex flex-col gap-3 min-w-[220px]">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="group flex items-center justify-center gap-2 w-full px-7 py-3.5 bg-white text-[#0d0d14] text-sm font-bold rounded-xl hover:bg-zinc-100 transition-colors">
                        Encontrar mis primeros leads gratis
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="group flex items-center justify-center gap-2 w-full px-7 py-3.5 bg-white text-[#0d0d14] text-sm font-bold rounded-xl hover:bg-zinc-100 transition-colors">
                      Ir al Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </SignedIn>
                  <Link href="#precios" className="text-center text-xs text-zinc-400 hover:text-white transition-colors py-2">
                    Ver planes y precios →
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
                <Link href="#como-funciona" className="hover:text-zinc-400 transition-colors">Cómo funciona</Link>
                <Link href="#precios" className="hover:text-zinc-400 transition-colors">Precios</Link>
                <Link href="mailto:hola@huntly.app" className="hover:text-zinc-400 transition-colors">Contacto</Link>
              </div>
              <p className="text-sm text-zinc-700">© {new Date().getFullYear()} Huntly</p>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
