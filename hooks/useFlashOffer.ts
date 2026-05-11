"use client";

import { useState, useEffect } from "react";

const FLASH_DURATION_MS = 10 * 60 * 1000; // 10 min
const FLASH_LS_KEY = "huntly_flash_ts";

export const FLASH_COUPON =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLASH_COUPON_ID) || "FLASH50";

/** Call this when the user hits 0 credits to start the 10-min clock. */
export function startFlashOffer() {
  if (typeof window === "undefined") return;
  // Only set once — don't reset if already running
  if (!localStorage.getItem(FLASH_LS_KEY)) {
    localStorage.setItem(FLASH_LS_KEY, String(Date.now()));
  }
}

/** Read the current flash offer state. Does NOT start the timer on its own. */
export function useFlashOffer() {
  const [secsLeft, setSecsLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const stored = localStorage.getItem(FLASH_LS_KEY);
      if (!stored) { setSecsLeft(0); return; }
      const elapsed = Date.now() - Number(stored);
      setSecsLeft(Math.max(0, Math.floor((FLASH_DURATION_MS - elapsed) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    active: secsLeft > 0,
    mm: String(Math.floor(secsLeft / 60)).padStart(2, "0"),
    ss: String(secsLeft % 60).padStart(2, "0"),
  };
}
