"use client";

import { useEffect, useState } from "react";
import { REFERRAL_PROMPT_STORAGE_KEY } from "@/lib/referral-constants";
import { useSidebar } from "@/app/[locale]/(app)/SidebarContext";
import { ReferralClaimModal } from "./ReferralClaimModal";

export function ReferralPromptGate() {
  const { refreshCredits } = useSidebar();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;
    const dismissed = localStorage.getItem(REFERRAL_PROMPT_STORAGE_KEY);
    if (dismissed) {
      setChecked(true);
      return;
    }

    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.showReferralPrompt && d?.canClaimReferral) {
          setOpen(true);
        }
      })
      .catch(() => null)
      .finally(() => setChecked(true));
  }, [checked]);

  const close = (reason: "dismissed" | "claimed") => {
    localStorage.setItem(REFERRAL_PROMPT_STORAGE_KEY, reason);
    setOpen(false);
  };

  return (
    <ReferralClaimModal
      open={open}
      onClose={() => close("dismissed")}
      onClaimed={() => {
        close("claimed");
        refreshCredits();
      }}
    />
  );
}
