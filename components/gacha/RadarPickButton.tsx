"use client";

import { Shuffle } from "lucide-react";
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
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={rolling}
      className="relative flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
    >
      <span className="flex h-4 w-4 items-center justify-center">
        <Shuffle className="w-3.5 h-3.5" />
      </span>
      <span className="min-w-[4.5rem] text-left">{label}</span>
    </button>
  );
}

/** @deprecated */
export const GachaShuffleButton = RadarPickButton;
