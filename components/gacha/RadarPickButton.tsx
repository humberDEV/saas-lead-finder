"use client";

import { Shuffle } from "lucide-react";
import { motion } from "framer-motion";
import type { PickerPhase } from "./usePickerWheel";

interface Props {
  label: string;
  onClick: () => void;
  phase: PickerPhase;
  disabled?: boolean;
}

export function RadarPickButton({ label, onClick, phase, disabled }: Props) {
  const rolling = phase !== "idle";
  const busy = rolling || disabled;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={rolling}
      className="relative flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-400/90 hover:text-indigo-200 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
      animate={{ opacity: rolling ? 0.65 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <motion.span
        className="flex h-4 w-4 items-center justify-center"
        animate={rolling ? { rotate: [0, -12, 12, 0] } : { rotate: 0 }}
        transition={
          rolling
            ? { duration: 0.35, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        <Shuffle className="w-3.5 h-3.5" />
      </motion.span>
      <span className="min-w-[4.5rem] text-left">{label}</span>
    </motion.button>
  );
}

/** @deprecated */
export const GachaShuffleButton = RadarPickButton;
