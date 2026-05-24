"use client";

import { useCallback, useEffect, useState } from "react";
import { buildDemosByKey, businessDemoKey } from "@/lib/demo-keys";

export function useUserDemosByKey(enabled: boolean) {
  const [byKey, setByKey] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) {
      setByKey({});
      setReady(true);
      return;
    }
    try {
      const res = await fetch("/api/demos");
      const data = await res.json();
      setByKey(buildDemosByKey(data.demos ?? []));
    } catch {
      /* keep previous map */
    } finally {
      setReady(true);
    }
  }, [enabled]);

  useEffect(() => {
    setReady(false);
    reload();
  }, [reload]);

  const getSlug = useCallback(
    (name: string, address: string) => byKey[businessDemoKey(name, address)] ?? null,
    [byKey]
  );

  const rememberSlug = useCallback((name: string, address: string, slug: string) => {
    const key = businessDemoKey(name, address);
    setByKey((prev) => (prev[key] === slug ? prev : { ...prev, [key]: slug }));
  }, []);

  return { byKey, ready, getSlug, rememberSlug, reload };
}
