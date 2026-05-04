"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  credits: number | null;
  plan: string;
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
  plan: "free",
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
  const [plan, setPlan] = useState("free");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [newSearchVersion, setNewSearchVersion] = useState(0);
  const [pendingHistoryId, setPendingHistoryId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => {
        setCredits(d.remaining ?? null);
        setPlan(d.plan ?? "free");
      })
      .catch(() => null);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        credits,
        plan,
        historyVersion,
        newSearchVersion,
        decrementCredits: () =>
          setCredits((p) => (p !== null ? Math.max(0, p - 1) : null)),
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
