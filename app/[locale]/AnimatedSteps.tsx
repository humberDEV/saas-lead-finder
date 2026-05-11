"use client";

import { useState, useEffect } from "react";
import { Phone, MessageCircle, Search, ChevronDown } from "lucide-react";

interface Step {
  n: string;
  title: string;
  desc: string;
}

// Tick boundaries
const STEP_STARTS = [0, 17, 29] as const;
const STEP_ENDS   = [17, 29, 50] as const;
const TOTAL_TICKS = 50; // 10 s @ 200 ms

function getAnim(t: number) {
  const step =
    t < STEP_STARTS[1] ? 0 :
    t < STEP_STARTS[2] ? 1 : 2;

  // ── step 1: search form ──
  const dropdownOpen  = t >= 3 && t < 7;
  const nichoSelected = t >= 7;
  const cityText      = "Madrid".slice(0, Math.max(0, Math.min(6, t - 10)));
  const searching     = t >= 15 && t < 17;

  // ── step 2: leads ──
  const visibleLeads = t < 17 ? 0 : t < 19 ? 0 : t < 22 ? 1 : t < 25 ? 2 : 3;

  // ── step 3: contact ──
  const showMessage = t >= 33;

  // progress within current step (0–1)
  const start  = STEP_STARTS[step];
  const length = STEP_ENDS[step] - start;
  const progress = Math.min(1, (t - start) / length);

  return { step, dropdownOpen, nichoSelected, cityText, searching, visibleLeads, showMessage, progress };
}

const MOCK_LEADS = [
  { name: "Barbería El Rincón", rating: "4.8", reviews: 24, score: 95, label: "Oportunidad ideal", color: "#4ade80" },
  { name: "Cortes & Estilos",   rating: "4.5", reviews: 11, score: 95, label: "Oportunidad ideal", color: "#4ade80" },
  { name: "Navaja de Plata",    rating: "4.2", reviews: 7,  score: 60, label: "Explorar",          color: "#fb923c" },
];

export default function AnimatedSteps({ steps }: { steps: Step[] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % TOTAL_TICKS), 200);
    return () => clearInterval(id);
  }, []);

  const a = getAnim(tick);

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cursorBlink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        .cursor-blink { animation: cursorBlink 0.9s step-end infinite; }
      `}</style>

      {/* ── Step headers ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl p-5"
            style={{
              background: "rgba(139,92,246,0.04)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.10)",
            }}
          >
            <span
              className="font-black leading-none text-transparent bg-clip-text"
              style={{
                fontSize: "clamp(28px, 3vw, 40px)",
                backgroundImage: "linear-gradient(135deg, #a78bfa, #e879f9)",
              }}
            >
              {step.n}
            </span>

            <div>
              <h3 className="text-sm font-bold mb-1.5 text-white">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(196,181,253,0.7)" }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mock UI panel ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,8,22,0.95)",
          border: "1px solid rgba(139,92,246,0.14)",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.06), 0 24px 48px rgba(0,0,0,0.45)",
        }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/[0.08]"
          style={{ background: "rgba(139,92,246,0.04)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/35" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/35" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/35" />
          <span className="ml-3 text-[10px] font-mono text-violet-400/40 tracking-wider">
            huntly.app · dashboard
          </span>
        </div>

        <div className="p-5 md:p-6 min-h-[200px]">

          {/* ── Step 1: Search form ── */}
          {a.step === 0 && (
            <div className="space-y-4 fade-up">
              <p className="text-[10px] font-mono text-violet-400/50 uppercase tracking-widest">
                Nueva búsqueda
              </p>
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Nicho dropdown */}
                <div className="relative flex-1">
                  <div
                    className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-300"
                    style={{
                      background: "rgba(139,92,246,0.07)",
                      border: `1px solid ${a.dropdownOpen ? "rgba(139,92,246,0.55)" : "rgba(139,92,246,0.18)"}`,
                      boxShadow: a.dropdownOpen ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
                    }}
                  >
                    <span style={{ color: a.nichoSelected ? "#ddd6fe" : "rgba(139,92,246,0.4)" }}>
                      {a.nichoSelected ? "Barberías" : "Tipo de negocio..."}
                    </span>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-violet-500/50 shrink-0 transition-transform duration-200"
                      style={{ transform: a.dropdownOpen ? "rotate(180deg)" : "none" }}
                    />
                  </div>

                  {a.dropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 fade-up"
                      style={{
                        background: "rgba(16,13,34,0.98)",
                        border: "1px solid rgba(139,92,246,0.22)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                      }}
                    >
                      {["Barberías", "Clínicas dentales", "Talleres mecánicos"].map((opt, j) => (
                        <div
                          key={opt}
                          className="px-4 py-2.5 text-sm"
                          style={{
                            background: j === 0 ? "rgba(139,92,246,0.18)" : "transparent",
                            color:      j === 0 ? "#e2d9fe"               : "rgba(167,139,250,0.45)",
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* City input */}
                <div className="flex-1">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                    style={{
                      background: "rgba(139,92,246,0.07)",
                      border: `1px solid ${a.cityText ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.18)"}`,
                    }}
                  >
                    <span style={{ color: a.cityText ? "#ddd6fe" : "rgba(139,92,246,0.35)" }}>
                      {a.cityText || "Ciudad..."}
                    </span>
                    {a.cityText && a.cityText.length < 6 && (
                      <span className="cursor-blink w-0.5 h-4 bg-violet-400 inline-block" />
                    )}
                  </div>
                </div>

                {/* Search button */}
                <div
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-500"
                  style={{
                    background: a.searching
                      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                      : "rgba(139,92,246,0.12)",
                    color:  a.searching ? "#fff" : "rgba(167,139,250,0.6)",
                    border: `1px solid ${a.searching ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.18)"}`,
                    boxShadow: a.searching ? "0 0 28px rgba(139,92,246,0.45)" : "none",
                  }}
                >
                  <Search className="w-3.5 h-3.5" />
                  Buscar
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Lead results ── */}
          {a.step === 1 && (
            <div className="space-y-3 fade-up">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono text-violet-400/50 uppercase tracking-widest">
                  Barberías · Madrid
                </p>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {a.visibleLeads} sin web encontrados
                </span>
              </div>

              {MOCK_LEADS.slice(0, a.visibleLeads).map((lead, i) => (
                <div
                  key={i}
                  className="fade-up flex items-center justify-between gap-4 p-3.5 rounded-xl"
                  style={{
                    background: "rgba(139,92,246,0.05)",
                    border: "1px solid rgba(139,92,246,0.10)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">{lead.name}</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          color: "#4ade80",
                          background: "rgba(74,222,128,0.10)",
                          border: "1px solid rgba(74,222,128,0.20)",
                        }}
                      >
                        Sin web
                      </span>
                    </div>
                    <div className="text-[11px] text-violet-400/60">
                      <span className="text-yellow-400">★ {lead.rating}</span>
                      {" · "}
                      {lead.reviews} reseñas
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black leading-none" style={{ color: lead.color }}>
                      {lead.score}
                    </div>
                    <div className="text-[9px] font-medium mt-0.5" style={{ color: lead.color }}>
                      {lead.label}
                    </div>
                  </div>
                </div>
              ))}

              {a.visibleLeads < 3 && (
                <div
                  className="h-12 rounded-xl animate-pulse"
                  style={{
                    background: "rgba(139,92,246,0.03)",
                    border: "1px solid rgba(139,92,246,0.06)",
                  }}
                />
              )}
            </div>
          )}

          {/* ── Step 3: Contact ── */}
          {a.step === 2 && (
            <div className="fade-up">
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.14)",
                }}
              >
                {/* Lead header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">Barbería El Rincón</span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          color: "#4ade80",
                          background: "rgba(74,222,128,0.10)",
                          border: "1px solid rgba(74,222,128,0.20)",
                        }}
                      >
                        Sin web
                      </span>
                    </div>
                    <div className="text-[11px] text-violet-400/60">
                      <span className="text-yellow-400">★ 4.8</span>
                      {" · 24 reseñas · Madrid"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black leading-none text-emerald-400">95</div>
                    <div className="text-[9px] text-emerald-400 font-medium">Oportunidad ideal</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-3">
                  <div
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.22)",
                      color: "#4ade80",
                    }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      border: "1px solid rgba(139,92,246,0.22)",
                      color: "#c4b5fd",
                    }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Llamar
                  </div>
                </div>

                {/* Auto-generated message */}
                {a.showMessage && (
                  <div
                    className="fade-up rounded-lg px-3.5 py-3 text-xs text-violet-200/75 leading-relaxed"
                    style={{
                      background: "rgba(139,92,246,0.05)",
                      border: "1px solid rgba(139,92,246,0.09)",
                      fontStyle: "italic",
                    }}
                  >
                    "Hola, he visto que tenéis muy buenas reseñas en Google Maps y os quería comentar que podría ayudaros con una página web para conseguir más clientes online..."
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
