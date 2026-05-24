"use client";

import { useEffect, useState } from "react";
import { Copy, CopyCheck, Gift, Users, UserCheck, Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "@/app/[locale]/(app)/SidebarContext";
import { ReferralClaimForm } from "@/components/referral/ReferralClaimForm";

type ReferralData = {
  referralCode: string | null;
  referralUrl: string | null;
  bonusTokens: number;
  canClaimReferral?: boolean;
  hasReferrer?: boolean;
  stats: { total: number; paid: number; pending: number };
};

function CopyRow({
  label,
  value,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{label}</p>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black/40 border border-neutral-800 text-xs text-zinc-300 truncate font-mono">
          {value}
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
        >
          {copied ? <CopyCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}

export function ReferralCard() {
  const tClaim = useTranslations("referral.claim");
  const tInvite = useTranslations("referral.invite");
  const { refreshCredits } = useSidebar();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        refreshCredits();
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [refreshCredits]);

  if (loading) {
    return (
      <div className="px-5 py-6 animate-pulse space-y-3">
        <div className="h-4 w-2/3 rounded bg-neutral-800" />
        <div className="h-10 rounded-xl bg-neutral-800" />
      </div>
    );
  }

  if (!data?.referralUrl || !data.referralCode) return null;

  return (
    <div className="px-5 py-5 space-y-4">
      {data.canClaimReferral ? (
        <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.06] p-4 space-y-3">
          <div className="flex gap-2.5">
            <Ticket className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">{tClaim("title")}</p>
              <p className="text-xs text-zinc-500 mt-1">{tClaim("desc")}</p>
            </div>
          </div>
          <ReferralClaimForm
            compact
            onSuccess={() => load()}
          />
        </div>
      ) : null}

      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-snug">{tInvite("title")}</p>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{tInvite("desc")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <CopyRow
          label={tInvite("copyLinkLabel")}
          value={data.referralUrl}
          copyLabel={tInvite("copyLink")}
          copiedLabel={tInvite("copied")}
        />
        <CopyRow
          label={tInvite("copyCodeLabel")}
          value={data.referralCode}
          copyLabel={tInvite("copyCode")}
          copiedLabel={tInvite("copied")}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatBox icon={Users} label={tInvite("statInvited")} value={data.stats.total} />
        <StatBox icon={UserCheck} label={tInvite("statPending")} value={data.stats.pending} />
        <StatBox
          icon={Gift}
          label={tInvite("statRewarded")}
          value={data.stats.paid}
          highlight={data.stats.paid > 0}
        />
      </div>

      {data.bonusTokens > 0 ? (
        <p className="text-xs text-emerald-400/90 font-semibold tabular-nums">
          {tInvite("bonusBalance", { count: data.bonusTokens })}
        </p>
      ) : null}

      {data.hasReferrer ? (
        <p className="text-xs text-violet-400/90 font-medium">{tInvite("linkedNote")}</p>
      ) : null}

      <p className="text-[11px] text-zinc-600 leading-relaxed">{tInvite("finePrint")}</p>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2.5 py-2.5 text-center ${
        highlight
          ? "border-emerald-500/25 bg-emerald-500/[0.08]"
          : "border-neutral-800 bg-neutral-900/50"
      }`}
    >
      <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${highlight ? "text-emerald-400" : "text-zinc-500"}`} />
      <p className={`text-lg font-black tabular-nums ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
      <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wide leading-tight mt-0.5">
        {label}
      </p>
    </div>
  );
}
