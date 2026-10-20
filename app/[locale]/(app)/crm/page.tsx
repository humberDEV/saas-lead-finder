"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, ChevronRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useSidebar } from "../SidebarContext";
import { FeatureUnlockScreen } from "@/components/FeatureUnlockScreen";
import { AppToast } from "@/components/ui/AppToast";
import { CrmLeadDetail } from "@/components/crm/CrmLeadDetail";
import { useTimedToast } from "@/hooks/useTimedToast";
import { useUserDemosByKey } from "@/hooks/useUserDemosByKey";
import {
  ACTIVE_STATUSES, normalizeStatus, STATUS_LABEL_KEYS,
  type Lead, type Status,
} from "@/components/crm/crm-constants";

type Filter = "ALL" | Status;
type Sort = "newest" | "oldest" | "score" | "name";

const FILTERS: Filter[] = ["ALL", ...ACTIVE_STATUSES, "DESCARTADO"];

export default function CRM() {
  const t = useTranslations("crm");
  const tResults = useTranslations("dashboard.results");
  const locale = useLocale();
  const { plan } = useSidebar();
  const { toast: demoToast, show: showDemoToast, dismiss: dismissDemoToast } = useTimedToast();
  const { getSlug: getDemoSlug, rememberSlug: rememberDemoSlug } = useUserDemosByKey(plan !== "free");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<Sort>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (plan === "free") {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch("/api/leads", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("load_failed"); return response.json(); })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("invalid_data");
        setLeads(data.map((lead: Lead) => ({ ...lead, status: normalizeStatus(lead.status) })));
        setError(false);
      })
      .catch((reason) => { if (reason.name !== "AbortError") setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [plan]);

  useEffect(() => {
    if (!mobileDetailOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileDetailOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1280) setMobileDetailOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [mobileDetailOpen]);

  const counts = useMemo(() => {
    const next = { ALL: leads.length, PENDIENTE: 0, CONTACTADO: 0, INTERESADO: 0, CERRADO: 0, DESCARTADO: 0 };
    leads.forEach((lead) => { next[normalizeStatus(lead.status)] += 1; });
    return next;
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return leads
      .filter((lead) => filter === "ALL" ? normalizeStatus(lead.status) !== "DESCARTADO" : normalizeStatus(lead.status) === filter)
      .filter((lead) => !needle || [lead.name, lead.address, lead.phone, lead.notes].some((value) => value?.toLocaleLowerCase(locale).includes(needle)))
      .sort((a, b) => {
        if (sort === "score") return b.score - a.score || a.name.localeCompare(b.name, locale);
        if (sort === "name") return a.name.localeCompare(b.name, locale);
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "oldest" ? -diff : diff;
      });
  }, [leads, filter, query, sort, locale]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? null;

  const setStatus = (id: string, status: Status) => {
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead));
    fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, status }) }).catch(() => {});
  };

  const saveNote = (id: string, notes: string) => {
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, notes } : lead));
    fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, notes }) }).catch(() => {});
  };

  const deleteLead = (id: string) => {
    setLeads((current) => current.filter((lead) => lead.id !== id));
    setSelectedId(null);
    setMobileDetailOpen(false);
    fetch("/api/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id }) }).catch(() => {});
  };

  const openLead = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(window.matchMedia("(max-width: 1279px)").matches);
  };
  const detail = selectedLead && <CrmLeadDetail
    key={selectedLead.id}
    lead={selectedLead}
    onClose={() => { setSelectedId(null); setMobileDetailOpen(false); }}
    onSetStatus={setStatus}
    onSaveNote={saveNote}
    onDelete={deleteLead}
    onDemoToast={showDemoToast}
    existingDemoSlug={getDemoSlug(selectedLead.name, selectedLead.address)}
    onDemoSlugKnown={(slug) => rememberDemoSlug(selectedLead.name, selectedLead.address, slug)}
  />;

  if (plan === "free") return <FeatureUnlockScreen feature="crm" />;

  return (
    <div className="h-full overflow-y-auto bg-[#0b0d0f]">
      <AppToast toast={demoToast} onDismiss={dismissDemoToast} dismissLabel={tResults("toastDismiss")} />
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-7 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">Huntly / CRM</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("title")}</h1>
            <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
          </div>
          <Link href="/search" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-700 bg-[#1e2225] px-4 text-sm font-medium text-zinc-100 hover:border-neutral-500"><Plus className="h-4 w-4" />{t("searchLeads")}</Link>
        </header>

        {loading ? <p className="py-24 text-center text-sm text-zinc-500">{t("loading")}</p> : error ? (
          <div className="rounded-md border border-neutral-800 p-8 text-center text-sm text-zinc-400">{t("loadError")}</div>
        ) : leads.length === 0 ? (
          <section className="max-w-xl rounded-lg border border-neutral-800 bg-[#141719] p-8">
            <h2 className="text-lg font-semibold text-white">{t("emptyPortfolioTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t("emptyPortfolioDesc")}</p>
            <Link href="/search" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-indigo-500 px-4 text-sm font-medium text-white hover:bg-indigo-400"><Plus className="h-4 w-4" />{t("searchLeads")}</Link>
          </section>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-w-0" aria-label={t("portfolioList")}>
              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-800 text-sm">
                {FILTERS.map((item) => (
                  <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`-mb-px inline-flex min-h-10 items-center gap-2 border-b-2 pb-2 pt-1 transition-colors ${filter === item ? "border-indigo-400 font-medium text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"}`}>
                    {item === "ALL" ? t("allActive") : t(STATUS_LABEL_KEYS[item])}
                    <span className="font-mono text-[11px] text-zinc-600">{item === "ALL" ? counts.ALL - counts.DESCARTADO : counts[item]}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block min-w-0 flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <span className="sr-only">{t("searchPortfolio")}</span>
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPortfolio")} className="h-10 w-full rounded-md border border-neutral-800 bg-[#1b1f22] pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-400 focus:outline-none" />
                </label>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-zinc-500">{t("visibleCount", { count: visibleLeads.length })}</p>
                  <label className="relative ml-auto inline-flex items-center gap-2 text-xs text-zinc-500">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("sortLabel")}</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-9 rounded-md border border-neutral-800 bg-[#1b1f22] px-2 text-xs text-zinc-300 focus:border-indigo-400 focus:outline-none">
                      <option value="newest">{t("sortNewest")}</option>
                      <option value="oldest">{t("sortOldest")}</option>
                      <option value="score">{t("sortScore")}</option>
                      <option value="name">{t("sortName")}</option>
                    </select>
                  </label>
                </div>
              </div>

              {visibleLeads.length === 0 ? <div className="rounded-lg border border-neutral-800 bg-[#141719] px-5 py-14 text-center text-sm text-zinc-500">{t("noMatches")}</div> : <>
                <div className="hidden overflow-hidden rounded-lg border border-neutral-800 bg-[#141719] lg:block">
                  <table className="w-full table-fixed text-left">
                    <thead className="border-b border-neutral-800 bg-[#1b1f22] text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      <tr><th className="w-[38%] px-4 py-3 font-medium">{t("businessColumn")}</th><th className="w-[20%] px-3 py-3 font-medium">{t("stage")}</th><th className="w-[22%] px-3 py-3 font-medium">{t("signalColumn")}</th><th className="w-[20%] px-3 py-3 font-medium">{t("contactColumn")}</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {visibleLeads.map((lead) => (
                        <tr key={lead.id} className={selectedId === lead.id ? "bg-indigo-500/[0.08]" : "hover:bg-white/[0.025]"}>
                          <td className="px-4 py-3"><button type="button" onClick={() => openLead(lead.id)} className="block w-full text-left"><span className="block truncate text-sm font-medium text-zinc-100">{lead.name}</span><span className="mt-1 block truncate text-xs text-zinc-500">{lead.address}</span></button></td>
                          <td className="px-3 py-3"><span className="inline-flex rounded border border-neutral-700 px-2 py-1 text-xs text-zinc-300">{t(STATUS_LABEL_KEYS[normalizeStatus(lead.status)])}</span></td>
                          <td className="px-3 py-3"><span className="block truncate text-xs font-medium text-zinc-300">{lead.scoreLabel || "—"}</span><span className="mt-1 block truncate text-[11px] text-zinc-500">{lead.hasWebsite ? t("hasWeb") : t("noWeb")}{lead.rating > 0 ? ` · ${lead.rating.toFixed(1)} (${lead.reviewCount})` : ""}</span></td>
                          <td className="px-3 py-3"><button type="button" onClick={() => openLead(lead.id)} className="flex w-full items-center justify-between gap-1 text-left text-xs text-zinc-400 hover:text-white"><span className="truncate">{lead.phone || "—"}</span><ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 lg:hidden">
                  {visibleLeads.map((lead) => <button key={lead.id} type="button" onClick={() => openLead(lead.id)} className="block w-full rounded-md border border-neutral-800 bg-[#141719] px-4 py-3 text-left">
                    <span className="flex items-start justify-between gap-2"><span className="min-w-0 text-sm font-medium text-zinc-100">{lead.name}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600" /></span>
                    <span className="mt-1 block truncate text-xs text-zinc-500">{lead.address}</span>
                    <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"><span className="text-indigo-300">{t(STATUS_LABEL_KEYS[normalizeStatus(lead.status)])}</span><span className="text-zinc-500">{lead.scoreLabel || (lead.hasWebsite ? t("hasWeb") : t("noWeb"))}</span><span className="text-zinc-500">{lead.phone}</span></span>
                  </button>)}
                </div>
              </>}
            </section>

            <div className="hidden h-[min(780px,calc(100vh-120px))] overflow-hidden rounded-lg border border-neutral-800 xl:sticky xl:top-5 xl:block">
              {selectedLead && !mobileDetailOpen ? detail : <div className="flex h-full flex-col items-center justify-center px-8 text-center"><p className="text-sm font-medium text-zinc-300">{t("selectLead")}</p><p className="mt-2 text-xs leading-relaxed text-zinc-500">{t("selectLeadHint")}</p></div>}
            </div>
          </div>
        )}
      </main>

      {selectedLead && mobileDetailOpen && <div className="fixed inset-0 z-50 xl:hidden">
        <button type="button" aria-label={t("closeDetails")} onClick={() => setMobileDetailOpen(false)} className="absolute inset-0 bg-black/70" />
        <div role="dialog" aria-modal="true" aria-label={t("leadDetails")} className="absolute inset-y-0 right-0 w-full max-w-[430px] border-l border-neutral-800 shadow-2xl">{detail}</div>
      </div>}
    </div>
  );
}
