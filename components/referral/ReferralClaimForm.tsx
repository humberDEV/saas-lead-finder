"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

type ReferralClaimFormProps = {
  onSuccess?: (referrerName: string | null) => void;
  compact?: boolean;
};

export function ReferralClaimForm({ onSuccess, compact }: ReferralClaimFormProps) {
  const t = useTranslations("referral.claim");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const key = data.error as string | undefined;
        setError(
          key === "already_referred"
            ? t("errorAlready")
            : key === "self_referral"
              ? t("errorSelf")
              : t("errorInvalid")
        );
        return;
      }

      setSuccess(true);
      onSuccess?.(data.referrerName ?? null);
    } catch {
      setError(t("errorInvalid"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <p className="text-sm text-emerald-400 font-semibold text-center py-2">{t("success")}</p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError(null);
        }}
        placeholder={t("placeholder")}
        autoComplete="off"
        spellCheck={false}
        className={`w-full font-mono uppercase tracking-wider text-white bg-black/40 border rounded-xl px-3.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 ${
          error ? "border-red-500/40" : "border-neutral-800"
        } ${compact ? "py-2.5" : "py-3"}`}
      />
      {error ? <p className="text-xs text-red-400 font-medium">{error}</p> : null}
      <button
        type="submit"
        disabled={!code.trim() || loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {t("submit")}
      </button>
      <p className="text-[11px] text-zinc-600 leading-relaxed text-center">{t("hint")}</p>
    </form>
  );
}
