"use client";

import { useCallback, useRef, useState } from "react";

/** idle → rolling (rueda) → locked (frenada final) */
export type PickerPhase = "idle" | "scanning" | "locked";

/** Misma altura que `searchFieldClass` (py-3 + text-sm) */
export const PICKER_WINDOW_HEIGHT = 46;
/** 3 filas lógicas dentro del mismo alto del campo */
export const PICKER_ITEM_HEIGHT = Math.round(PICKER_WINDOW_HEIGHT / 3);
export const PICKER_VISIBLE_ROWS = 3;

const TAIL_PADDING_ROWS = 2;
const ROLL_DURATION_MS = 520;
const LOCK_DURATION_MS = 80;

export interface UsePickerWheelOptions<T> {
  pool: T[];
  exclude?: T | T[];
  onComplete: (value: T) => void;
  format?: (value: T) => string;
  sequenceLength?: number;
}

/** Curva acelerar → frenar, escalada a ~520ms en total */
function buildTickDelays(stepCount: number, totalMs: number, minMs = 6, maxMs = 42): number[] {
  if (stepCount <= 1) return [];
  const raw: number[] = [];
  for (let i = 0; i < stepCount - 1; i++) {
    const t = stepCount === 2 ? 0 : i / (stepCount - 2);
    const wave = Math.sin(Math.PI * t);
    raw.push(maxMs - (maxMs - minMs) * wave);
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum <= 0) return raw.map(() => Math.floor(totalMs / (stepCount - 1)));
  return raw.map((d) => Math.max(4, Math.round((d / sum) * totalMs)));
}

function buildSequence<T>(
  options: T[],
  final: T,
  coreLength: number,
  format: (v: T) => string
): { labels: string[]; stopIndex: number } {
  const labels: string[] = [];
  const randomCount = Math.max(coreLength - 1, 1);

  for (let i = 0; i < randomCount; i++) {
    const pick = options[Math.floor(Math.random() * options.length)]!;
    labels.push(format(pick));
  }
  labels.push(format(final));
  const stopIndex = labels.length - 1;

  for (let i = 0; i < TAIL_PADDING_ROWS; i++) {
    const pick = options[Math.floor(Math.random() * options.length)]!;
    labels.push(format(pick));
  }

  return { labels, stopIndex };
}

export function usePickerWheel<T>({
  pool,
  exclude,
  onComplete,
  format = (v) => String(v),
  sequenceLength = 38,
}: UsePickerWheelOptions<T>) {
  const [phase, setPhase] = useState<PickerPhase>("idle");
  const [wheelLabels, setWheelLabels] = useState<string[]>([]);
  const [wheelIndex, setWheelIndex] = useState(0);
  const [stepDurationMs, setStepDurationMs] = useState(50);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const roll = useCallback(() => {
    if (phase !== "idle" || pool.length === 0) return;

    const excluded = Array.isArray(exclude) ? exclude : exclude !== undefined ? [exclude] : [];
    const options = pool.filter((item) => !excluded.includes(item));
    if (options.length === 0) return;

    clearTimers();

    const final = options[Math.floor(Math.random() * options.length)]!;
    const coreLength = Math.max(sequenceLength, 20);
    const { labels, stopIndex } = buildSequence(options, final, coreLength, format);
    const delays = buildTickDelays(stopIndex + 1, ROLL_DURATION_MS);

    setWheelLabels(labels);
    setWheelIndex(0);
    setStepDurationMs(Math.max(20, Math.min(delays[0] ?? 50, 55)));
    setPhase("scanning");

    let tick = 0;

    const step = () => {
      setWheelIndex(tick);
      tick++;

      if (tick <= stopIndex) {
        const delay = delays[tick - 1] ?? 40;
        setStepDurationMs(Math.max(18, Math.min(delay * 0.95, 55)));
        const id = setTimeout(step, delay);
        timersRef.current.push(id);
      } else {
        setPhase("locked");
        setStepDurationMs(LOCK_DURATION_MS);
        const id = setTimeout(() => {
          onComplete(final);
          setPhase("idle");
          setWheelIndex(0);
        }, LOCK_DURATION_MS);
        timersRef.current.push(id);
      }
    };

    const id = setTimeout(step, delays[0] ?? 12);
    timersRef.current.push(id);
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
