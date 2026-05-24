"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReferralClaimForm } from "./ReferralClaimForm";

type ReferralClaimModalProps = {
  open: boolean;
  onClose: () => void;
  onClaimed: () => void;
};

export function ReferralClaimModal({ open, onClose, onClaimed }: ReferralClaimModalProps) {
  const t = useTranslations("referral.claim");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0d0d14] shadow-[0_0_80px_rgba(0,0,0,0.85)] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-claim-title"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-500 hover:text-white transition-colors z-10"
              aria-label={t("skip")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 pt-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-violet-400" />
                </div>
                <h2 id="referral-claim-title" className="text-lg font-black text-white">
                  {t("title")}
                </h2>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-xs">{t("desc")}</p>
              </div>

              <ReferralClaimForm
                onSuccess={() => {
                  onClaimed();
                }}
              />

              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {t("skip")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
