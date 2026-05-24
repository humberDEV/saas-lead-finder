"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppToastPayload } from "@/components/ui/AppToast";

export function useTimedToast(defaultMs = 4000) {
  const [toast, setToast] = useState<AppToastPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const show = useCallback(
    (payload: AppToastPayload, ms = defaultMs) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(payload);
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, ms);
    },
    [defaultMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, show, dismiss };
}
