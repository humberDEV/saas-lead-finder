"use client";

import { useEffect, useState } from "react";
import {
  MapPin, Navigation2, CheckCircle, Clock, Copy, CopyCheck,
  Map, Globe, Star, Lock, ChevronRight, ChevronLeft,
  Phone, ThumbsUp, XCircle, StickyNote, Check, Trash2,
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

const STATUSES = ["PENDIENTE", "CONTACTADO", "INTERESADO", "CERRADO", "DESCARTADO"] as const;
type Status = typeof STATUSES[number];

// Legacy status from old data
const LEGACY_STATUS_MAP: Record<string, Status> = {
  EN_CONTACTO: "CONTACTADO",
};

function normalizeStatus(status: string): Status {
  if (LEGACY_STATUS_MAP[status]) return LEGACY_STATUS_MAP[status];
  if ((STATUSES as readonly string[]).includes(status)) return status as Status;
  return "PENDIENTE";
}

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ReactNode; border: string; bg: string }> = {
  PENDIENTE:   { label: "Pendiente",   color: "text-amber-400",   icon: <Clock className="text-amber-400 w-4 h-4" />,     border: "border-amber-500/25",   bg: "bg-amber-500/10" },
  CONTACTADO:  { label: "Contactado",  color: "text-indigo-400",  icon: <Phone className="text-indigo-400 w-4 h-4" />,    border: "border-indigo-500/25",  bg: "bg-indigo-500/10" },
  INTERESADO:  { label: "Interesado",  color: "text-blue-400",    icon: <ThumbsUp className="text-blue-400 w-4 h-4" />,   border: "border-blue-500/25",    bg: "bg-blue-500/10" },
  CERRADO:     { label: "Cerrado",     color: "text-emerald-400", icon: <CheckCircle className="text-emerald-400 w-4 h-4" />, border: "border-emerald-500/25", bg: "bg-emerald-500/10" },
  DESCARTADO:  { label: "Descartado",  color: "text-zinc-500",    icon: <XCircle className="text-zinc-500 w-4 h-4" />,    border: "border-zinc-700",       bg: "bg-zinc-800/40" },
};

const ACTIVE_STATUSES: Status[] = ["PENDIENTE", "CONTACTADO", "INTERESADO", "CERRADO"];

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

// ── Quick note ────────────────────────────────────────────────────────────────
function QuickNote({ leadId, initial, onSave }: { leadId: string; initial: string | null; onSave: (id: string, note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    onSave(leadId, value);
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); }, 1000);
  };

  return (
    <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-1.5 rounded-lg transition-all ${open ? "bg-amber-500/20 text-amber-400" : "bg-neutral-800/60 hover:bg-neutral-700 text-zinc-400 hover:text-white"}`}
        title="Añadir nota"
      >
        <StickyNote className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2 flex gap-2"
          >
            <textarea
              autoFocus
              className="flex-1 text-xs bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 resize-none h-16 focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-600"
              placeholder="Escribe una nota..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              onClick={save}
              className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && initial && (
        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1 italic">{initial}</p>
      )}
    </div>
  );
}

// ── Lead card UI ──────────────────────────────────────────────────────────────
function LeadCard({
  lead, copiedId, onCopy, onMove, onSaveNote, onDelete,
}: {
  lead: Lead;
  copiedId: string | null;
  onCopy: (l: Lead) => void;
  onMove: (id: string, dir: "forward" | "back") => void;
  onSaveNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const normalStatus = normalizeStatus(lead.status);
  const cleanPhone = lead.phone?.replace(/[^0-9+]/g, "") ?? "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + lead.address)}`;
  const statusIdx = STATUSES.indexOf(normalStatus);
  const meta = STATUS_META[normalStatus];
  const isDiscarded = normalStatus === "DESCARTADO";

  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing ${isDiscarded ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
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
        {lead.rating > 0 && <span className="flex items-center gap-1.5"><Star className="w-3 h-3 shrink-0 text-emerald-400" />{lead.rating} <span className="text-zinc-600">({lead.reviewCount} reseñas)</span></span>}
        <span className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 shrink-0 text-zinc-600" />
          {lead.hasWebsite ? <span className="text-zinc-500 truncate">{lead.website || "Tiene web"}</span> : <span className="text-emerald-400 font-semibold">Sin web</span>}
        </span>
      </div>

      {/* Contact buttons */}
      {lead.phone && !isDiscarded && (
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
            Llamar
          </a>
        </div>
      )}

      {/* Quick note */}
      {!isDiscarded && (
        <div onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <QuickNote leadId={lead.id} initial={lead.notes} onSave={onSaveNote} />
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
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            if (confirmDelete) {
              onDelete(lead.id);
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 2500);
            }
          }}
          className={`p-1.5 rounded-lg transition-all ${
            confirmDelete
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-neutral-800/60 hover:bg-red-500/15 text-zinc-500 hover:text-red-400"
          }`}
          title={confirmDelete ? "Confirmar eliminación" : "Eliminar lead"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1" />
        <button
          onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMove(lead.id, "back"); }}
          disabled={statusIdx <= 0}
          className="p-1.5 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-neutral-800/60 hover:bg-neutral-700 text-zinc-400 hover:text-white"
        ><ChevronLeft className="w-3.5 h-3.5" /></button>

        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${meta?.bg ?? ""} ${meta?.color ?? ""}`}>
          {meta?.label ?? lead.status}
        </span>

        <button
          onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMove(lead.id, "forward"); }}
          disabled={statusIdx >= STATUSES.length - 1}
          className="p-1.5 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-200"
        ><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ── Locked free view ──────────────────────────────────────────────────────────
function LockedPlaceholder() {
  return (
    <div className="h-full overflow-y-auto bg-[#0b0917] text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h1 className="text-base font-black text-white">Cartera de clientes</h1>
          </div>
          <p className="text-xs text-zinc-500">Guarda leads y gestiona el estado de cada contacto.</p>
        </div>
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <p className="text-base font-black text-white mb-2">Desbloquea la cartera</p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Guarda leads, cambia su estado y haz seguimiento real con un plan de pago. Todo en un tablero visual.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-[0_2px_12px_rgba(99,102,241,0.3)]"
            >
              Ver planes
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[10px] text-zinc-600">Desde $9/mes · cancela cuando quieras</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CRM() {
  const { plan } = useSidebar();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<Status>("PENDIENTE");
  const [showDiscarded, setShowDiscarded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  useEffect(() => {
    if (plan === "free") { setLoading(false); return; }
    fetch("/api/leads")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setLeads(d.map(l => ({ ...l, status: normalizeStatus(l.status) })));
        }
        setLoading(false);
      });
  }, [plan]);

  if (plan === "free") return <LockedPlaceholder />;

  const patchStatus = (id: string, status: string) =>
    fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, status }) });

  const patchNote = (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l));
    fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, notes }) });
  };

  const moveStatus = (id: string, dir: "forward" | "back") => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const normalStatus = normalizeStatus(l.status);
      const idx = STATUSES.indexOf(normalStatus);
      const next = dir === "forward" ? idx + 1 : idx - 1;
      if (next < 0 || next >= STATUSES.length) return l;
      patchStatus(id, STATUSES[next]);
      return { ...l, status: STATUSES[next] };
    }));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    fetch("/api/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id }) });
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
    if (!targetStatus || !(STATUSES as readonly string[]).includes(targetStatus)) return;
    const lead = leads.find(l => l.id === e.active.id);
    if (!lead || normalizeStatus(lead.status) === targetStatus) return;
    setLeads(prev => prev.map(l => l.id === e.active.id ? { ...l, status: targetStatus } : l));
    patchStatus(e.active.id as string, targetStatus);
  };

  const activeLead = leads.find(l => l.id === activeId);
  const activeLeads = leads.filter(l => normalizeStatus(l.status) !== "DESCARTADO");
  const discardedLeads = leads.filter(l => normalizeStatus(l.status) === "DESCARTADO");

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]">
      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Mi Cartera</h1>
            <p className="text-zinc-400 text-sm font-medium">
              {leads.length} leads guardados · {activeLeads.filter(l => normalizeStatus(l.status) === "PENDIENTE").length} pendientes de contactar
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            + Buscar leads
          </Link>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-center py-20">Cargando...</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* Mobile tabs */}
            <div className="md:hidden mb-5">
              <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 mb-4 overflow-x-auto">
                {ACTIVE_STATUSES.map(s => {
                  const meta = STATUS_META[s];
                  const count = leads.filter(l => normalizeStatus(l.status) === s).length;
                  return (
                    <button key={s} onClick={() => setMobileTab(s)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${mobileTab === s ? "bg-neutral-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      {meta.icon}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${mobileTab === s ? "bg-white/10 text-white" : "bg-neutral-800 text-zinc-600"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {leads.filter(l => normalizeStatus(l.status) === mobileTab).map(lead => (
                    <LeadCard key={lead.id} lead={lead} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} onSaveNote={patchNote} onDelete={deleteLead} />
                  ))}
                </AnimatePresence>
                {leads.filter(l => normalizeStatus(l.status) === mobileTab).length === 0 && (
                  <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">Sin leads en esta columna</p>
                )}
              </div>
            </div>

            {/* Desktop kanban — 4 active columns */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
              {ACTIVE_STATUSES.map(status => {
                const meta = STATUS_META[status];
                const colLeads = leads.filter(l => normalizeStatus(l.status) === status);
                return (
                  <section key={status}>
                    <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${meta.border}`}>
                      {meta.icon}
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">{meta.label}</h2>
                      <span className="ml-auto text-xs font-bold text-zinc-600 bg-neutral-800 px-2 py-0.5 rounded-full">{colLeads.length}</span>
                    </div>
                    <DroppableColumn status={status}>
                      <AnimatePresence mode="popLayout">
                        {colLeads.map(lead => (
                          <DraggableCard key={lead.id} lead={lead} isBeingDragged={activeId === lead.id}>
                            <LeadCard lead={lead} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} onSaveNote={patchNote} onDelete={deleteLead} />
                          </DraggableCard>
                        ))}
                      </AnimatePresence>
                      {colLeads.length === 0 && (
                        <p className="text-xs text-zinc-600 border border-neutral-800 border-dashed rounded-xl p-8 text-center">Sin leads</p>
                      )}
                    </DroppableColumn>
                  </section>
                );
              })}
            </div>

            {/* Discarded section */}
            {discardedLeads.length > 0 && (
              <div className="mt-10">
                <button
                  onClick={() => setShowDiscarded(o => !o)}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {showDiscarded ? "Ocultar" : "Mostrar"} descartados ({discardedLeads.length})
                </button>
                <AnimatePresence>
                  {showDiscarded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid md:grid-cols-4 gap-4 overflow-hidden"
                    >
                      {discardedLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} onSaveNote={patchNote} onDelete={deleteLead} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Ghost while dragging */}
            <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
              {activeLead && (
                <div className="rotate-1 scale-[1.02] opacity-90 shadow-2xl">
                  <LeadCard lead={activeLead} copiedId={copiedId} onCopy={copyMessage} onMove={moveStatus} onSaveNote={patchNote} onDelete={deleteLead} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
}
