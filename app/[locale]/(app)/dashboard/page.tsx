"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Copy, MapPin, Star, Globe, TrendingUp, CopyCheck, Sparkles,
  Navigation2, Search, CheckCircle2, Clock, PartyPopper, Map,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Place } from "@/types";
import { useSidebar } from "../SidebarContext";
import CITIES from "@/lib/cities";

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

const RANDOM_CITIES = CITIES;

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const tResults = useTranslations("dashboard.results");
  const tSearch = useTranslations("dashboard.search");
  const tUpgrade = useTranslations("dashboard.upgrade");
  const tHistory = useTranslations("dashboard.history");
  const timeAgo = useTimeAgo();

  const VALIDATED_NICHES = t.raw("niches") as string[];

  const {
    credits,
    plan,
    decrementCredits,
    refreshHistory,
    pendingHistoryId,
    setPendingHistoryId,
    newSearchVersion,
  } = useSidebar();

  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("upgraded") === "1";
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
  const [showToast, setShowToast] = useState(false);
  const [toastCount, setToastCount] = useState(0);
  const [historyContext, setHistoryContext] = useState<{ niche: string; city: string; createdAt: string } | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Watch for new search signal from sidebar button
  const prevNewSearchVersion = useRef(0);
  useEffect(() => {
    if (newSearchVersion > prevNewSearchVersion.current) {
      prevNewSearchVersion.current = newSearchVersion;
      setResults([]);
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

    fetch(`/api/history/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.results ?? [];
        setResults(found);
        setCurrentHistoryId(id);
        setHistoryContext({ niche: data.niche, city: data.city, createdAt: data.createdAt });
        if (found.length > 0) {
          setToastCount(found.length);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3500);
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
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
    setHiddenIndexes([]);
    setHistoryContext(null);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?niche=${encodeURIComponent(finalNiche)}&city=${encodeURIComponent(finalCity)}`
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(tHistory("serverError", { status: res.status }));
      }

      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);

      const found: Place[] = data.results || [];
      setResults(found);
      setCurrentHistoryId(data.historyId ?? null);

      if (!data.cached) {
        decrementCredits();
        refreshHistory();
      }

      if (found.length > 0) {
        setToastCount(found.length);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
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

  const getRandomCity = () => {
    const options = RANDOM_CITIES.filter((c) => c !== city);
    const picked = options[Math.floor(Math.random() * options.length)];
    setCity(picked);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const getRandomNiche = () => {
    const others = VALIDATED_NICHES.filter((n) => n !== niche);
    setNiche(others[Math.floor(Math.random() * others.length)]);
    setCustomNiche("");
  };

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

  const renderPlaceCard = (place: Place, index: number, isTop: boolean, animDelay: number) => {
    if (hiddenIndexes.includes(index)) return null;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animDelay, ease: "easeOut" }}
        className={`flex flex-col relative overflow-hidden rounded-2xl border ${
          isTop
            ? "border-indigo-500/30 bg-neutral-900/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
            : "border-neutral-800 bg-neutral-900/20"
        } p-6 transition-all hover:border-indigo-500/50 backdrop-blur-xl group h-full`}
      >
        {isTop && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
        )}

        <div className="flex flex-col gap-6 flex-1">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-slate-100">{place.name}</h2>
              {isTop && index < 5 && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-indigo-500/30">
                  #{index + 1}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5 text-sm text-slate-400 mb-4 font-medium">
              <span className="flex items-center gap-2 line-clamp-1" title={place.address}>
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{place.address}</span>
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-400 shrink-0" />
                {place.rating}{" "}
                <span className="text-slate-500">({place.user_ratings_total} {tResults("reviews")})</span>
              </span>
              {place.phone && (
                <span className="flex items-center gap-2 text-slate-300">
                  <Navigation2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  {place.phone}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                {place.has_website ? (
                  <span className="text-slate-500 truncate">{place.website || tResults("hasWeb")}</span>
                ) : (
                  <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                    {tResults("noWeb")}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div
            className={`w-full rounded-xl p-5 border mt-auto ${
              place.temperature === "🟢"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : place.temperature === "🟡"
                ? "bg-amber-500/5 border-amber-500/20"
                : place.temperature === "🟠"
                ? "bg-orange-500/5 border-orange-500/20"
                : "bg-red-500/5 border-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  place.temperature === "🟢"
                    ? "bg-emerald-400"
                    : place.temperature === "🟡"
                    ? "bg-amber-400"
                    : place.temperature === "🟠"
                    ? "bg-orange-400"
                    : "bg-red-400"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  place.temperature === "🟢"
                    ? "text-emerald-400"
                    : place.temperature === "🟡"
                    ? "text-amber-400"
                    : place.temperature === "🟠"
                    ? "text-orange-400"
                    : "text-red-400"
                }`}
              >
                {place.scoreLabel}
              </span>
            </div>
            <div className="text-xs leading-relaxed space-y-2">
              {place.scoreExplanation.split(" • ").map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp
                    className={`w-4 h-4 mt-0.5 ${
                      place.temperature === "🟢"
                        ? "text-emerald-500/50"
                        : place.temperature === "🟡"
                        ? "text-amber-500/50"
                        : place.temperature === "🟠"
                        ? "text-orange-500/50"
                        : "text-red-500/50"
                    }`}
                  />
                  <span className="text-slate-400 font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(place.score >= 40 || !place.has_website) && place.phone && (
          <div className="mt-8 pt-6 border-t border-neutral-800/50">
            <label className="block text-xs font-black text-indigo-400 uppercase tracking-wider mb-3">
              {tResults("openingMessage")}
            </label>
            <div className="relative mb-4">
              <textarea
                readOnly
                className="w-full text-sm font-medium text-slate-300 bg-black/40 border border-neutral-800 rounded-xl p-5 resize-none h-28 focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={place.suggestedMessage}
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              {place.has_whatsapp && (
                <button
                  onClick={() => copyAndAction(place.suggestedMessage, index, place.phone, "whatsapp")}
                  className="group relative flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  {copiedIndex === index ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {tResults("waDirect")}
                </button>
              )}
              <button
                onClick={() => copyAndAction(place.suggestedMessage, index, place.phone, "call")}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-xl transition-all"
              >
                {tResults("callDirect")}
              </button>
            </div>
            <div className="flex border-t border-neutral-800/60 pt-4 mt-4 gap-2">
              {plan === "free" ? (
                <Link
                  href="/pricing"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-xs font-semibold transition-all text-amber-400 border border-amber-500/20 hover:border-amber-500/40"
                >
                  {tResults("savePro")}
                </Link>
              ) : (
                <button
                  onClick={() => handleSaveLead(index, place)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold transition-all text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40"
                >
                  {tResults("saveToPortfolio")}
                </button>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-semibold transition-all text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                <Map className="w-3.5 h-3.5" /> Maps
              </a>
              <button
                onClick={() => handleDismiss(index, place)}
                className="px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-xs font-semibold transition-all text-zinc-500 hover:text-zinc-300"
              >
                {tResults("dismiss")}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const topOpportunities = results.filter((p) => p.score >= 50).slice(0, 5);
  const otherOpportunities = results.filter(
    (p) => p.score >= 10 && !topOpportunities.includes(p)
  );

  return (
    <div className="h-full flex flex-col">
      <div
        ref={mainRef}
        className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]"
      >
        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-emerald-500/30 bg-neutral-900/90 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{tResults("businessesFound", { count: toastCount })}</p>
                <p className="text-xs text-slate-400 font-medium">{tResults("reviewResults")}</p>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/60 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="max-w-4xl mx-auto p-6 md:p-10 pb-24">

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
          {!historyContext && <motion.div
            animate={
              loading
                ? { boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.1)" }
                : showToast
                ? { boxShadow: "0 0 0 1px rgba(16,185,129,0.4), 0 0 50px rgba(16,185,129,0.12)" }
                : { boxShadow: "0 0 0 0px transparent" }
            }
            transition={{ duration: 0.4 }}
            className="bg-neutral-900/40 p-2 rounded-3xl border border-neutral-800/60 shadow-2xl backdrop-blur-xl mb-12 relative z-10"
          >
            <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800">
              <div className="flex flex-col gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                      <span>{tSearch("nicheLabel")}</span>
                      <button
                        type="button"
                        onClick={getRandomNiche}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1"
                      >
                        🎲 {tSearch("randomNiche")}
                      </button>
                    </label>
                    <select
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium"
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
                        <option key={n} value={n}>{n}</option>
                      ))}
                      <option value="custom">{tSearch("customNiche")}</option>
                    </select>
                    {(customNiche !== "" || niche === "custom") && (
                      <input
                        type="text"
                        autoFocus
                        placeholder={tSearch("customNichePlaceholder")}
                        className="w-full mt-3 bg-black border border-indigo-500/30 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                      <span>{tSearch("zoneLabel")}</span>
                      <button
                        type="button"
                        onClick={getRandomCity}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1"
                      >
                        🎲 {tSearch("randomZone")}
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        ref={cityInputRef}
                        type="text"
                        placeholder={tSearch("cityPlaceholder")}
                        className="w-full bg-black border border-neutral-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium placeholder:text-zinc-600"
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                      />
                      {showSuggestions && citySuggestions.length > 0 && (
                        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden shadow-2xl">
                          {citySuggestions.map((s) => (
                            <li key={s}>
                              <button
                                type="button"
                                onMouseDown={() => selectSuggestion(s)}
                                className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                {s}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5">
                      {tSearch("cityHint")}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  {credits === 0 ? (
                    <div className="w-full text-center">
                      <p className="text-amber-400 font-bold text-sm mb-3">
                        {tSearch("outOfSearches")}
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all"
                      >
                        <Sparkles className="w-4 h-4" /> {tSearch("viewPlans")}
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading || (!niche && !customNiche) || !city}
                      className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          {tSearch("scanning")}
                        </span>
                      ) : (
                        <>
                          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          {tSearch("extractLeads")} {credits !== null ? tSearch("remaining", { count: credits }) : ""}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>}

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center mb-12 border border-red-500/20 font-bold">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && !historyContext && (
            <div className="text-center text-slate-500 my-16 p-8 border border-neutral-800/50 rounded-2xl border-dashed">
              <Search className="w-12 h-12 mx-auto text-neutral-700 mb-4" />
              {hasSearched ? (
                <>
                  <p className="text-lg font-medium text-slate-400">{tResults("noResultsTitle")}</p>
                  <p className="text-sm mt-2 text-zinc-600">
                    {tResults("noResultsTip")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-slate-400">{tResults("emptyTitle")}</p>
                  <p className="text-sm mt-2 text-zinc-600">
                    {tResults("emptyTip")}
                  </p>
                </>
              )}
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

          {topOpportunities.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="text-3xl">🚨</span>
                  {topOpportunities.filter((p) => !hiddenIndexes.includes(topOpportunities.indexOf(p))).length}{" "}
                  {tResults("salesOpportunities")}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {topOpportunities.map((place, index) =>
                  renderPlaceCard(place, index, true, index * 0.08)
                )}
              </div>
            </div>
          )}

          {otherOpportunities.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-8 mt-16">
                <div className="h-px bg-neutral-800 flex-1" />
                <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest">
                  {tResults("otherOpportunities")}
                </h2>
                <div className="h-px bg-neutral-800 flex-1" />
              </div>
              <div className="grid md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                {otherOpportunities.map((place, index) =>
                  renderPlaceCard(place, index + 5, false, (topOpportunities.length + index) * 0.08)
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
