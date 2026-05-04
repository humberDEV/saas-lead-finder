"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation2, CheckCircle, Clock, CalendarDays, Copy, CopyCheck, Map, Globe, Star, Lock } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";

type Lead = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  score: number;
  status: string;
  notes: string | null;
  website: string | null;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  rating: number;
  reviewCount: number;
  suggestedMessage: string | null;
  temperature: string | null;
  scoreLabel: string | null;
  createdAt: string;
};

export default function CRM() {
  const t = useTranslations("crm");
  const { plan } = useSidebar();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (plan === "free") { setLoading(false); return; }
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeads(data);
        setLoading(false);
      });
  }, [plan]);

  if (plan === "free") {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d0d14]">
        <div className="text-center max-w-sm">
          <Lock className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t("title")}</h2>
          <p className="text-sm text-zinc-500 mb-6">
            {t("locked")}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors"
          >
            {t("viewPlans")}
          </Link>
        </div>
      </div>
    );
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id, status: newStatus }),
    });
  };

  const copyMessage = (lead: Lead) => {
    const msg = lead.suggestedMessage ?? lead.notes ?? lead.name;
    navigator.clipboard.writeText(msg);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingLeads = leads.filter(l => l.status === "PENDIENTE");
  const inContactLeads = leads.filter(l => l.status === "EN_CONTACTO");
  const closedLeads = leads.filter(l => l.status === "CERRADO");

  const LeadCard = ({ lead }: { lead: Lead }) => {
    const cleanPhone = lead.phone?.replace(/[^0-9+]/g, "") ?? "";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + lead.address)}`;

    return (
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col gap-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white text-base leading-snug">{lead.name}</h3>
            {lead.scoreLabel && (
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                lead.temperature === "🟢" ? "bg-emerald-500/15 text-emerald-400" :
                lead.temperature === "🟡" ? "bg-amber-500/15 text-amber-400" :
                lead.temperature === "🟠" ? "bg-orange-500/15 text-orange-400" :
                "bg-red-500/15 text-red-400"
              }`}>
                {lead.scoreLabel}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 shrink-0 text-zinc-600" />
              <span className="line-clamp-1">{lead.address}</span>
            </span>
            {lead.phone && (
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Navigation2 className="w-3 h-3 shrink-0" />
                {lead.phone}
              </span>
            )}
            {lead.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 shrink-0 text-emerald-400" />
                {lead.rating} <span className="text-zinc-600">({lead.reviewCount} {t("reviews")})</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 shrink-0 text-zinc-600" />
              {lead.hasWebsite
                ? <span className="text-zinc-500 truncate">{lead.website || t("hasWeb")}</span>
                : <span className="text-emerald-400 font-semibold">{t("noWeb")}</span>
              }
            </span>
          </div>
        </div>

        {lead.phone && (
          <div className="flex gap-2">
            {lead.hasWhatsapp && (lead.suggestedMessage || lead.notes) && (
              <button
                onClick={() => {
                  const msg = lead.suggestedMessage ?? lead.notes ?? "";
                  copyMessage(lead);
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-all"
              >
                {copiedId === lead.id ? <CopyCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                WhatsApp
              </button>
            )}
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              {t("call")}
            </a>
          </div>
        )}

        <div className="flex gap-2 items-center border-t border-neutral-800/50 pt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-all"
          >
            <Map className="w-3.5 h-3.5" /> Maps
          </a>
          <select
            className="flex-1 bg-black border border-neutral-700 text-xs text-white rounded-lg px-2 py-2 focus:outline-none"
            value={lead.status}
            onChange={(e) => updateStatus(lead.id, e.target.value)}
          >
            <option value="PENDIENTE">{t("statusPending")}</option>
            <option value="EN_CONTACTO">{t("statusContacted")}</option>
            <option value="CERRADO">{t("statusAccepted")}</option>
            <option value="DESCARTADO">{t("statusDiscarded")}</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      <main className="max-w-6xl mx-auto p-6 md:p-12 pb-24">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">{t("title")}</h1>
          <p className="text-zinc-400 font-medium">{t("subtitle")}</p>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-center py-20 font-medium">{t("loading")}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <section>
              <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Clock className="text-amber-500 w-4 h-4" /> {t("columnPending")} ({pendingLeads.length})
              </h2>
              <div className="space-y-4">
                {pendingLeads.map(l => <LeadCard key={l.id} lead={l} />)}
                {pendingLeads.length === 0 && (
                  <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">{t("emptyPending")}</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Navigation2 className="text-indigo-400 w-4 h-4" /> {t("columnContacted")} ({inContactLeads.length})
              </h2>
              <div className="space-y-4">
                {inContactLeads.map(l => <LeadCard key={l.id} lead={l} />)}
                {inContactLeads.length === 0 && (
                  <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">{t("emptyContacted")}</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="text-emerald-500 w-4 h-4" /> {t("columnAccepted")} ({closedLeads.length})
              </h2>
              <div className="space-y-4">
                {closedLeads.map(l => <LeadCard key={l.id} lead={l} />)}
                {closedLeads.length === 0 && (
                  <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">{t("emptyAccepted")}</p>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
