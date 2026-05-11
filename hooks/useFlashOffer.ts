"use client";

import { useState, useEffect } from "react";

const FLASH_DURATION_MS = 10 * 60 * 1000; // 10 min
const FLASH_LS_KEY = "huntly_flash_ts";

export const FLASH_COUPON =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLASH_COUPON_ID) || "FLASH50";

export function useFlashOffer() {
  const [secsLeft, setSecsLeft] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(FLASH_LS_KEY)) {
      localStorage.setItem(FLASH_LS_KEY, String(Date.now()));
    }
    const tick = () => {
      const start = Number(localStorage.getItem(FLASH_LS_KEY));
      setSecsLeft(Math.max(0, Math.floor((FLASH_DURATION_MS - (Date.now() - start)) / 1000)));
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
