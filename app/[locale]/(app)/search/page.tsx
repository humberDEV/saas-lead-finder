"use client";

import { useState, useEffect, useRef, lazy, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Copy, MapPin, Star, CopyCheck, Sparkles, Phone,
  Search, Clock, PartyPopper, Map, MapPin as MapPinIcon, X,
  BookmarkPlus, Trash2,
} from "lucide-react";
import { usePickerWheel, RadarPickButton, PickerWheelOverlay } from "@/components/gacha";
import {
  SearchFeedbackToast,
  type SearchFeedback,
} from "@/components/search/SearchFeedbackToast";
import { SearchResultsGuidance } from "@/components/search/SearchResultsGuidance";
import { AppToast } from "@/components/ui/AppToast";
import { useTimedToast } from "@/hooks/useTimedToast";
import {
  analyzeSearchResults,
  suggestAlternateNiches,
  type SearchResultInsights,
} from "@/lib/search-result-insights";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import type { Place } from "@/types";
import { useSidebar } from "../SidebarContext";
import CITIES, { CITIES_EN } from "@/lib/cities";
import { countLeadOpportunities } from "@/lib/count-opportunities";
import { demoMapForPlaces } from "@/lib/demo-keys";
import { useUserDemosByKey } from "@/hooks/useUserDemosByKey";

const MapPickerModal = lazy(() => import("@/components/MapPickerModal"));

const searchFieldClass =
  "w-full bg-black/30 border border-neutral-800/80 text-slate-100 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/45 focus:shadow-[0_0_14px_rgba(99,102,241,0.12)] transition-all";

function CardIconAction({
  label,
  onClick,
  href,
  children,
  className = "",
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const base =
    "relative group/tip p-2.5 rounded-lg text-zinc-500 hover:text-white bg-neutral-800/40 hover:bg-neutral-800/70 border border-transparent hover:border-neutral-700/50 transition-all";
  const tip = (
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-neutral-900 border border-neutral-700 rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-20 shadow-lg">
      {label}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        aria-label={label}
        className={`${base} ${className}`}
      >
        {tip}
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${base} ${className}`}
    >
      {tip}
      {children}
    </button>
  );
}

function leadTempStyles(temperature: string) {
  switch (temperature) {
    case "🟢":
      return {
        chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-400",
        border: "border-emerald-500/40",
      };
    case "🟡":
      return {
        chip: "bg-amber-500/10 text-amber-400 border-amber-500/25",
        dot: "bg-amber-400",
        border: "border-amber-500/40",
      };
    case "🟠":
      return {
        chip: "bg-orange-500/10 text-orange-400 border-orange-500/25",
        dot: "bg-orange-400",
        border: "border-orange-500/40",
      };
    default:
      return {
        chip: "bg-red-500/10 text-red-400 border-red-500/25",
        dot: "bg-red-400",
        border: "border-red-500/30",
      };
  }
}

function useTimeAgo() {
  const t = useTranslations("dashboard.timeAgo");
  return (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return t("minutes", { count: mins });
    if (hours < 24) return t("hours", { count: hours });
    if (days < 7) return t("days", { count: days });
    return t("weeks", { count: Math.floor(days / 7) });
  };
}

interface PaywallStats {
  noWebsiteFound: number;
  contactableLeads: number;
  whatsappCount: number;
  searchesThisMonth: number;
  totalSearches: number;
}

import { useFlashOffer, startFlashOffer, FLASH_COUPON } from "@/hooks/useFlashOffer";

function PaywallModal({ onClose, source = "default" }: { onClose: () => void; source?: "default" | "message" }) {
  const tPw = useTranslations("paywall");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingFlash, setLoadingFlash] = useState(false);
  const [stats, setStats] = useState<PaywallStats | null>(null);
  const flash = useFlashOffer();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: PaywallStats) => setStats(d))
      .catch(() => {});
  }, []);

  async function handleCheckout(withFlash = false) {
    if (withFlash) setLoadingFlash(true);
    else setLoadingCheckout(true);
    try {
      const body: Record<string, string> = { planKey: "go" };
      if (withFlash) body.coupon = FLASH_COUPON;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { setLoadingCheckout(false); setLoadingFlash(false); }
    } catch {
      setLoadingCheckout(false);
      setLoadingFlash(false);
    }
  }

  const totalSearches = stats?.totalSearches ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        {source === "message" ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-[10px] font-black text-indigo-400/90 uppercase tracking-widest">
                {tPw("messageFeature")}
              </p>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              {tPw("messageTitle")}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {tPw("messageSubtitle")}
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] font-black text-amber-400/90 uppercase tracking-widest mb-2">
              {tPw("used")}
            </p>
            <h2 className="text-xl font-black text-white leading-tight">
              {tPw("title")}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {tPw("subtitle")}
            </p>
          </>
        )}
      </div>

      {/* Personalized stats */}
      {stats && totalSearches > 0 && (
        <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-4 mb-5">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">
            {tPw("statsLabel", { count: totalSearches })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { n: stats.noWebsiteFound,    label: tPw("noWebsite") },
              { n: stats.contactableLeads,  label: tPw("contactable") },
              { n: stats.whatsappCount,     label: tPw("whatsapp") },
              { n: stats.searchesThisMonth, label: tPw("thisMonth") },
            ].map(({ n, label }) => (
              <div key={label} className="text-center py-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800">
                <p className="text-xl font-black text-white leading-none">{n}</p>
                <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="mb-3">
        {flash.active && (
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-xs text-amber-400/75 italic">{tPw("used")}</p>
            <span className="text-xl font-black text-amber-400 tabular-nums leading-none">$4.50</span>
            <span className="text-zinc-600 text-xs line-through">$9</span>
            <span className="text-2xl font-black tabular-nums ml-auto leading-none" style={{ color: "rgba(245,158,11,0.85)" }}>
              {flash.mm}:{flash.ss}
            </span>
          </div>
        )}

        <button
          onClick={() => handleCheckout(flash.active)}
          disabled={loadingCheckout || loadingFlash}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-black text-sm rounded-xl transition-all disabled:opacity-60"
          style={flash.active ? {
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            boxShadow: "0 0 28px rgba(245,158,11,0.25)",
          } : {
            background: "#4f46e5",
            boxShadow: "0 0 24px rgba(99,102,241,0.3)",
          }}
        >
          {(loadingCheckout || loadingFlash) ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : flash.active ? (
            <>{tPw("ctaFlash")} <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>
          ) : (
            <>{tPw("ctaGo")} <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>
          )}
        </button>

        {flash.active && (
          <button
            onClick={() => handleCheckout(false)}
            disabled={loadingCheckout}
            className="w-full text-center text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mt-2"
          >
            {tPw("noDiscount")}
          </button>
        )}
      </div>

      {/* Secondary: all plans */}
      <div className="pt-3 border-t border-neutral-800/60 text-center">
        <Link
          href="/pricing"
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {tPw("viewAllPlans")}
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const tResults = useTranslations("dashboard.results");
  const tSearch = useTranslations("dashboard.search");
  const tUpgrade = useTranslations("dashboard.upgrade");
  const tHistory = useTranslations("dashboard.history");
  const tDemoQuota = useTranslations("demosQuota");
  const { toast: demoToast, show: showDemoToast, dismiss: dismissDemoToast } = useTimedToast();
  const timeAgo = useTimeAgo();
  const locale = useLocale();

  const VALIDATED_NICHES = t.raw("niches") as string[];
  const RANDOM_CITIES = locale === "en" ? CITIES_EN : CITIES;

  const {
    credits,
    plan,
    decrementCredits,
    refreshHistory,
    pendingHistoryId,
    setPendingHistoryId,
    newSearchVersion,
    refreshDemoQuota,
    demoQuota,
  } = useSidebar();

  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("upgraded") === "1";
  const prefilledNiche = searchParams.get("niche");
  const prefilledCity = searchParams.get("city");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(justUpgraded);
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);

  // Poll /api/credits every 2s until plan changes (max 15s) after upgrade
  const { credits: sidebarCredits, plan: sidebarPlan } = useSidebar();
  useEffect(() => {
    if (!justUpgraded) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (data.plan && data.plan !== "free") {
          setUpgradedPlan(data.plan);
          clearInterval(interval);
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "conversion", {
              send_to: "AW-18141614708/yajWCMu8sqgcEPSkzMpD",
              transaction_id: "",
            });
          }
        }
      } catch {}
      if (attempts >= 8) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [niche, setNiche] = useState(VALIDATED_NICHES[0]);
  const [customNiche, setCustomNiche] = useState("");
  const [city, setCity] = useState("");

  // Pre-fill from query params (e.g. from dashboard recommendations)
  useEffect(() => {
    if (prefilledNiche) {
      const match = VALIDATED_NICHES.find(
        (n) => n.toLowerCase() === prefilledNiche.toLowerCase()
      );
      if (match) {
        setNiche(match);
        setCustomNiche("");
      } else {
        setCustomNiche(prefilledNiche);
      }
    }
    if (prefilledCity) setCity(prefilledCity);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const autocompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hiddenIndexes, setHiddenIndexes] = useState<number[]>([]);
  const [expandedMessageIndexes, setExpandedMessageIndexes] = useState<number[]>([]);
  const [searchFeedback, setSearchFeedback] = useState<SearchFeedback | null>(null);
  const [resultInsights, setResultInsights] = useState<SearchResultInsights | null>(null);
  const [suggestedNiches, setSuggestedNiches] = useState<string[]>([]);
  const [lastSearchNiche, setLastSearchNiche] = useState("");
  const [showWithWebLeads, setShowWithWebLeads] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [historyContext, setHistoryContext] = useState<{ niche: string; city: string; createdAt: string } | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Map picker
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Paywall modal
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallSource, setPaywallSource] = useState<"default" | "message">("default");
  const [fakeLoading, setFakeLoading] = useState(false);

  // Demo state per card: index → slug | "loading" | "copied"
  const [demoMap, setDemoMap] = useState<Record<number, string | "loading" | "copied">>({});
  const { byKey: demosByKey, getSlug: getDemoSlug, rememberSlug: rememberDemoSlug, reload: reloadDemos } =
    useUserDemosByKey(plan !== "free");

  useEffect(() => {
    if (plan !== "free") reloadDemos().then(() => refreshDemoQuota());
  }, [plan, reloadDemos, refreshDemoQuota]);

  useEffect(() => {
    if (!results.length) return;
    setDemoMap((prev) => {
      const prefilled = demoMapForPlaces(results, demosByKey);
      const next = { ...prev };
      for (const [idx, slug] of Object.entries(prefilled)) {
        const i = Number(idx);
        const cur = next[i];
        if (!cur || cur === "loading") next[i] = slug;
      }
      return next;
    });
  }, [results, demosByKey]);

  const formatQuotaReset = (periodEndIso: string) =>
    new Date(periodEndIso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  const handleCreateDemo = async (index: number, place: Place) => {
    const current = demoMap[index];
    if (current === "loading") return;

    const knownSlug =
      typeof current === "string" && current !== "loading" && current !== "copied"
        ? current
        : getDemoSlug(place.name, place.address);

    if (knownSlug) {
      const url = `${window.location.origin}/demo/${knownSlug}`;
      await navigator.clipboard.writeText(url);
      setDemoMap((prev) => ({ ...prev, [index]: "copied" }));
      setTimeout(() => setDemoMap((prev) => ({ ...prev, [index]: knownSlug })), 2000);
      return;
    }

    setDemoMap(prev => ({ ...prev, [index]: "loading" }));
    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          address: place.address,
          phone: place.phone ?? null,
          rating: place.rating ?? 0,
          reviewCount: place.user_ratings_total ?? 0,
          hasWhatsapp: place.has_whatsapp,
          website: place.website ?? null,
          niche: customNiche || niche,
          city,
          placeId: place.place_id ?? null,
          googleMapsUri: place.google_maps_uri ?? null,
          photoNames: place.photo_names ?? [],
          openingHours: place.opening_hours ?? null,
          locale: locale === "en" ? "en" : "es",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "demo_limit_reached") {
          const reset = data.periodEnd ? formatQuotaReset(data.periodEnd) : "";
          showDemoToast({
            variant: "warning",
            title: tDemoQuota("limitReachedTitle"),
            subtitle: tDemoQuota("limitReachedSub", {
              limit: data.limit ?? demoQuota?.limit ?? 10,
              date: reset,
            }),
          });
        }
        throw new Error(data.error);
      }
      const url = `${window.location.origin}/demo/${data.slug}`;
      if (data.existing) {
        await navigator.clipboard.writeText(url);
        setDemoMap((prev) => ({ ...prev, [index]: "copied" }));
        showDemoToast({
          variant: "success",
          title: tDemoQuota("existingTitle"),
          subtitle: tDemoQuota("existingSub"),
        });
        setTimeout(() => {
          setDemoMap((prev) => ({ ...prev, [index]: data.slug }));
        }, 2000);
      } else {
        setDemoMap((prev) => ({ ...prev, [index]: data.slug }));
      }
      rememberDemoSlug(place.name, place.address, data.slug);
      refreshDemoQuota();
    } catch {
      setDemoMap((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const dismissSearchFeedback = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setSearchFeedback(null);
  };

  const showSearchFeedback = (feedback: SearchFeedback, durationMs: number) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setSearchFeedback(feedback);
    feedbackTimerRef.current = setTimeout(() => {
      setSearchFeedback(null);
      feedbackTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const triggerPaywall = (source: "default" | "message" = "default") => {
    setPaywallSource(source);
    startFlashOffer();
    if (source === "message") {
      // Immediate open — the user already sees the lead, no need for fake loading
      setShowPaywallModal(true);
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "paywall_viewed", properties: { source: "message_lock" } }),
      }).catch(() => {});
    } else {
      setFakeLoading(true);
      setTimeout(() => {
        setFakeLoading(false);
        setShowPaywallModal(true);
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "paywall_viewed", properties: { source: "dashboard_button" } }),
        }).catch(() => {});
      }, 1500);
    }
  };


  // Watch for new search signal from sidebar button
  const prevNewSearchVersion = useRef(0);
  useEffect(() => {
    if (newSearchVersion > prevNewSearchVersion.current) {
      prevNewSearchVersion.current = newSearchVersion;
      setResults([]);
      setExpandedMessageIndexes([]);
      setError(null);
      setHistoryContext(null);
      setCurrentHistoryId(null);
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [newSearchVersion]);

  // Watch for history selection from sidebar
  useEffect(() => {
    if (!pendingHistoryId) return;
    const id = pendingHistoryId;
    setPendingHistoryId(null);

    setLoading(true);
    setError(null);
    setResults([]);
    setHiddenIndexes([]);
    setExpandedMessageIndexes([]);

    fetch(`/api/history/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.results ?? [];
        setDemoMap(demoMapForPlaces(found, demosByKey));
        setResults(found);
        const insights = analyzeSearchResults(found);
        setResultInsights(insights);
        setSuggestedNiches(suggestAlternateNiches(data.niche, VALIDATED_NICHES));
        setLastSearchNiche(data.niche);
        setShowWithWebLeads(false);
        setCurrentHistoryId(id);
        setHistoryContext({ niche: data.niche, city: data.city, createdAt: data.createdAt });
        const opportunities = countLeadOpportunities(found);
        if (insights.prime > 0) {
          showSearchFeedback(
            { kind: "found", count: opportunities, total: found.length },
            3500
          );
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        } else if (found.length > 0) {
          showSearchFeedback(
            { kind: "weak", prime: insights.prime, total: found.length },
            7000
          );
        }
      })
      .catch(() => setError(tHistory("loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingHistoryId]);

  const handleSearch = async (
    e?: React.FormEvent,
    overrideNiche?: string,
    overrideCity?: string
  ) => {
    if (e) e.preventDefault();

    const finalNiche = overrideNiche ?? (customNiche || niche);
    const finalCity = overrideCity ?? city;
    if (!finalNiche || !finalCity) return;

    if (overrideNiche) {
      if (VALIDATED_NICHES.includes(overrideNiche)) {
        setNiche(overrideNiche);
        setCustomNiche("");
      } else {
        setCustomNiche(overrideNiche);
      }
    }
    if (overrideCity) setCity(overrideCity);

    setLoading(true);
    setError(null);
    setResults([]);
    setDemoMap({});
    setHiddenIndexes([]);
    setExpandedMessageIndexes([]);
    setHistoryContext(null);
    setHasSearched(true);
    dismissSearchFeedback();
    setResultInsights(null);
    setSuggestedNiches([]);
    setShowWithWebLeads(false);
    setLastSearchNiche(finalNiche);

    try {
      const res = await fetch(
        `/api/search?niche=${encodeURIComponent(finalNiche)}&city=${encodeURIComponent(finalCity)}&locale=${locale}`
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(tHistory("serverError", { status: res.status }));
      }

      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

      const found: Place[] = data.results || [];
      setDemoMap(demoMapForPlaces(found, demosByKey));
      setResults(found);
      const insights = analyzeSearchResults(found);
      setResultInsights(insights);
      setSuggestedNiches(suggestAlternateNiches(finalNiche, VALIDATED_NICHES));
      setCurrentHistoryId(data.historyId ?? null);

      if (!data.cached) {
        if (data.hasOpportunities) {
          decrementCredits();
        } else {
          showSearchFeedback({ kind: "empty" }, 5000);
        }
        refreshHistory();
      }

      const opportunities =
        typeof data.opportunityCount === "number"
          ? data.opportunityCount
          : countLeadOpportunities(found);
      if (insights.prime > 0) {
        showSearchFeedback(
          { kind: "found", count: opportunities, total: found.length },
          3500
        );
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      } else if (found.length > 0) {
        showSearchFeedback(
          { kind: "weak", prime: insights.prime, total: found.length },
          7000
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAndAction = (
    text: string,
    index: number,
    phone: string | null,
    action: "whatsapp" | "call" | "copy"
  ) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, "");
      if (action === "whatsapp") {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
      } else if (action === "call") {
        window.location.href = `tel:${cleanPhone}`;
      }
    }
  };

  const nichePicker = usePickerWheel({
    pool: VALIDATED_NICHES,
    exclude: customNiche || (niche !== "custom" ? niche : undefined),
    onComplete: (picked) => {
      setNiche(picked);
      setCustomNiche("");
    },
  });

  const cityPicker = usePickerWheel({
    pool: RANDOM_CITIES,
    exclude: city,
    onComplete: (picked) => {
      setCity(picked);
      setCitySuggestions([]);
      setShowSuggestions(false);
    },
  });

  const handleCityChange = (value: string) => {
    setCity(value);
    setShowSuggestions(true);
    if (autocompleteTimer.current) clearTimeout(autocompleteTimer.current);
    if (value.length < 2) { setCitySuggestions([]); return; }
    autocompleteTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?input=${encodeURIComponent(value)}`);
        const data = await res.json();
        setCitySuggestions(data.suggestions ?? []);
      } catch {}
    }, 300);
  };

  const selectSuggestion = (s: string) => {
    setCity(s);
    setCitySuggestions([]);
    setShowSuggestions(false);
    cityInputRef.current?.blur();
  };

  const removeFromHistory = (place: Place) => {
    if (!currentHistoryId) return;
    fetch(`/api/history/${currentHistoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: place.name, address: place.address }),
    }).catch(() => {});
  };

  const handleSaveLead = async (index: number, place: Place) => {
    setHiddenIndexes((prev) => [...prev, index]);
    removeFromHistory(place);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          address: place.address,
          phone: place.phone,
          score: place.score,
          status: "PENDIENTE",
          notes: null,
          website: place.website ?? null,
          hasWebsite: place.has_website,
          hasWhatsapp: place.has_whatsapp,
          rating: place.rating ?? 0,
          reviewCount: place.user_ratings_total ?? 0,
          suggestedMessage: place.suggestedMessage,
          temperature: place.temperature,
          scoreLabel: place.scoreLabel,
        }),
      });
    } catch {
      // silent
    }
  };

  const handleDismiss = (index: number, place: Place) => {
    setHiddenIndexes((prev) => [...prev, index]);
    removeFromHistory(place);
  };

  const toggleMessageExpand = (index: number) => {
    setExpandedMessageIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderOpeningMessage = (place: Place, index: number) => {
    const expanded = expandedMessageIndexes.includes(index);

    if (plan === "free") {
      return (
        <button
          type="button"
          onClick={() => triggerPaywall("message")}
          className="relative w-full mb-4 rounded-xl border border-neutral-800/80 bg-black/30 overflow-hidden text-left group/msg"
        >
          <p
            className="text-sm text-slate-400 px-3 pt-2.5 pb-7 leading-snug line-clamp-2 select-none pointer-events-none"
            style={{ filter: "blur(2.5px)", userSelect: "none" }}
          >
            {place.suggestedMessage}
          </p>
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-transparent pointer-events-none" />
          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover/msg:text-indigo-300 transition-colors">
            <Sparkles className="w-3 h-3" />
            {tResults("messageSeeMore")}
          </span>
        </button>
      );
    }

    return (
      <div className="mb-4">
        <div
          className={`relative rounded-xl border border-neutral-800/80 bg-black/25 overflow-hidden transition-all ${
            expanded
              ? "focus-within:border-indigo-500/50 focus-within:shadow-[0_0_12px_rgba(99,102,241,0.12)]"
              : ""
          }`}
        >
          <p
            className={`text-sm text-slate-300 px-3 py-2.5 leading-snug ${
              expanded ? "max-h-40 overflow-y-auto" : "line-clamp-2"
            }`}
          >
            {place.suggestedMessage}
          </p>
          {!expanded && (
            <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/90 to-transparent pointer-events-none" />
          )}
        </div>
        <button
          type="button"
          onClick={() => toggleMessageExpand(index)}
          className="mt-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? tResults("messageSeeLess") : tResults("messageSeeMore")}
        </button>
      </div>
    );
  };

  const renderPlaceCard = (place: Place, index: number, isTop: boolean, animDelay: number) => {
    if (hiddenIndexes.includes(index)) return null;

    const temp = leadTempStyles(place.temperature);
    const isFeatured = isTop && index === 0;
    const primaryInsight = place.scoreExplanation.split(" • ")[0];
    const showContact = (place.score >= 40 || !place.has_website) && place.phone;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: animDelay, ease: "easeOut" }}
        className={`flex flex-col relative overflow-hidden rounded-2xl border backdrop-blur-xl ${
          isFeatured
            ? "border-indigo-500/30 bg-neutral-900/50 shadow-[0_0_30px_rgba(99,102,241,0.12)] hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.18)]"
            : isTop
            ? "border-indigo-500/20 bg-neutral-900/40 shadow-[0_0_20px_rgba(99,102,241,0.06)] hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
            : "border-neutral-800/60 bg-neutral-900/15 hover:border-neutral-700/80"
        } p-6 transition-all group`}
      >
        {isFeatured && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        )}

        {/* Header: name gets full width; chip below */}
        <div className="mb-3">
          <div className="flex items-start gap-2">
            {isTop && index < 5 && (
              <span className="text-[10px] font-bold text-indigo-400/80 tabular-nums shrink-0 mt-0.5">
                #{index + 1}
              </span>
            )}
            <h2
              className="text-[15px] font-bold text-slate-100 leading-snug line-clamp-2 break-words flex-1 min-w-0"
              title={place.name}
            >
              {place.name}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 ml-0">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${temp.chip}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${temp.dot}`} />
              {place.scoreLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed" title={place.address}>
            {place.address}
          </p>
        </div>

        {/* Compact meta row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mb-3.5">
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
            <span className="text-slate-300 font-medium">{place.rating}</span>
            <span className="text-slate-600">
              ({place.user_ratings_total} {tResults("reviews")})
            </span>
          </span>
          {place.phone && (
            <>
              <span className="text-neutral-700 select-none">·</span>
              <span className="text-slate-300">{place.phone}</span>
            </>
          )}
          <span className="text-neutral-700 select-none">·</span>
          {place.has_website ? (
            <span className="text-slate-500 truncate max-w-[140px]">
              {place.website || tResults("hasWeb")}
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold">{tResults("noWeb")}</span>
          )}
        </div>

        {/* One-line AI insight (replaces heavy score box) */}
        {primaryInsight && (
          <p
            className={`text-xs leading-relaxed text-slate-500 line-clamp-2 pl-2.5 mb-4 border-l ${temp.border}`}
          >
            {primaryInsight}
          </p>
        )}

        {showContact && (
          <div className="mt-auto pt-5 border-t border-neutral-800/40">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400/80 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              {tResults("openingMessage")}
            </p>

            {renderOpeningMessage(place, index)}

            {/* Primary actions — flex-wrap leaves room for demo/slug button (other PR) */}
            <div className="flex flex-wrap items-stretch gap-2.5 mb-4">
              {place.has_whatsapp && (
                <button
                  onClick={() => {
                    if (plan === "free") {
                      const cleanPhone = place.phone!.replace(/[^0-9+]/g, "");
                      window.open(`https://wa.me/${cleanPhone}`, "_blank");
                    } else {
                      copyAndAction(place.suggestedMessage, index, place.phone, "whatsapp");
                    }
                  }}
                  className="inline-flex flex-1 min-w-[130px] items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  {copiedIndex === index ? <CopyCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {tResults("waDirect")}
                </button>
              )}
              <button
                onClick={() => copyAndAction(place.suggestedMessage, index, place.phone, "call")}
                className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 border border-indigo-500/35 text-xs font-bold rounded-xl transition-all shadow-[0_0_16px_rgba(99,102,241,0.12)] hover:shadow-[0_0_24px_rgba(99,102,241,0.2)] hover:border-indigo-400/50"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {tResults("callDirect")}
              </button>
            </div>

            <div className="flex items-center justify-end gap-1 pt-4 border-t border-neutral-800/30">
              {plan === "free" ? (
                <CardIconAction
                  label={tResults("savePro")}
                  onClick={() => triggerPaywall("message")}
                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                </CardIconAction>
              ) : (
                <CardIconAction
                  label={tResults("saveToPortfolio")}
                  onClick={() => handleSaveLead(index, place)}
                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-500/25"
                >
                  <BookmarkPlus className="w-4 h-4" />
                </CardIconAction>
              )}

              {/* Demo button */}
              {plan !== "free" ? (() => {
                const demoState = demoMap[index];
                const slug = typeof demoState === "string" && demoState !== "loading" && demoState !== "copied" ? demoState : null;
                return (
                  <div className="flex items-center gap-1">
                    <CardIconAction
                      label={
                        demoState === "copied"
                          ? tResults("demoCopied")
                          : slug
                            ? tResults("demoCopyLink")
                            : demoState === "loading"
                              ? tResults("demoGenerating")
                              : tResults("demoCreate")
                      }
                      onClick={() => handleCreateDemo(index, place)}
                      className={slug || demoState === "copied"
                        ? "text-violet-400 hover:text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/25 border-violet-500/20 bg-violet-500/10"
                        : "text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/20"
                      }
                    >
                      {demoState === "loading" ? (
                        <div className="w-4 h-4 border-2 border-zinc-600 border-t-violet-400 rounded-full animate-spin" />
                      ) : demoState === "copied" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </CardIconAction>
                    {slug && (
                      <a
                        href={`/demo/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={tResults("demoOpen")}
                        className="relative group/tip p-2.5 rounded-lg text-violet-400 hover:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
                      >
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-neutral-900 border border-neutral-700 rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-20 shadow-lg">
                          {tResults("demoOpen")}
                        </span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                      </a>
                    )}
                  </div>
                );
              })() : (
                <CardIconAction
                  label="Demo (plan Go)"
                  onClick={() => triggerPaywall("message")}
                  className="text-zinc-600 cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </CardIconAction>
              )}

              <CardIconAction
                label="Google Maps"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`}
              >
                <Map className="w-4 h-4" />
              </CardIconAction>
              <CardIconAction
                label={tResults("dismiss")}
                onClick={() => handleDismiss(index, place)}
                className="hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </CardIconAction>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const contactableResults = results.filter(
    (p) =>
      p.phone &&
      (!p.business_status || p.business_status === "OPERATIONAL")
  );
  const primeOpportunities = contactableResults.filter((p) => p.score >= 50);
  const exploreOpportunities = contactableResults.filter(
    (p) => p.score >= 40 && p.score < 50
  );
  const withWebLeads = contactableResults.filter(
    (p) => p.has_website || p.score <= 10
  );

  const scrollToSearchForm = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const trySuggestedNiche = (picked: string) => {
    handleSearch(undefined, picked, city);
  };

  const showFoundGlow = searchFeedback?.kind === "found";

  return (
    <div className="h-full flex flex-col">
      <AppToast
        toast={demoToast}
        onDismiss={dismissDemoToast}
        dismissLabel={tResults("toastDismiss")}
      />
      <SearchFeedbackToast
        feedback={searchFeedback}
        onDismiss={dismissSearchFeedback}
        foundTitle={tResults("opportunitiesFound", {
          count: searchFeedback?.kind === "found" ? searchFeedback.count : 0,
        })}
        foundSub={
          searchFeedback?.kind === "found" &&
          searchFeedback.total != null &&
          searchFeedback.total > searchFeedback.count
            ? tResults("reviewResultsWithTotal", {
                count: searchFeedback.count,
                total: searchFeedback.total,
              })
            : tResults("reviewResults")
        }
        emptyTitle={tResults("noLeadsTitle")}
        emptySub={tResults("noLeadsSub")}
        weakTitle={tResults("weakToastTitle")}
        weakSub={tResults("weakToastSub")}
        dismissLabel={tResults("toastDismiss")}
      />

      {/* Paywall modal */}
      <AnimatePresence>
        {showPaywallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPaywallModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0d0d14] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Top accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              <div className="p-6">
                {/* Close */}
                <div className="flex justify-end mb-1">
                  <button
                    onClick={() => setShowPaywallModal(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <PaywallModal onClose={() => setShowPaywallModal(false)} source={paywallSource} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map picker modal */}
      {showMapPicker && (
        <Suspense fallback={null}>
          <MapPickerModal
            onClose={() => setShowMapPicker(false)}
            onSelect={(city) => {
              setCity(city);
              setCitySuggestions([]);
              setShowSuggestions(false);
            }}
          />
        </Suspense>
      )}


      <div
        ref={mainRef}
        className="flex-1 overflow-y-auto"
      >
        <main className="max-w-6xl mx-auto w-full px-5 sm:px-8 md:px-10 py-6 md:py-9 pb-24">

          {/* Upgrade success banner */}
          <AnimatePresence>
            {showUpgradeBanner && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="mb-8 flex items-start justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    {upgradedPlan ? (
                      <>
                        <p className="text-sm font-bold text-white">
                          {tUpgrade("planActivated", { plan: upgradedPlan })}
                        </p>
                        <p className="text-xs text-indigo-300 mt-0.5">
                          {tUpgrade("fullAccess")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-white">{tUpgrade("paymentReceived")}</p>
                        <p className="text-xs text-indigo-300 mt-0.5">
                          {tUpgrade("activating")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  className="text-zinc-500 hover:text-white text-lg leading-none shrink-0"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search form — hidden when viewing history */}
          {!historyContext && (
            <motion.div
              animate={
                loading
                  ? { boxShadow: "0 0 32px rgba(99,102,241,0.14)" }
                  : showFoundGlow
                  ? { boxShadow: "0 0 32px rgba(16,185,129,0.12)" }
                  : { boxShadow: "0 0 24px rgba(99,102,241,0.06)" }
              }
              transition={{ duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl mb-10 z-10 ${
                loading
                  ? "border-indigo-500/35 bg-neutral-900/50"
                  : showFoundGlow
                  ? "border-emerald-500/30 bg-neutral-900/50"
                  : "border-neutral-800/70 bg-neutral-900/35"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tSearch("extractLeads")}</p>
                    {credits !== null && credits > 0 && (
                      <p className="text-xs text-slate-500">
                        {tSearch("remaining", { count: credits })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-500">
                        {tSearch("nicheLabel")}
                      </label>
                      <RadarPickButton
                        label={tSearch("randomNiche")}
                        phase={nichePicker.phase}
                        onClick={nichePicker.roll}
                        disabled={nichePicker.isActive}
                      />
                    </div>
                    <PickerWheelOverlay
                      phase={nichePicker.phase}
                      wheelLabels={nichePicker.wheelLabels}
                      wheelIndex={nichePicker.wheelIndex}
                      stepDurationMs={nichePicker.stepDurationMs}
                      itemHeight={nichePicker.itemHeight}
                      windowHeight={nichePicker.windowHeight}
                      visibleRows={nichePicker.visibleRows}
                      fieldClassName={`${searchFieldClass} appearance-none cursor-pointer`}
                    >
                      <select
                        className={`${searchFieldClass} appearance-none cursor-pointer`}
                        value={customNiche ? "custom" : niche}
                        onChange={(e) => {
                          if (e.target.value !== "custom") {
                            setNiche(e.target.value);
                            setCustomNiche("");
                          } else {
                            setNiche("custom");
                          }
                        }}
                      >
                        {VALIDATED_NICHES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value="custom">{tSearch("customNiche")}</option>
                      </select>
                    </PickerWheelOverlay>
                    {(customNiche !== "" || niche === "custom") && (
                      <input
                        type="text"
                        autoFocus
                        placeholder={tSearch("customNichePlaceholder")}
                        className={`${searchFieldClass} mt-2.5 border-indigo-500/30`}
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-500">
                        {tSearch("zoneLabel")}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <MapPinIcon className="w-3 h-3" />
                          {tSearch("mapPicker")}
                        </button>
                        <RadarPickButton
                          label={tSearch("randomZone")}
                          phase={cityPicker.phase}
                          onClick={cityPicker.roll}
                          disabled={cityPicker.isActive}
                        />
                      </div>
                    </div>
                    <PickerWheelOverlay
                      phase={cityPicker.phase}
                      wheelLabels={cityPicker.wheelLabels}
                      wheelIndex={cityPicker.wheelIndex}
                      stepDurationMs={cityPicker.stepDurationMs}
                      itemHeight={cityPicker.itemHeight}
                      windowHeight={cityPicker.windowHeight}
                      visibleRows={cityPicker.visibleRows}
                      fieldClassName={searchFieldClass}
                    >
                      <div className="relative">
                        <input
                          ref={cityInputRef}
                          type="text"
                          placeholder={tSearch("cityPlaceholder")}
                          className={searchFieldClass}
                          value={city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                          autoComplete="off"
                        />
                      {showSuggestions && citySuggestions.length > 0 && (
                        <ul className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-xl border border-neutral-800/80 bg-neutral-900/95 backdrop-blur-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                          {citySuggestions.map((s) => (
                            <li key={s}>
                              <button
                                type="button"
                                onMouseDown={() => selectSuggestion(s)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white flex items-center gap-2 transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                {s}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      </div>
                    </PickerWheelOverlay>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                      {tSearch("cityHint")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-800/50">
                  <button
                    type="button"
                    onClick={() => (credits === 0 ? triggerPaywall() : handleSearch())}
                    disabled={
                      (loading || fakeLoading) ||
                      (credits !== 0 && ((!niche && !customNiche) || !city))
                    }
                    className="w-full group flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-black hover:bg-slate-200 disabled:opacity-45 disabled:cursor-not-allowed text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                  >
                    {loading || fakeLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        {tSearch("scanning")}
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 group-hover:scale-105 transition-transform" />
                        {tSearch("extractLeads")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}


          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center mb-12 border border-red-500/20 font-bold">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && hasSearched && !historyContext && (
            <div className="text-center text-slate-500 my-16 p-8 border border-neutral-800/50 rounded-2xl border-dashed">
              <Search className="w-12 h-12 mx-auto text-neutral-700 mb-4" />
              <p className="text-lg font-medium text-slate-400">{tResults("noResultsTitle")}</p>
              <p className="text-sm mt-2 text-zinc-600">{tResults("noResultsTip")}</p>
            </div>
          )}

          <div ref={resultsRef} />

          {/* History context banner */}
          {historyContext && results.length > 0 && (
            <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-sm text-zinc-300 font-medium truncate">
                  {historyContext.niche} en {historyContext.city}
                </span>
                <span className="text-xs text-zinc-600 shrink-0">
                  · {timeAgo(historyContext.createdAt)}
                </span>
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setHistoryContext(null);
                  mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold shrink-0 transition-colors"
              >
                {tHistory("newSearch")}
              </button>
            </div>
          )}

          {resultInsights && resultInsights.prime === 0 && results.length > 0 && (
            <SearchResultsGuidance
              insights={resultInsights}
              city={city}
              suggestions={suggestedNiches}
              onTryNiche={trySuggestedNiche}
              onEditSearch={scrollToSearchForm}
              title={tResults("weakResultsTitle")}
              body={tResults("weakResultsBody", {
                total: resultInsights.total,
                withWeb: resultInsights.withWeb,
                noPhone: resultInsights.noPhone,
                inactive: resultInsights.inactive,
              })}
              exploreNote={
                resultInsights.explore > 0
                  ? tResults("weakResultsExplore", { count: resultInsights.explore })
                  : ""
              }
              suggestionsTitle={tResults("suggestNichesTitle")}
              sameCityLabel={tResults("suggestSameCity")}
              changeZoneLabel={tResults("changeZone")}
            />
          )}

          {primeOpportunities.length > 0 && (
            <motion.div
              className={`mb-12 ${showFoundGlow ? "animate-pulse-once" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-end justify-between gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  <span className="text-indigo-400 tabular-nums">
                    {primeOpportunities.filter((p) => !hiddenIndexes.includes(results.indexOf(p))).length}
                  </span>{" "}
                  {tResults("salesOpportunities")}
                </h2>
                <span className="text-[10px] font-medium text-emerald-500/70 uppercase tracking-widest shrink-0">
                  live
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
                {primeOpportunities.map((place, index) =>
                  renderPlaceCard(place, results.indexOf(place), true, index * 0.06)
                )}
              </div>
            </motion.div>
          )}

          {exploreOpportunities.length > 0 && (
            <div className="pb-4 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px bg-neutral-800/80 flex-1" />
                <h2 className="text-[11px] font-semibold text-amber-500/80 uppercase tracking-widest">
                  {tResults("exploreOpportunities")}
                </h2>
                <div className="h-px bg-neutral-800/80 flex-1" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {exploreOpportunities.map((place, index) =>
                  renderPlaceCard(place, results.indexOf(place), false, (primeOpportunities.length + index) * 0.06)
                )}
              </div>
            </div>
          )}

          {withWebLeads.length > 0 && (
            <div className="pb-8">
              <button
                type="button"
                onClick={() => setShowWithWebLeads((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-slate-500 hover:text-slate-300 border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl transition-colors"
              >
                {showWithWebLeads
                  ? tResults("hideWithWeb")
                  : tResults("withWebSection", { count: withWebLeads.length })}
              </button>
              {showWithWebLeads ? (
                <div className="mt-4 grid md:grid-cols-2 gap-4 opacity-60">
                  {withWebLeads.map((place, index) =>
                    renderPlaceCard(
                      place,
                      results.indexOf(place),
                      false,
                      (primeOpportunities.length + exploreOpportunities.length + index) * 0.06
                    )
                  )}
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
