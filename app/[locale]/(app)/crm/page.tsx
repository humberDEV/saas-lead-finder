"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { XCircle, Plus } from "lucide-react";
import { useSidebar } from "../SidebarContext";
import { FeatureUnlockScreen } from "@/components/FeatureUnlockScreen";
import { AppToast } from "@/components/ui/AppToast";
import { CrmLeadCard } from "@/components/crm/CrmLeadCard";
import { useTimedToast } from "@/hooks/useTimedToast";
import { useUserDemosByKey } from "@/hooks/useUserDemosByKey";
import {
  type Lead,
  type Status,
  STATUSES,
  ACTIVE_STATUSES,
  normalizeStatus,
  STATUS_VISUAL,
  STATUS_COLUMN_KEYS,
  STATUS_EMPTY_KEYS,
} from "@/components/crm/crm-constants";

function DroppableColumn({ status, children }: { status: Status; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] space-y-3 rounded-xl p-2 -mx-2 transition-colors duration-200 ${
        isOver ? "bg-indigo-500/[0.06] ring-1 ring-indigo-500/25" : ""
      }`}
    >
      {children}
    </div>
  );
}

function DraggableLead({
  lead,
  isBeingDragged,
  children,
}: {
  lead: Lead;
  isBeingDragged: boolean;
  children: (dragHandleProps: Record<string, unknown>) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isBeingDragged ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={style}
      className={isBeingDragged ? "pointer-events-none" : ""}
    >
      {children({ ...attributes, ...listeners })}
    </motion.div>
  );
}

export default function CRM() {
  const t = useTranslations("crm");
  const tResults = useTranslations("dashboard.results");
  const { plan } = useSidebar();
  const { toast: demoToast, show: showDemoToast, dismiss: dismissDemoToast } = useTimedToast();
  const { getSlug: getDemoSlug, rememberSlug: rememberDemoSlug } = useUserDemosByKey(
    plan !== "free"
  );
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<Status>("PENDIENTE");
  const [showDiscarded, setShowDiscarded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 10 } })
  );

  useEffect(() => {
    if (plan === "free") {
      setLoading(false);
      return;
    }
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setLeads(d.map((l: Lead) => ({ ...l, status: normalizeStatus(l.status) })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [plan]);

  if (plan === "free") return <FeatureUnlockScreen feature="crm" />;

  const patchStatus = (id: string, status: string) =>
    fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id, status }),
    });

  const patchNote = (id: string, notes: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
    fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id, notes }),
    });
  };

  const setStatus = (id: string, status: Status) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    patchStatus(id, status);
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id }),
    });
  };

  const copyMessage = (lead: Lead) => {
    const text =
      lead.suggestedMessage?.trim() ||
      lead.notes?.trim() ||
      t("defaultWaMessage", { name: lead.name });
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const targetStatus = e.over?.id as Status | undefined;
    if (!targetStatus || !(STATUSES as readonly string[]).includes(targetStatus)) return;
    const lead = leads.find((l) => l.id === e.active.id);
    if (!lead || normalizeStatus(lead.status) === targetStatus) return;
    setStatus(e.active.id as string, targetStatus);
  };

  const activeLead = leads.find((l) => l.id === activeId);
  const discardedLeads = leads.filter((l) => normalizeStatus(l.status) === "DESCARTADO");
  const pendingCount = leads.filter((l) => normalizeStatus(l.status) === "PENDIENTE").length;
  const closedCount = leads.filter((l) => normalizeStatus(l.status) === "CERRADO").length;

  const cardProps = {
    copiedId,
    plan: plan ?? "free",
    onCopy: copyMessage,
    onSetStatus: setStatus,
    onSaveNote: patchNote,
    onDelete: deleteLead,
    onDemoToast: showDemoToast,
  };

  const renderColumn = (status: Status, colLeads: Lead[]) => {
    const visual = STATUS_VISUAL[status];
    const emptyKey = STATUS_EMPTY_KEYS[status];
    return (
      <DroppableColumn status={status}>
        <AnimatePresence mode="popLayout">
          {colLeads.map((lead) => (
            <DraggableLead key={lead.id} lead={lead} isBeingDragged={activeId === lead.id}>
              {(dragHandleProps) => (
                <CrmLeadCard
                  lead={lead}
                  dragHandleProps={dragHandleProps}
                  existingDemoSlug={getDemoSlug(lead.name, lead.address)}
                  onDemoSlugKnown={(slug) => rememberDemoSlug(lead.name, lead.address, slug)}
                  {...cardProps}
                />
              )}
            </DraggableLead>
          ))}
        </AnimatePresence>
        {colLeads.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-10 text-center">
            <p className="text-xs font-semibold text-zinc-500 mb-1">{t("emptyColumnShort")}</p>
            {emptyKey ? (
              <p className="text-[11px] text-zinc-600 leading-relaxed">{t(emptyKey)}</p>
            ) : null}
          </div>
        )}
      </DroppableColumn>
    );
  };

  return (
    <>
      <AppToast
        toast={demoToast}
        onDismiss={dismissDemoToast}
        dismissLabel={tResults("toastDismiss")}
      />
    <div className="h-full overflow-y-auto">
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 md:px-8 py-6 md:py-8 pb-28">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{t("title")}</h1>
            <p className="text-zinc-500 text-sm mt-1 max-w-lg">{t("subtitle")}</p>
            {!loading && leads.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  {t("statTotal", { count: leads.length })}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  {t("statPending", { count: pendingCount })}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  {t("statWon", { count: closedCount })}
                </span>
              </div>
            ) : null}
          </div>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black hover:bg-slate-200 text-sm font-bold rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t("searchLeads")}
          </Link>
        </header>

        {loading ? (
          <div className="text-zinc-500 text-center py-24">{t("loading")}</div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center max-w-lg mx-auto">
            <p className="text-lg font-bold text-white mb-2">{t("emptyPortfolioTitle")}</p>
            <p className="text-sm text-zinc-500 mb-6">{t("emptyPortfolioDesc")}</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl"
            >
              {t("searchLeads")}
            </Link>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Móvil */}
            <div className="md:hidden">
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {ACTIVE_STATUSES.map((s) => {
                  const visual = STATUS_VISUAL[s];
                  const count = leads.filter((l) => normalizeStatus(l.status) === s).length;
                  const isActive = mobileTab === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMobileTab(s)}
                      className={`shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        isActive
                          ? `${visual.bg} ${visual.color} ${visual.border}`
                          : "border-white/[0.06] text-zinc-500 bg-white/[0.02]"
                      }`}
                    >
                      <visual.Icon className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">{t(STATUS_COLUMN_KEYS[s])}</span>
                      <span
                        className={`tabular-nums px-1.5 py-0.5 rounded-md text-[10px] ${
                          isActive ? "bg-black/20" : "bg-neutral-800"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                {leads
                  .filter((l) => normalizeStatus(l.status) === mobileTab)
                  .map((lead) => (
                    <CrmLeadCard key={lead.id} lead={lead} {...cardProps} />
                  ))}
                {leads.filter((l) => normalizeStatus(l.status) === mobileTab).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-10 text-center">
                    <p className="text-xs font-semibold text-zinc-500">{t("emptyColumnShort")}</p>
                    {STATUS_EMPTY_KEYS[mobileTab] ? (
                      <p className="text-[11px] text-zinc-600 mt-1">{t(STATUS_EMPTY_KEYS[mobileTab]!)}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Desktop kanban */}
            <div className="hidden md:grid md:grid-cols-4 gap-4 items-start">
              {ACTIVE_STATUSES.map((status) => {
                const visual = STATUS_VISUAL[status];
                const colLeads = leads.filter((l) => normalizeStatus(l.status) === status);
                return (
                  <section
                    key={status}
                    className={`rounded-2xl border ${visual.border} bg-white/[0.02] flex flex-col min-h-[320px]`}
                  >
                    <div
                      className={`flex items-center gap-2 px-4 py-3 border-b ${visual.border} ${visual.bg} rounded-t-2xl`}
                    >
                      <visual.Icon className={`w-4 h-4 ${visual.color}`} />
                      <h2 className={`text-xs font-black uppercase tracking-wider ${visual.color}`}>
                        {t(STATUS_COLUMN_KEYS[status])}
                      </h2>
                      <span
                        className={`ml-auto text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-black/20 ${visual.color}`}
                      >
                        {colLeads.length}
                      </span>
                    </div>
                    <div className="p-3 flex-1">{renderColumn(status, colLeads)}</div>
                  </section>
                );
              })}
            </div>

            {discardedLeads.length > 0 ? (
              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => setShowDiscarded((o) => !o)}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {showDiscarded
                    ? t("hideDiscarded", { count: discardedLeads.length })
                    : t("showDiscarded", { count: discardedLeads.length })}
                </button>
                <AnimatePresence>
                  {showDiscarded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-hidden"
                    >
                      {discardedLeads.map((lead) => (
                        <CrmLeadCard key={lead.id} lead={lead} {...cardProps} />
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
              {activeLead ? (
                <div className="rotate-1 scale-[1.02] opacity-95 shadow-2xl max-w-sm">
                  <CrmLeadCard
                    lead={activeLead}
                    existingDemoSlug={getDemoSlug(activeLead.name, activeLead.address)}
                    onDemoSlugKnown={(slug) =>
                      rememberDemoSlug(activeLead.name, activeLead.address, slug)
                    }
                    {...cardProps}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
    </>
  );
}
