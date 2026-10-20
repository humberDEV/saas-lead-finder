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
      <p className="text-[11px] font-medium text-zinc-500">{label}</p>
      <div className="flex gap-2">
        <div className="flex min-h-10 flex-1 min-w-0 items-center truncate rounded-md border border-neutral-800 bg-[#0b0d0f] px-3 font-mono text-xs text-zinc-300">
          {value}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md border border-neutral-700 px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-neutral-500 hover:text-white"
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
    <div className="space-y-5 px-5 py-5">
      {data.canClaimReferral ? (
        <div className="space-y-3 rounded-md border border-neutral-700 bg-[#1e2225] p-4">
          <div className="flex gap-2.5">
            <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
            <div>
              <p className="text-sm font-medium text-white">{tClaim("title")}</p>
              <p className="text-xs text-zinc-500 mt-1">{tClaim("desc")}</p>
            </div>
          </div>
          <ReferralClaimForm
            compact
            onSuccess={() => load()}
          />
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-white">{tInvite("title")}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{tInvite("desc")}</p>
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

      <div className="grid grid-cols-3 divide-x divide-neutral-800 border-y border-neutral-800 py-3">
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
        <p className="text-xs font-medium tabular-nums text-indigo-300">
          {tInvite("bonusBalance", { count: data.bonusTokens })}
        </p>
      ) : null}

      {data.hasReferrer ? (
        <p className="text-xs font-medium text-indigo-300">{tInvite("linkedNote")}</p>
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
    <div className="px-2.5 text-center">
      <Icon className={`mx-auto mb-1 h-3.5 w-3.5 ${highlight ? "text-indigo-300" : "text-zinc-600"}`} />
      <p className={`text-base font-semibold tabular-nums ${highlight ? "text-indigo-300" : "text-zinc-200"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">
        {label}
      </p>
    </div>
  );
}
