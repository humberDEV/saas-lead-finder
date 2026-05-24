"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type DemoQuotaState = {
  limit: number;
  used: number;
  remaining: number | null;
  periodStart: string;
  periodEnd: string;
  canCreate: boolean;
};

interface SidebarContextType {
  credits: number | null;
  bonusTokens: number;
  plan: string;
  demoQuota: DemoQuotaState | null;
  refreshDemoQuota: () => void;
  refreshCredits: () => void;
  historyVersion: number;
  newSearchVersion: number;
  decrementCredits: () => void;
  refreshHistory: () => void;
  triggerNewSearch: () => void;
  pendingHistoryId: string | null;
  setPendingHistoryId: (id: string | null) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  credits: null,
  bonusTokens: 0,
  plan: "free",
  demoQuota: null,
  refreshDemoQuota: () => {},
  refreshCredits: () => {},
  historyVersion: 0,
  newSearchVersion: 0,
  decrementCredits: () => {},
  refreshHistory: () => {},
  triggerNewSearch: () => {},
  pendingHistoryId: null,
  setPendingHistoryId: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [bonusTokens, setBonusTokens] = useState(0);
  const [plan, setPlan] = useState("free");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [newSearchVersion, setNewSearchVersion] = useState(0);
  const [pendingHistoryId, setPendingHistoryId] = useState<string | null>(null);
  const [demoQuota, setDemoQuota] = useState<DemoQuotaState | null>(null);
  const [quotaTick, setQuotaTick] = useState(0);
  const [creditsTick, setCreditsTick] = useState(0);

  const refreshDemoQuota = useCallback(() => setQuotaTick((v) => v + 1), []);
  const refreshCredits = useCallback(() => setCreditsTick((v) => v + 1), []);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => {
        setCredits(d.remaining ?? null);
        setBonusTokens(d.bonusTokens ?? 0);
        setPlan(d.plan ?? "free");
        if (d.demoQuota) setDemoQuota(d.demoQuota);
      })
      .catch(() => null);
  }, [quotaTick, creditsTick]);

  return (
    <SidebarContext.Provider
      value={{
        credits,
        bonusTokens,
        plan,
        demoQuota,
        refreshDemoQuota,
        refreshCredits,
        historyVersion,
        newSearchVersion,
        decrementCredits: () => {
          setBonusTokens((b) => {
            if (b > 0) return b - 1;
            setCredits((p) => (p !== null ? Math.max(0, p - 1) : null));
            return 0;
          });
        },
        refreshHistory: () => setHistoryVersion((v) => v + 1),
        triggerNewSearch: () => setNewSearchVersion((v) => v + 1),
        pendingHistoryId,
        setPendingHistoryId,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
