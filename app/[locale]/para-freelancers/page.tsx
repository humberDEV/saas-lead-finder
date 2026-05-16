import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huntly para Freelancers Web — Encuentra Clientes de Diseño Web",
  description:
    "Huntly ayuda a freelancers web a encontrar negocios locales sin página web en segundos. Busca por nicho y ciudad, obtén el teléfono y contacta por WhatsApp. 3 búsquedas gratis.",
  keywords:
    "freelance diseño web clientes, conseguir clientes diseño web, encontrar clientes freelance web, prospectar clientes web, negocios sin web freelance",
  alternates: {
    canonical: "https://tryhuntly.com/es/para-freelancers",
  },
  openGraph: {
    title: "Huntly para Freelancers Web",
    description:
      "Encuentra negocios locales sin página web en segundos. Prospecta como un profesional sin perder horas en Google Maps.",
    url: "https://tryhuntly.com/es/para-freelancers",
    siteName: "Huntly",
  },
};

const BG = {
  base: "#0e0b1e",
  deep: "#0b0917",
  mid: "#120f26",
  alt: "#100d22",
};

const NICHES = [
  "Barberías", "Clínicas Dentales", "Fisioterapeutas", "Peluquerías",
  "Gestorías", "Talleres Mecánicos", "Gimnasios", "Restaurantes",
  "Centros de Estética", "Ópticas", "Fontaneros", "Psicólogos",
];

const STEPS = [
  {
    n: "01",
    title: "Elige un nicho y una ciudad",
    desc: "Selecciona barberías en Madrid, clínicas dentales en Barcelona, fisioterapeutas en Valencia — o cualquier sector y ciudad que te interese.",
  },
  {
    n: "02",
    title: "Huntly filtra los que no tienen web",
    desc: "En segundos obtienes una lista de negocios sin página web, con su teléfono, valoración en Google y un score de oportunidad.",
  },
  {
    n: "03",
    title: "Contacta directamente y cierra",
    desc: "Llama con un clic o envía un WhatsApp con el mensaje de apertura generado automáticamente. Sin CRM complejo, sin herramientas extra.",
  },
];

const FAQS = [
  {
    q: "¿Necesito experiencia técnica para usar Huntly?",
    a: "No. Huntly está pensado para cualquier freelance que venda webs, ya sea con WordPress, Webflow, Framer, código o herramientas de IA. Solo necesitas saber buscar en Google.",
  },
  {
    q: "¿Cuántos clientes puedo encontrar al mes?",
    a: "Con el plan Go tienes 100 búsquedas al mes. Cada búsqueda puede devolver entre 5 y 20 negocios locales sin web. Eso es potencialmente cientos de leads cada mes.",
  },
  {
    q: "¿Funciona en mi ciudad?",
    a: "Huntly funciona en cualquier ciudad de España, México, Argentina, Colombia, Chile y el resto de países hispanohablantes.",
  },
  {
    q: "¿Puedo probar gratis?",
    a: "Sí. El plan gratuito incluye 3 búsquedas sin tarjeta. Suficiente para ver si hay oportunidades en tu ciudad y nicho.",
  },
];

export default function ParaFreelancersPage() {
  return (
    <div className="min-h-screen text-white antialiased" style={{ background: BG.base }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 h-14 backdrop-blur-md border-b border-violet-500/[0.08]"
        style={{ background: "rgba(14,11,30,0.92)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/es" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="font-bold tracking-tight">
              Hunt<span className="text-violet-400">ly</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg border border-violet-500/30 text-violet-200 hover:bg-violet-500/10 transition-all">
                  Entrar
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors text-white">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="pt-14">

        {/* HERO */}
        <section className="relative px-6 py-20 md:py-32 text-center" style={{ background: BG.base }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 100%)" }}
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/[0.10] border border-violet-500/25 rounded-full px-4 py-1.5 mb-8">
              <span className="text-xs text-violet-200 tracking-wide">Para freelancers web</span>
            </div>
            <h1
              className="font-black tracking-tighter leading-[0.92] text-white mb-6"
              style={{ fontSize: "clamp(32px, 5.5vw, 72px)" }}
            >
              Consigue clientes de
              <br />
              diseño web sin perder
              <br />
              <span className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
                horas en Google Maps.
              </span>
            </h1>
            <p className="text-base md:text-lg text-violet-200 mb-10 max-w-lg mx-auto leading-relaxed">
              Huntly escanea Google Maps, filtra los negocios sin página web y te da su teléfono con un mensaje listo para enviar. Prospección local en segundos.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                  style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
                >
                  Empezar gratis — 3 búsquedas sin tarjeta
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
              >
                Ir al dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.alt }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-6">El problema que resuelve</p>
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(20px, 3vw, 40px)" }}>
              Buscar clientes a mano es tiempo que no factura.
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "3–4 h/semana",
                  desc: "Revisando Google Maps, abriendo fichas, comprobando si tienen web y copiando teléfonos a mano.",
                },
                {
                  title: "Mucho ruido",
                  desc: "Negocios con web, sin teléfono o sin señales claras de que te necesiten. Difícil filtrar a mano.",
                },
                {
                  title: "Sin seguimiento",
                  desc: "Los leads se pierden entre notas en el móvil, WhatsApps sin respuesta y hojas de cálculo.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 border border-violet-500/10"
                  style={{ background: "rgba(139,92,246,0.04)" }}
                >
                  <p className="font-black text-violet-300 mb-2" style={{ fontSize: "clamp(20px, 2vw, 28px)" }}>{item.title}</p>
                  <p className="text-sm text-violet-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.mid }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Cómo funciona</p>
            <h2 className="font-black tracking-tighter text-white mb-12" style={{ fontSize: "clamp(20px, 3vw, 36px)" }}>
              Tres pasos. <span className="text-violet-400">Nada más.</span>
            </h2>
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <span
                    className="font-black shrink-0 leading-none"
                    style={{ fontSize: "clamp(32px, 4vw, 56px)", color: "rgba(139,92,246,0.2)" }}
                  >
                    {step.n}
                  </span>
                  <div className="pt-2">
                    <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-violet-200 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-[0_0_32px_rgba(139,92,246,0.3)]">
                    Buscar mis primeros clientes <ArrowRight className="w-4 h-4" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-sm">
                  Ir al dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* NICHOS */}
        <section className="px-6 py-16 md:py-20" style={{ background: BG.alt }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Nichos disponibles</p>
            <h2 className="font-black tracking-tighter text-white mb-4" style={{ fontSize: "clamp(20px, 2.8vw, 34px)" }}>
              Más de 35 nichos de negocio.
            </h2>
            <p className="text-sm text-violet-200 mb-8 max-w-lg">
              Barberías en Madrid, talleres mecánicos en Sevilla, fisioterapeutas en Barcelona — cualquier sector local en cualquier ciudad hispanohablante.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {NICHES.map((niche) => (
                <div
                  key={niche}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-500/[0.10] text-xs text-violet-300 font-medium"
                  style={{ background: "rgba(139,92,246,0.04)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {niche}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUE */}
        <section className="px-6 py-16 md:py-20" style={{ background: BG.deep }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">Por qué tiene sentido</p>
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(20px, 3vw, 38px)" }}>
              $9 al mes. Una venta los cubre
              <span className="text-violet-400"> 20 veces.</span>
            </h2>
            <ul className="space-y-3 mb-10">
              {[
                "Una web básica para un negocio local vale entre 300€ y 1.500€",
                "Huntly Go cuesta $9/mes — menos que un café a la semana",
                "Con cerrar un solo cliente tienes el plan pagado durante meses",
                "El tiempo que ahorras en prospección es tiempo que puedes facturar",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-violet-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0e0b1e] font-bold text-[15px] rounded-2xl hover:bg-violet-50 transition-all"
                >
                  Empezar con 3 búsquedas gratis <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16 md:py-24" style={{ background: BG.mid }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: "clamp(20px, 3vw, 32px)" }}>
              Preguntas frecuentes
            </h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  name="faq"
                  className="group border border-violet-500/[0.10] rounded-xl overflow-hidden open:border-violet-500/[0.20]"
                  style={{ background: "rgba(139,92,246,0.04)" }}
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <svg
                      className="w-4 h-4 text-violet-500 shrink-0 transition-transform duration-200 group-open:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-violet-200 leading-relaxed border-t border-violet-500/[0.08] pt-4">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-violet-500/[0.07] py-8 px-6" style={{ background: BG.base }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/es" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-400/75">Huntly</span>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-violet-400/75">
              <Link href="/es" className="hover:text-violet-200 transition-colors">Inicio</Link>
              <Link href="/es/para-agencias" className="hover:text-violet-200 transition-colors">Para agencias</Link>
              <Link href="/es/blog/conseguir-clientes-web" className="hover:text-violet-200 transition-colors">Guía prospección</Link>
              <Link href="mailto:huntly@outlook.es" className="hover:text-violet-200 transition-colors">Contacto</Link>
            </div>
            <p className="text-sm text-violet-300/20">© {new Date().getFullYear()} Huntly</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
