"use client";

import { motion } from "framer-motion";
import { Lightbulb, MapPin, Sparkles } from "lucide-react";
import type { SearchResultInsights } from "@/lib/search-result-insights";

interface Props {
  insights: SearchResultInsights;
  city: string;
  suggestions: string[];
  onTryNiche: (niche: string) => void;
  onEditSearch: () => void;
  title: string;
  body: string;
  exploreNote: string;
  suggestionsTitle: string;
  sameCityLabel: string;
  changeZoneLabel: string;
}

export function SearchResultsGuidance({
  insights,
  city,
  suggestions,
  onTryNiche,
  onEditSearch,
  title,
  body,
  exploreNote,
  suggestionsTitle,
  sameCityLabel,
  changeZoneLabel,
}: Props) {
  if (insights.prime > 0 || insights.total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-neutral-900/40 p-5 md:p-6"
    >
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white leading-snug">{title}</h2>
          <p className="text-sm text-amber-200/75 mt-1.5 leading-relaxed">{body}</p>
          {insights.explore > 0 ? (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exploreNote}</p>
          ) : null}
        </div>
      </div>

      {suggestions.length > 0 && city ? (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {suggestionsTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onTryNiche(s)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/35 text-slate-200 hover:text-white transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="truncate max-w-[200px]">{s}</span>
                <span className="text-slate-500 font-normal hidden sm:inline">
                  · {city.split(",")[0]?.trim() || city}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">{sameCityLabel}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onEditSearch}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        {changeZoneLabel}
      </button>
    </motion.div>
  );
}
