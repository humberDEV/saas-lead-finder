"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { PickerPhase } from "./usePickerWheel";
import {
  PICKER_ITEM_HEIGHT,
  PICKER_VISIBLE_ROWS,
  PICKER_WINDOW_HEIGHT,
} from "./usePickerWheel";

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

/** Ruleta iOS en el mismo alto del input; fade arriba/abajo. */
export function PickerWheelOverlay({
  phase,
  wheelLabels,
  wheelIndex,
  stepDurationMs = 50,
  itemHeight = PICKER_ITEM_HEIGHT,
  windowHeight = PICKER_WINDOW_HEIGHT,
  visibleRows = PICKER_VISIBLE_ROWS,
  fieldClassName,
  children,
}: Props) {
  const rolling = phase !== "idle" && wheelLabels.length > 0;
  const centerOffset = itemHeight * Math.floor(visibleRows / 2);
  const translateY = -wheelIndex * itemHeight + centerOffset;

  return (
    <div
      className="relative w-full"
      style={rolling ? { height: windowHeight, minHeight: windowHeight } : undefined}
    >
      {rolling ? (
        <div
          className={`${fieldClassName} !py-0 !min-h-0 relative overflow-hidden pointer-events-none select-none text-left`}
          style={{
            height: windowHeight,
            minHeight: windowHeight,
            maxHeight: windowHeight,
          }}
          aria-hidden
        >
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none border-y border-white/[0.08] bg-white/[0.04]"
            style={{
              top: centerOffset - itemHeight / 2,
              height: itemHeight,
            }}
          />

          <div
            className="absolute inset-0 z-[5] overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
            }}
          >
            <motion.div
              className="flex flex-col w-full min-w-0 text-left"
              animate={{ y: translateY }}
              transition={{
                duration: stepDurationMs / 1000,
                ease: phase === "locked" ? [0.22, 1, 0.36, 1] : [0.33, 0, 0.2, 1],
              }}
            >
              {wheelLabels.map((label, i) => {
                const dist = Math.abs(i - wheelIndex);
                const opacity = dist === 0 ? 1 : dist === 1 ? 0.48 : 0.2;
                const isCenter = i === wheelIndex;
                return (
                  <div
                    key={`${label}-${i}`}
                    className="flex items-center justify-start shrink-0 w-full text-left"
                    style={{ height: itemHeight, opacity }}
                  >
                    <span
                      className={`block truncate w-full text-left tabular-nums leading-tight ${
                        isCenter
                          ? "text-sm font-semibold text-slate-100"
                          : "text-xs font-medium text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div
            className="absolute inset-x-0 top-0 h-2/5 z-20 pointer-events-none bg-gradient-to-b from-black/50 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/5 z-20 pointer-events-none bg-gradient-to-t from-black/50 to-transparent"
            aria-hidden
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/** @deprecated */
export const GachaFieldOverlay = PickerWheelOverlay;
