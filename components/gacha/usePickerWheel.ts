"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** idle → scanning (desplazamiento) → locked (selección) */
export type PickerPhase = "idle" | "scanning" | "locked";

export const PICKER_WINDOW_HEIGHT = 46;
export const PICKER_ITEM_HEIGHT = PICKER_WINDOW_HEIGHT;
export const PICKER_VISIBLE_ROWS = 1;

const ROLL_DURATION_MS = 680;
const LOCK_DURATION_MS = 120;

export interface UsePickerWheelOptions<T> {
  pool: T[];
  exclude?: T | T[];
  onComplete: (value: T) => void;
  format?: (value: T) => string;
  sequenceLength?: number;
}

function buildSequence<T>(
  options: T[],
  final: T,
  coreLength: number,
  format: (v: T) => string
): { labels: string[]; stopIndex: number } {
  const labels: string[] = [];
  const randomCount = Math.max(Math.min(coreLength - 1, 10), 4);

  for (let i = 0; i < randomCount; i++) {
    const pick = options[Math.floor(Math.random() * options.length)]!;
    labels.push(format(pick));
  }
  labels.push(format(final));
  return { labels, stopIndex: labels.length - 1 };
}

export function usePickerWheel<T>({
  pool,
  exclude,
  onComplete,
  format = (v) => String(v),
  sequenceLength = 10,
}: UsePickerWheelOptions<T>) {
  const [phase, setPhase] = useState<PickerPhase>("idle");
  const [wheelLabels, setWheelLabels] = useState<string[]>([]);
  const [wheelIndex, setWheelIndex] = useState(0);
  const [stepDurationMs, setStepDurationMs] = useState(ROLL_DURATION_MS);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameRef = useRef<number | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  };

  useEffect(() => clearTimers, []);

  const roll = useCallback(() => {
    if (phase !== "idle" || pool.length === 0) return;

    const excluded = Array.isArray(exclude) ? exclude : exclude !== undefined ? [exclude] : [];
    const options = pool.filter((item) => !excluded.includes(item));
    if (options.length === 0) return;

    clearTimers();

    const final = options[Math.floor(Math.random() * options.length)]!;
    const { labels, stopIndex } = buildSequence(options, final, sequenceLength, format);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      onComplete(final);
      return;
    }

    setWheelLabels(labels);
    setWheelIndex(0);
    setStepDurationMs(ROLL_DURATION_MS);
    setPhase("scanning");
    // A single transform, rather than dozens of React-rendered ticks.
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => setWheelIndex(stopIndex));
    });
    timersRef.current.push(setTimeout(() => {
      setPhase("locked");
      timersRef.current.push(setTimeout(() => {
        onComplete(final);
        setPhase("idle");
        setWheelIndex(0);
      }, LOCK_DURATION_MS));
    }, ROLL_DURATION_MS));
  }, [pool, exclude, onComplete, format, phase, sequenceLength]);

  return {
    roll,
    phase,
    wheelLabels,
    wheelIndex,
    stepDurationMs,
    itemHeight: PICKER_ITEM_HEIGHT,
    windowHeight: PICKER_WINDOW_HEIGHT,
    visibleRows: PICKER_VISIBLE_ROWS,
    isScanning: phase === "scanning",
    isLocked: phase === "locked",
    isActive: phase !== "idle",
    isRolling: phase === "scanning",
    isReveal: phase === "locked",
  };
}

/** @deprecated use usePickerWheel */
export const useGachaRoll = usePickerWheel;
export type GachaPhase = PickerPhase;
