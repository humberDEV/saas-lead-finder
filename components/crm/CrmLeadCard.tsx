"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  Globe,
  Map,
  Copy,
  CopyCheck,
  Trash2,
  Sparkles,
  ExternalLink,
  Lock,
  GripVertical,
  ChevronRight,
  StickyNote,
  Check,
  PhoneCall,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSidebar } from "@/app/[locale]/(app)/SidebarContext";
import { AnimatePresence, motion } from "framer-motion";
import type { AppToastPayload } from "@/components/ui/AppToast";
import {
  type Lead,
  type Status,
  normalizeStatus,
  getNextActiveStatus,
  scoreBadgeClass,
  STATUS_LABEL_KEYS,
  STATUS_VISUAL,
} from "./crm-constants";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current shrink-0 ${className ?? ""}`} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface CrmLeadCardProps {
  lead: Lead;
  copiedId: string | null;
  plan: string;
  dragHandleProps?: Record<string, unknown>;
  onCopy: (lead: Lead) => void;
  onSetStatus: (id: string, status: Status) => void;
  onSaveNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  onDemoToast?: (payload: AppToastPayload) => void;
  /** Demo ya creada para este negocio (precargada desde /api/demos). */
  existingDemoSlug?: string | null;
  onDemoSlugKnown?: (slug: string) => void;
}

export function CrmLeadCard({
  lead,
  copiedId,
  plan,
  dragHandleProps,
  onCopy,
  onSetStatus,
  onSaveNote,
  onDelete,
  onDemoToast,
  existingDemoSlug = null,
  onDemoSlugKnown,
}: CrmLeadCardProps) {
  const t = useTranslations("crm");
  const tDemoQuota = useTranslations("demosQuota");
  const locale = useLocale();
  const { refreshDemoQuota, demoQuota } = useSidebar();
  const status = normalizeStatus(lead.status);
  const visual = STATUS_VISUAL[status];
  const isDiscarded = status === "DESCARTADO";
  const nextStatus = getNextActiveStatus(status);
  const cleanPhone = lead.phone?.replace(/[^0-9+]/g, "") ?? "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.address}`)}`;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteOpen, setNoteOpen] = useState(Boolean(lead.notes));
  const [noteValue, setNoteValue] = useState(lead.notes ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "loading" | "done" | "copied">(
    existingDemoSlug ? "done" : "idle"
  );
  const [demoSlug, setDemoSlug] = useState<string | null>(existingDemoSlug);
  const canDemo = plan !== "free";

  useEffect(() => {
    if (existingDemoSlug) {
      setDemoSlug(existingDemoSlug);
      setDemoState("done");
    }
  }, [existingDemoSlug]);

  const defaultWaMessage = t("defaultWaMessage", { name: lead.name });
  const outreachText = lead.suggestedMessage?.trim() || lead.notes?.trim() || defaultWaMessage;

  const formatQuotaReset = (periodEndIso: string) =>
    new Date(periodEndIso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  const handleCreateDemo = async () => {
    if (!canDemo || demoState === "loading") return;

    if (demoSlug && demoState === "done") {
      await navigator.clipboard.writeText(`${window.location.origin}/demo/${demoSlug}`);
      setDemoState("copied");
      setTimeout(() => setDemoState("done"), 2000);
      return;
    }

    if (
      demoQuota &&
      demoQuota.limit > 0 &&
      !demoQuota.canCreate &&
      demoState !== "done" &&
      !demoSlug
    ) {
      onDemoToast?.({
        variant: "warning",
        title: tDemoQuota("limitReachedTitle"),
        subtitle: tDemoQuota("limitReachedSub", {
          limit: demoQuota.limit,
          date: formatQuotaReset(demoQuota.periodEnd),
        }),
      });
      return;
    }
    setDemoState("loading");
    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          address: lead.address,
          phone: lead.phone,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          hasWhatsapp: lead.hasWhatsapp,
          website: lead.website,
          niche: lead.scoreLabel ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "demo_limit_reached") {
          onDemoToast?.({
            variant: "warning",
            title: tDemoQuota("limitReachedTitle"),
            subtitle: tDemoQuota("limitReachedSub", {
              limit: data.limit ?? demoQuota?.limit ?? 10,
              date: data.periodEnd ? formatQuotaReset(data.periodEnd) : "",
            }),
          });
        }
        throw new Error(data.error);
      }
      const url = `${window.location.origin}/demo/${data.slug}`;
      setDemoSlug(data.slug);
      if (data.existing) {
        await navigator.clipboard.writeText(url);
        setDemoState("copied");
        onDemoToast?.({
          variant: "success",
          title: tDemoQuota("existingTitle"),
          subtitle: tDemoQuota("existingSub"),
        });
        setTimeout(() => setDemoState("done"), 2000);
      } else {
        setDemoState("done");
      }
      onDemoSlugKnown?.(data.slug);
      refreshDemoQuota();
    } catch {
      setDemoState("idle");
    }
  };

  const saveNote = () => {
    onSaveNote(lead.id, noteValue.trim());
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1200);
  };

  const openWhatsApp = () => {
    if (!lead.phone) return;
    onCopy(lead);
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(outreachText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <article
      className={`group rounded-2xl border bg-[#0c0c12]/90 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-black/20 ${
        isDiscarded
          ? "border-zinc-800/80 opacity-60"
          : `border-white/[0.08] ring-1 ${visual.ring}`
      }`}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex gap-2">
          {dragHandleProps && !isDiscarded ? (
            <button
              type="button"
              className="mt-0.5 shrink-0 p-1 -ml-1 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/5 cursor-grab active:cursor-grabbing touch-none"
              aria-label={t("dragHandle")}
              {...dragHandleProps}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          ) : null}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{lead.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              {lead.scoreLabel ? (
                <span
                  className={`font-bold px-2 py-0.5 rounded-full border ${scoreBadgeClass(lead.temperature)}`}
                >
                  {lead.scoreLabel}
                </span>
              ) : null}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${visual.bg} ${visual.color} border ${visual.border}`}
              >
                <visual.Icon className="w-3 h-3" />
                {t(STATUS_LABEL_KEYS[status])}
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <ul className="space-y-1.5 text-xs text-zinc-400">
          <li className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{lead.address}</span>
          </li>
          {lead.rating > 0 ? (
            <li className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 shrink-0 text-amber-400 fill-amber-400/30" />
              <span>
                <span className="text-white font-semibold tabular-nums">{lead.rating.toFixed(1)}</span>
                <span className="text-zinc-600">
                  {" "}
                  · {lead.reviewCount} {t("reviews")}
                </span>
              </span>
            </li>
          ) : null}
          <li className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
            {lead.hasWebsite ? (
              <span className="text-zinc-500 truncate">{lead.website || t("hasWeb")}</span>
            ) : (
              <span className="text-emerald-400 font-semibold">{t("noWeb")}</span>
            )}
          </li>
        </ul>

        {/* Contacto */}
        {lead.phone && !isDiscarded ? (
          <div className="grid grid-cols-2 gap-2">
            {lead.hasWhatsapp ? (
              <button
                type="button"
                onClick={openWhatsApp}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-900/25"
              >
                {copiedId === lead.id ? <CopyCheck className="w-4 h-4" /> : <WhatsAppIcon />}
                {t("whatsapp")}
              </button>
            ) : null}
            <a
              href={`tel:${cleanPhone}`}
              className={`flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold transition-colors ${
                lead.hasWhatsapp ? "" : "col-span-2"
              }`}
            >
              <PhoneCall className="w-4 h-4 shrink-0 text-indigo-400" />
              {t("call")}
            </a>
          </div>
        ) : null}

        {!isDiscarded && lead.phone ? (
          <button
            type="button"
            onClick={() => onCopy(lead)}
            className="w-full flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-zinc-300 transition-colors"
          >
            {copiedId === lead.id ? (
              <CopyCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
            )}
            {copiedId === lead.id ? t("messageCopied") : t("copyMessage")}
          </button>
        ) : null}

        {/* Notas */}
        {!isDiscarded ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <button
              type="button"
              onClick={() => setNoteOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <StickyNote className="w-3.5 h-3.5" />
                {t("notes")}
              </span>
              <span className="text-[10px] text-zinc-600">{noteOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {noteOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 flex flex-col gap-2">
                    <textarea
                      className="w-full text-xs bg-black/30 border border-white/10 text-white rounded-lg px-3 py-2 resize-none min-h-[72px] focus:outline-none focus:border-indigo-500/40 placeholder:text-zinc-600"
                      placeholder={t("notePlaceholder")}
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={saveNote}
                      className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                    >
                      {noteSaved ? <Check className="w-3.5 h-3.5" /> : null}
                      {noteSaved ? t("noteSaved") : t("saveNote")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                lead.notes && (
                  <p className="px-3 pb-3 text-[11px] text-zinc-500 leading-relaxed line-clamp-2 italic">
                    {lead.notes}
                  </p>
                )
              )}
            </AnimatePresence>
          </div>
        ) : null}

        {/* Pipeline */}
        {!isDiscarded ? (
          <div className="flex flex-col gap-2">
            {nextStatus ? (
              <button
                type="button"
                onClick={() => onSetStatus(lead.id, nextStatus)}
                className="w-full flex items-center justify-center gap-2 min-h-[42px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                {t("moveTo", { status: t(STATUS_LABEL_KEYS[nextStatus]) })}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onSetStatus(lead.id, "DESCARTADO")}
              className="w-full text-center text-[11px] font-semibold text-zinc-600 hover:text-zinc-400 py-1 transition-colors"
            >
              {t("discardLead")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSetStatus(lead.id, "PENDIENTE")}
            className="w-full min-h-[40px] rounded-xl border border-dashed border-white/15 text-xs font-semibold text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
          >
            {t("restoreLead")}
          </button>
        )}

        {/* Utilidades */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
            title={t("openMaps")}
          >
            <Map className="w-3.5 h-3.5" />
            {t("openMaps")}
          </a>

          {!isDiscarded ? (
            (demoState === "done" || demoState === "copied") && demoSlug ? (
              <>
                <a
                  href={`/demo/${demoSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                  title={t("viewDemo")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCreateDemo}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                >
                  {demoState === "copied" ? t("linkCopied") : t("copyDemoLink")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCreateDemo}
                disabled={demoState === "loading" || !canDemo}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                  canDemo
                    ? "text-indigo-400 hover:bg-indigo-500/15"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
                title={canDemo ? t("createDemo") : t("demoLocked")}
              >
                {demoState === "loading" ? (
                  <span className="animate-pulse">…</span>
                ) : canDemo ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("demo")}
                  </>
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </button>
            )
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (confirmDelete) onDelete(lead.id);
              else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 2500);
              }
            }}
            className={`p-2 rounded-lg transition-colors ${
              confirmDelete
                ? "bg-red-500/20 text-red-400"
                : "text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
            }`}
            title={confirmDelete ? t("confirmDelete") : t("deleteLead")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
