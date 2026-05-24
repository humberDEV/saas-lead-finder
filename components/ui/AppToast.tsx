"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type AppToastVariant = "success" | "info" | "warning";

export type AppToastPayload = {
  variant: AppToastVariant;
  title: string;
  subtitle?: string;
};

const STYLES: Record<
  AppToastVariant,
  { border: string; icon: typeof CheckCircle2; iconClass: string; subClass: string; bar: string; bg: string }
> = {
  success: {
    border: "border-emerald-500/40",
    bg: "shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(16,185,129,0.2)]",
    icon: CheckCircle2,
    iconClass: "text-emerald-400 bg-emerald-500/20 border-emerald-500/35",
    subClass: "text-slate-400",
    bar: "bg-emerald-500/70",
  },
  info: {
    border: "border-violet-500/35",
    bg: "shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_28px_rgba(139,92,246,0.18)]",
    icon: Info,
    iconClass: "text-violet-400 bg-violet-500/15 border-violet-500/35",
    subClass: "text-violet-300/80",
    bar: "bg-violet-500/60",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(245,158,11,0.15)]",
    icon: AlertCircle,
    iconClass: "text-amber-400 bg-amber-500/15 border-amber-500/35",
    subClass: "text-amber-400/85",
    bar: "bg-amber-500/60",
  },
};

interface AppToastProps {
  toast: AppToastPayload | null;
  onDismiss: () => void;
  dismissLabel?: string;
  durationMs?: number;
}

export function AppToast({
  toast,
  onDismiss,
  dismissLabel = "Cerrar",
  durationMs = 4,
}: AppToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const variant = toast?.variant ?? "info";
  const style = STYLES[variant];
  const Icon = style.icon;

  return createPortal(
    <AnimatePresence>
      {toast ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-[200] left-4 right-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-8 flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border bg-neutral-950 shadow-2xl pointer-events-auto ${style.border} ${style.bg}`}
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 border ${style.iconClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-sm font-bold text-white leading-snug">{toast.title}</p>
            {toast.subtitle ? (
              <p className={`text-xs mt-0.5 leading-snug ${style.subClass}`}>{toast.subtitle}</p>
            ) : null}
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
            className={`absolute bottom-0 left-0 h-0.5 rounded-full ${style.bar}`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: durationMs, ease: "linear" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
