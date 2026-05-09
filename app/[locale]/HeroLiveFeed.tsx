"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin } from "lucide-react";

const LEADS = [
  { name: "Barbería El Rincón", city: "Madrid", score: 95, reviews: 247, phone: "+34 612 345 678" },
  { name: "Clínica Dental Arco", city: "Valencia", score: 80, reviews: 312, phone: "+34 961 234 567" },
  { name: "Estética Luna", city: "Málaga", score: 95, reviews: 189, phone: "+34 660 123 456" },
  { name: "Reformas González", city: "Bilbao", score: 60, reviews: 74, phone: "+34 944 567 890" },
  { name: "Gestoría Pérez", city: "Alicante", score: 40, reviews: 22, phone: "+34 965 345 678" },
  { name: "CrossFit Zona Sur", city: "Murcia", score: 60, reviews: 91, phone: "+34 690 234 567" },
];

export default function HeroLiveFeed() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % LEADS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const lead = LEADS[index];
  const scoreColor = lead.score >= 80 ? "#34d399" : lead.score >= 50 ? "#fb923c" : "#94a3b8";

  return (
    <div
      className="w-64 rounded-2xl border p-4 select-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        background: "linear-gradient(150deg, rgba(20,14,40,0.95) 0%, rgba(12,9,28,0.98) 100%)",
        borderColor: "rgba(139,92,246,0.20)",
        boxShadow: "0 0 40px rgba(139,92,246,0.08), 0 0 0 1px rgba(139,92,246,0.10)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-bold text-white leading-tight">{lead.name}</span>
        <span
          className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
        >
          SIN WEB
        </span>
      </div>

      {/* City + phone */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-1.5 text-violet-300/40">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px]">{lead.city}</span>
        </div>
        <div className="flex items-center gap-1.5 text-violet-300/40">
          <Phone className="w-2.5 h-2.5 shrink-0" />
          <span className="text-[10px] font-mono">{lead.phone}</span>
        </div>
      </div>

      {/* Reviews + score bar */}
      <div className="border-t border-violet-500/10 pt-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] text-violet-300/40">★ {lead.reviews} reseñas</span>
          <span className="text-[9px] font-black" style={{ color: scoreColor }}>{lead.score}/100</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${lead.score}%`,
              background: `linear-gradient(to right, ${scoreColor}88, ${scoreColor})`,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[8px] font-mono text-violet-400/40 uppercase tracking-widest">Detectado ahora</span>
      </div>
    </div>
  );
}
