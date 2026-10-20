"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { PickerPhase } from "./usePickerWheel";
import { PICKER_ITEM_HEIGHT, PICKER_WINDOW_HEIGHT } from "./usePickerWheel";

interface Props {
  phase: PickerPhase;
  wheelLabels: string[];
  wheelIndex: number;
  stepDurationMs?: number;
  itemHeight?: number;
  windowHeight?: number;
  visibleRows?: number;
  fieldClassName: string;
  children: ReactNode;
}

/** Compact, single-pass reel within the input's own height. */
export function PickerWheelOverlay({
  phase,
  wheelLabels,
  wheelIndex,
  stepDurationMs = 50,
  itemHeight = PICKER_ITEM_HEIGHT,
  windowHeight = PICKER_WINDOW_HEIGHT,
  visibleRows: _visibleRows,
  fieldClassName,
  children,
}: Props) {
  const rolling = phase !== "idle" && wheelLabels.length > 0;

  return (
    <div className="relative w-full">
      {rolling ? (
        <div
          className={`${fieldClassName} !p-0 relative overflow-hidden select-none`}
          style={{ height: windowHeight }}
          role="status"
          aria-label={phase === "locked" ? wheelLabels[wheelLabels.length - 1] : undefined}
          aria-busy={phase === "scanning"}
        >
            <motion.div
              className="flex flex-col will-change-transform"
              initial={false}
              animate={{ y: -wheelIndex * itemHeight }}
              transition={{
                duration: stepDurationMs / 1000,
                ease: [0.18, 0.75, 0.22, 1],
              }}
            >
              {wheelLabels.map((label, i) => {
                return (
                  <div
                    key={`${label}-${i}`}
                    className="flex shrink-0 items-center px-4 text-sm font-medium text-slate-100"
                    style={{ height: itemHeight }}
                  >
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </motion.div>
          <span className="absolute right-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-indigo-400" aria-hidden />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/** @deprecated */
export const GachaFieldOverlay = PickerWheelOverlay;
