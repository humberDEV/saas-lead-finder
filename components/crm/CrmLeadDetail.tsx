"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "@/app/[locale]/(app)/SidebarContext";
import {
  ArrowUpRight, Check, Copy, ExternalLink, Globe2, MapPin, MessageCircle,
  Phone, Star, Trash2, X,
} from "lucide-react";
import type { AppToastPayload } from "@/components/ui/AppToast";
import { ACTIVE_STATUSES, normalizeStatus, STATUS_LABEL_KEYS, type Lead, type Status } from "./crm-constants";

interface Props {
  lead: Lead;
  onClose: () => void;
  onSetStatus: (id: string, status: Status) => void;
  onSaveNote: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  onDemoToast: (payload: AppToastPayload) => void;
  existingDemoSlug?: string | null;
  onDemoSlugKnown: (slug: string) => void;
}

export function CrmLeadDetail({
  lead, onClose, onSetStatus, onSaveNote, onDelete, onDemoToast,
  existingDemoSlug = null, onDemoSlugKnown,
}: Props) {
  const t = useTranslations("crm");
  const tQuota = useTranslations("demosQuota");
  const locale = useLocale();
  const { demoQuota, refreshDemoQuota } = useSidebar();
  const [note, setNote] = useState(lead.notes ?? "");
  const [copied, setCopied] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "loading" | "done" | "copied">(existingDemoSlug ? "done" : "idle");
  const [demoSlug, setDemoSlug] = useState<string | null>(existingDemoSlug);
  const status = normalizeStatus(lead.status);
  const cleanPhone = lead.phone?.replace(/[^0-9+]/g, "") ?? "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.address}`)}`;
  const message = lead.suggestedMessage?.trim() || t("defaultWaMessage", { name: lead.name });

  useEffect(() => {
    if (existingDemoSlug) {
      setDemoSlug(existingDemoSlug);
      setDemoState("done");
    }
  }, [existingDemoSlug]);

  useEffect(() => {
    if (!confirmDelete) return;
    const timeout = window.setTimeout(() => setConfirmDelete(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [confirmDelete]);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const saveNote = () => {
    onSaveNote(lead.id, note.trim());
    setNoteSaved(true);
    window.setTimeout(() => setNoteSaved(false), 1400);
  };

  const resetDate = (date: string) => new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    day: "numeric", month: "short", timeZone: "UTC",
  });

  const createDemo = async () => {
    if (demoState === "loading") return;
    if (demoSlug) {
      await navigator.clipboard.writeText(`${window.location.origin}/demo/${demoSlug}`);
      setDemoState("copied");
      window.setTimeout(() => setDemoState("done"), 1800);
      return;
    }
    if (demoQuota && demoQuota.limit > 0 && !demoQuota.canCreate) {
      onDemoToast({
        variant: "warning",
        title: tQuota("limitReachedTitle"),
        subtitle: tQuota("limitReachedSub", { limit: demoQuota.limit, date: resetDate(demoQuota.periodEnd) }),
      });
      return;
    }
    setDemoState("loading");
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name, address: lead.address, phone: lead.phone,
          rating: lead.rating, reviewCount: lead.reviewCount,
          hasWhatsapp: lead.hasWhatsapp, website: lead.website, niche: lead.scoreLabel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "demo_limit_reached") {
          onDemoToast({
            variant: "warning",
            title: tQuota("limitReachedTitle"),
            subtitle: tQuota("limitReachedSub", {
              limit: data.limit ?? demoQuota?.limit ?? 10,
              date: data.periodEnd ? resetDate(data.periodEnd) : "",
            }),
          });
        }
        throw new Error(data.error);
      }
      setDemoSlug(data.slug);
      setDemoState("done");
      onDemoSlugKnown(data.slug);
      refreshDemoQuota();
      if (data.existing) {
        await navigator.clipboard.writeText(`${window.location.origin}/demo/${data.slug}`);
        onDemoToast({ variant: "success", title: tQuota("existingTitle"), subtitle: tQuota("existingSub") });
      }
    } catch {
      setDemoState("idle");
    }
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-[#121619]" aria-label={t("leadDetails")}>
      <div className="flex items-start gap-4 border-b border-neutral-800 px-5 py-5">
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">{t("leadDetails")}</p>
          <h2 className="text-lg font-semibold leading-snug text-white">{lead.name}</h2>
          {lead.scoreLabel && <p className="mt-2 text-xs font-medium text-indigo-300">{lead.scoreLabel}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label={t("closeDetails")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-800 text-zinc-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <section className="border-b border-neutral-800 pb-5">
          <label htmlFor={`lead-status-${lead.id}`} className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t("stage")}</label>
          <select
            id={`lead-status-${lead.id}`}
            value={status}
            onChange={(event) => onSetStatus(lead.id, event.target.value as Status)}
            className="h-10 w-full rounded-md border border-neutral-700 bg-[#1e2225] px-3 text-sm font-medium text-zinc-100 focus:border-indigo-400 focus:outline-none"
          >
            {[...ACTIVE_STATUSES, "DESCARTADO" as Status].map((item) => (
              <option key={item} value={item}>{t(STATUS_LABEL_KEYS[item])}</option>
            ))}
          </select>
        </section>

        <section className="space-y-3 border-b border-neutral-800 py-5 text-sm">
          <div className="flex items-start gap-3 text-zinc-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" /><span>{lead.address}</span></div>
          {lead.phone && <div className="flex items-center gap-3 text-zinc-300"><Phone className="h-4 w-4 text-zinc-600" /><span>{lead.phone}</span></div>}
          {lead.rating > 0 && <div className="flex items-center gap-3 text-zinc-300"><Star className="h-4 w-4 text-zinc-600" /><span>{lead.rating.toFixed(1)} · {lead.reviewCount} {t("reviews")}</span></div>}
          <div className="flex items-center gap-3"><Globe2 className="h-4 w-4 text-zinc-600" /><span className={lead.hasWebsite ? "truncate text-zinc-400" : "font-medium text-indigo-300"}>{lead.hasWebsite ? lead.website || t("hasWeb") : t("noWeb")}</span></div>
        </section>

        <section className="border-b border-neutral-800 py-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t("contact")}</p>
          <div className="grid grid-cols-2 gap-2">
            {lead.phone && lead.hasWhatsapp && <a href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-indigo-500 px-3 text-xs font-semibold text-white hover:bg-indigo-400"><MessageCircle className="h-4 w-4" />{t("whatsapp")}</a>}
            {lead.phone && <a href={`tel:${cleanPhone}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 hover:border-neutral-500"><Phone className="h-4 w-4" />{t("call")}</a>}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 hover:border-neutral-500"><ArrowUpRight className="h-4 w-4" />{t("openMaps")}</a>
          </div>
        </section>

        <section className="border-b border-neutral-800 py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t("openingMessage")}</h3>
            <button type="button" onClick={copyMessage} className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white"><Copy className="h-3.5 w-3.5" />{copied ? t("messageCopied") : t("copyMessage")}</button>
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">{message}</p>
        </section>

        <section className="border-b border-neutral-800 py-5">
          <label htmlFor={`lead-note-${lead.id}`} className="mb-3 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t("notes")}</label>
          <textarea id={`lead-note-${lead.id}`} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("notePlaceholder")} className="min-h-28 w-full resize-y rounded-md border border-neutral-700 bg-[#1e2225] p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-400 focus:outline-none" />
          <button type="button" onClick={saveNote} disabled={note.trim() === (lead.notes ?? "").trim()} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40">
            {noteSaved && <Check className="h-3.5 w-3.5" />}{noteSaved ? t("noteSaved") : t("saveNote")}
          </button>
        </section>

        <section className="border-b border-neutral-800 py-5">
          <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t("demo")}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={createDemo} disabled={demoState === "loading"} className="inline-flex min-h-9 items-center rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-300 hover:border-neutral-500 disabled:opacity-50">
              {demoState === "loading" ? t("demoGenerating") : demoState === "copied" ? t("linkCopied") : demoSlug ? t("copyDemoLink") : t("createDemo")}
            </button>
            {demoSlug && <a href={`/demo/${demoSlug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-indigo-300 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />{t("viewDemo")}</a>}
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 py-5">
          {status === "DESCARTADO" ? <button type="button" onClick={() => onSetStatus(lead.id, "PENDIENTE")} className="text-xs font-medium text-indigo-300 hover:text-white">{t("restoreLead")}</button> : <button type="button" onClick={() => onSetStatus(lead.id, "DESCARTADO")} className="text-xs font-medium text-zinc-400 hover:text-white">{t("discardLead")}</button>}
          <button type="button" onClick={() => { if (confirmDelete) onDelete(lead.id); else setConfirmDelete(true); }} className={`inline-flex items-center gap-1.5 text-xs font-medium ${confirmDelete ? "text-red-300" : "text-zinc-500 hover:text-red-300"}`}><Trash2 className="h-3.5 w-3.5" />{confirmDelete ? t("confirmDelete") : t("deleteLead")}</button>
        </div>
      </div>
    </aside>
  );
}
