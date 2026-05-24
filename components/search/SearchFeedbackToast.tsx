"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Search, X } from "lucide-react";

export type SearchFeedback =
  | { kind: "found"; count: number; total?: number }
  | { kind: "empty" }
  | { kind: "weak"; prime: number; total: number };

interface Props {
  feedback: SearchFeedback | null;
  onDismiss: () => void;
  foundTitle: string;
  foundSub: string;
  emptyTitle: string;
  emptySub: string;
  weakTitle: string;
  weakSub: string;
  dismissLabel?: string;
}

export function SearchFeedbackToast({
  feedback,
  onDismiss,
  foundTitle,
  foundSub,
  emptyTitle,
  emptySub,
  weakTitle,
  weakSub,
  dismissLabel = "Cerrar",
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isFound = feedback?.kind === "found";
  const isWeak = feedback?.kind === "weak";
  const duration = isFound ? 3.5 : isWeak ? 7 : 5;

  return createPortal(
    <AnimatePresence>
      {feedback && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-[200] left-4 right-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-8 flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border shadow-2xl pointer-events-auto ${
            isFound
              ? "border-emerald-500/40 bg-neutral-950 shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(16,185,129,0.2)]"
              : isWeak
                ? "border-violet-500/35 bg-neutral-950 shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_28px_rgba(139,92,246,0.18)]"
                : "border-amber-500/40 bg-neutral-950 shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(245,158,11,0.15)]"
          }`}
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 border ${
              isFound
                ? "bg-emerald-500/20 border-emerald-500/35"
                : isWeak
                  ? "bg-violet-500/15 border-violet-500/35"
                  : "bg-amber-500/15 border-amber-500/35"
            }`}
          >
            {isFound ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isWeak ? (
              <Search className="w-4 h-4 text-violet-400" />
            ) : (
              <Search className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-sm font-bold text-white leading-snug">
              {isFound ? foundTitle : isWeak ? weakTitle : emptyTitle}
            </p>
            <p
              className={`text-xs mt-0.5 leading-snug ${
                isFound
                  ? "text-slate-400"
                  : isWeak
                    ? "text-violet-300/80"
                    : "text-amber-400/85"
              }`}
            >
              {isFound ? foundSub : isWeak ? weakSub : emptySub}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={dismissLabel}
          >
            <X className="w-4 h-4" />
          </button>
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 rounded-full ${
              isFound ? "bg-emerald-500/70" : isWeak ? "bg-violet-500/60" : "bg-amber-500/60"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
