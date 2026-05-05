"use client";

import { useEffect, useState } from "react";
import {
  MapPin, Navigation2, CheckCircle, Clock, Copy, CopyCheck,
  Map, Globe, Star, Lock, ChevronRight, ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCenter,
  useDraggable, useDroppable,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSidebar } from "../SidebarContext";

type Lead = {
  id: string; name: string; address: string; phone: string | null;
  score: number; status: string; notes: string | null; website: string | null;
  hasWebsite: boolean; hasWhatsapp: boolean; rating: number; reviewCount: number;
  suggestedMessage: string | null; temperature: string | null; scoreLabel: string | null;
  createdAt: string;
};

const STATUSES = ["PENDIENTE", "EN_CONTACTO", "CERRADO"] as const;
type Status = typeof STATUSES[number];

const STATUS_META: Record<Status, { label_key: string; color: string; icon: React.ReactNode; border: string }> = {
  PENDIENTE:   { label_key: "statusPending",   color: "bg-amber-500/10 text-amber-400",   icon: <Clock className="text-amber-500 w-4 h-4" />,       border: "border-amber-500/25" },
  EN_CONTACTO: { label_key: "statusContacted", color: "bg-indigo-500/10 text-indigo-400", icon: <Navigation2 className="text-indigo-400 w-4 h-4" />, border: "border-indigo-500/25" },
  CERRADO:     { label_key: "statusAccepted",  color: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle className="text-emerald-500 w-4 h-4" />, border: "border-emerald-500/25" },
};

// ── Droppable column ──────────────────────────────────────────────────────────
function DroppableColumn({ status, children }: { status: Status; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] space-y-3 rounded-xl transition-colors duration-200 ${isOver ? "bg-white/[0.025] ring-1 ring-white/10" : ""}`}
    >
      {children}
    </div>
  );
}

// ── Draggable card wrapper ────────────────────────────────────────────────────
function DraggableCard({ lead, children, isBeingDragged }: { lead: Lead; children: React.ReactNode; isBeingDragged: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isBeingDragged ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      {children}
    </motion.div>
  );
}

// ── Lead card UI ──────────────────────────────────────────────────────────────
function LeadCard({
  lead, t, copiedId, onCopy, onMove,
}: {
  lead: Lead;
  t: ReturnType<typeof useTranslations>;
  copiedId: string | null;
  onCopy: (l: Lead) => void;
  onMove: (id: string, dir: "forward" | "back") => void;
}) {
  const cleanPhone = lead.phone?.replace(/[^0-9+]/g, "") ?? "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + lead.address)}`;
  const statusIdx = STATUSES.indexOf(lead.status as Status);
  const meta = STATUS_META[lead.status as Status];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Drag handle dots */}
          <div className="mt-1.5 flex flex-col gap-[3px] shrink-0 opacity-25 pointer-events-none">
            {[0,1,2].map(i => <div key={i} className="w-[10px] h-[2px] bg-zinc-400 rounded" />)}
          </div>
          <h3 className="font-bold text-white text-sm leading-snug">{lead.name}</h3>
        </div>
        {lead.scoreLabel && (
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            lead.temperature === "🟢" ? "bg-emerald-500/15 text-emerald-400" :
            lead.temperature === "🟡" ? "bg-amber-500/15 text-amber-400" :
            lead.temperature === "🟠" ? "bg-orange-500/15 text-orange-400" :
            "bg-red-500/15 text-red-400"
          }`}>{lead.scoreLabel}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0 text-zinc-600" /><span className="line-clamp-1">{lead.address}</span></span>
        {lead.phone && <span className="flex items-center gap-1.5 text-indigo-400"><Navigation2 className="w-3 h-3 shrink-0" />{lead.phone}</span>}
        {lead.rating > 0 && <span className="flex items-center gap-1.5"><Star className="w-3 h-3 shrink-0 text-emerald-400" />{lead.rating} <span className="text-zinc-600">({lead.reviewCount} {t("reviews")})</span></span>}
        <span className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 shrink-0 text-zinc-600" />
          {lead.hasWebsite ? <span className="text-zinc-500 truncate">{lead.website || t("hasWeb")}</span> : <span className="text-emerald-400 font-semibold">{t("noWeb")}</span>}
        </span>
      </div>

      {/* Contact */}
      {lead.phone && (
        <div className="flex gap-2">
          {lead.hasWhatsapp && (lead.suggestedMessage || lead.notes) && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                const msg = lead.suggestedMessage ?? lead.notes ?? "";
                onCopy(lead);
                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-all"
            >
              {copiedId === lead.id ? <CopyCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} WhatsApp
            </button>
          )}
          <a
            href={`tel:${cleanPhone}`}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            {t("call")}
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-neutral-800/50 pt-3">
        <a
          href={mapsUrl} target="_blank" rel="noopener noreferrer"
          onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-zinc-400 hover:text-white transition-all"
        >
          <Map className="w-3.5 h-3.5" />
        </a>
        <div className="flex-1" />
        <button
          onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMove(lead.id, "back"); }}
          disabled={statusIdx === 0}
          className="p-1.5 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-neutral-800/60 hover:bg-neutral-700 text-zinc-400 hover:text-white"
        ><ChevronLeft className="w-3.5 h-3.5" /></button>

        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${meta?.color ?? ""}`}>
          {meta ? t(meta.label_key as any) : lead.status}
        </span>

        <button
          onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMove(lead.id, "forward"); }}
          disabled={statusIdx === STATUSES.length - 1}
          className="p-1.5 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-200"
        ><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CRM() {
  const t = useTranslations("crm");
  const { plan } = useSidebar();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<Status>("PENDIENTE");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  useEffect(() => {
    if (plan === "free") { setLoading(false); return; }
    fetch("/api/leads").then(r => r.json()).then(d => { if (Array.isArray(d)) setLeads(d); setLoading(false); });
  }, [plan]);

  if (plan === "free") {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d0d14]">
        <div className="text-center max-w-sm">
          <Lock className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t("title")}</h2>
          <p className="text-sm text-zinc-500 mb-6">{t("locked")}</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors">{t("viewPlans")}</Link>
        </div>
      </div>
    );
  }

  const patchStatus = (id: string, status: string) =>
    fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, status }) });

  const moveStatus = (id: string, dir: "forward" | "back") => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const idx = STATUSES.indexOf(l.status as Status);
      const next = dir === "forward" ? idx + 1 : idx - 1;
      if (next < 0 || next >= STATUSES.length) return l;
      patchStatus(id, STATUSES[next]);
      return { ...l, status: STATUSES[next] };
    }));
  };

  const copyMessage = (lead: Lead) => {
    navigator.clipboard.writeText(lead.suggestedMessage ?? lead.notes ?? lead.name);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const targetStatus = e.over?.id as Status | undefined;
    if (!targetStatus || !STATUSES.includes(targetStatus)) return;
    const lead = leads.find(l => l.id === e.active.id);
    if (!lead || lead.status === targetStatus) return;
    setLeads(prev => prev.map(l => l.id === e.active.id ? { ...l, status: targetStatus } : l));
    patchStatus(e.active.id as string, targetStatus);
  };

  const activeLead = leads.find(l => l.id === activeId);

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]">
      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">{t("title")}</h1>
          <p className="text-zinc-400 text-sm font-medium">{t("subtitle")}</p>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-center py-20">{t("loading")}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* Mobile tabs */}
            <div className="md:hidden mb-5">
              <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 mb-4">
                {STATUSES.map(s => {
                  const meta = STATUS_META[s];
                  const count = leads.filter(l => l.status === s).length;
                  return (
                    <button key={s} onClick={() => setMobileTab(s)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${mobileTab === s ? "bg-neutral-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      {meta.icon}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === s ? "bg-white/10 text-white" : "bg-neutral-800 text-zinc-600"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {leads.filter(l => l.status === mobileTab).map(lead => (
                    <LeadCard key={lead.id} lead={lead} t={t} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} />
                  ))}
                </AnimatePresence>
                {leads.filter(l => l.status === mobileTab).length === 0 && (
                  <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">{t(`empty${mobileTab === "PENDIENTE" ? "Pending" : mobileTab === "EN_CONTACTO" ? "Contacted" : "Accepted"}`)}</p>
                )}
              </div>
            </div>

            {/* Desktop kanban */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {STATUSES.map(status => {
                const meta = STATUS_META[status];
                const colLeads = leads.filter(l => l.status === status);
                const colKey = status === "PENDIENTE" ? "columnPending" : status === "EN_CONTACTO" ? "columnContacted" : "columnAccepted";
                const emptyKey = status === "PENDIENTE" ? "emptyPending" : status === "EN_CONTACTO" ? "emptyContacted" : "emptyAccepted";
                return (
                  <section key={status}>
                    <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${meta.border}`}>
                      {meta.icon}
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">{t(colKey)}</h2>
                      <span className="ml-auto text-xs font-bold text-zinc-600 bg-neutral-800 px-2 py-0.5 rounded-full">{colLeads.length}</span>
                    </div>
                    <DroppableColumn status={status}>
                      <AnimatePresence mode="popLayout">
                        {colLeads.map(lead => (
                          <DraggableCard key={lead.id} lead={lead} isBeingDragged={activeId === lead.id}>
                            <LeadCard lead={lead} t={t} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} />
                          </DraggableCard>
                        ))}
                      </AnimatePresence>
                      {colLeads.length === 0 && (
                        <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">{t(emptyKey)}</p>
                      )}
                    </DroppableColumn>
                  </section>
                );
              })}
            </div>

            {/* Ghost while dragging */}
            <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
              {activeLead && (
                <div className="rotate-1 scale-[1.02] opacity-90 shadow-2xl">
                  <LeadCard lead={activeLead} t={t} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
}
