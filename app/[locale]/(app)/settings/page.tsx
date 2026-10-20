"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowUpRight, CreditCard, LogOut, Mail, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "../SidebarContext";
import { ReferralCard } from "@/components/settings/ReferralCard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section>
    <h2 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{title}</h2>
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-[#141719]">{children}</div>
  </section>;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useUser();
  const { signOut } = useClerk();
  const { plan, credits, bonusTokens } = useSidebar();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.username ?? "User";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const currentPlan = ({ free: "Free", go: "Go", pro: "Pro", agency: "Agency" } as Record<string, string>)[plan] ?? plan;

  const handleManagePlan = async () => {
    setPortalError(false);
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      if (!response.ok) throw new Error("portal_failed");
      const data = await response.json();
      if (!data.url) throw new Error("portal_missing_url");
      window.location.href = data.url;
    } catch {
      setPortalError(true);
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut({ redirectUrl: "/" }); }
    catch { setSigningOut(false); }
  };

  return <div className="h-full overflow-y-auto bg-[#0b0d0f]">
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-7 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-indigo-300">Huntly / {t("title")}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-7">
          <Section title={t("sectionAccount")}>
            <div className="flex items-center gap-4 px-5 py-5">
              {user?.imageUrl ? <img src={user.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2d3236] text-sm font-medium text-zinc-200">{displayName.charAt(0).toUpperCase()}</span>}
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-zinc-100">{displayName}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p></div>
              <span className="rounded border border-neutral-700 px-2 py-1 text-xs font-medium text-zinc-300">{currentPlan}</span>
            </div>
          </Section>

          <Section title={t("sectionPlan")}>
            <div className="border-b border-neutral-800 px-5 py-5">
              <p className="text-sm font-semibold text-zinc-100">{t("currentPlan", { plan: currentPlan })}</p>
              {credits !== null && <p className="mt-1 text-xs text-zinc-500">{t("remainingSearches", { count: credits })}{bonusTokens > 0 ? ` · +${bonusTokens} ${t("bonusCredits")}` : ""}</p>}
            </div>
            <Link href="/pricing" className="flex min-h-12 items-center gap-3 border-b border-neutral-800 px-5 text-sm text-zinc-300 transition-colors hover:bg-[#1e2225] hover:text-white">
              <Settings2 className="h-4 w-4 text-zinc-500" /><span className="flex-1">{plan === "free" ? t("upgradeLabel") : t("changePlan")}</span><ArrowUpRight className="h-4 w-4 text-zinc-600" />
            </Link>
            {plan !== "free" && <button type="button" onClick={handleManagePlan} disabled={loadingPortal} className="flex min-h-12 w-full items-center gap-3 px-5 text-left text-sm text-zinc-300 transition-colors hover:bg-[#1e2225] hover:text-white disabled:opacity-50">
              <CreditCard className="h-4 w-4 text-zinc-500" /><span className="flex-1">{loadingPortal ? t("managePlanLoading") : t("billingLabel")}</span><ArrowUpRight className="h-4 w-4 text-zinc-600" />
            </button>}
            {portalError && <p role="alert" className="border-t border-neutral-800 px-5 py-3 text-xs text-red-300">{t("portalError")}</p>}
          </Section>

          <Section title={t("sectionReferral")}><ReferralCard /></Section>
        </div>

        <div className="space-y-7">
          <Section title={t("sectionSupport")}>
            <a href="mailto:huntly@outlook.es?subject=Feedback%20Huntly" className="flex min-h-14 items-center gap-3 px-5 text-sm text-zinc-300 transition-colors hover:bg-[#1e2225] hover:text-white">
              <Mail className="h-4 w-4 text-zinc-500" /><span className="flex-1"><span className="block font-medium">{t("feedbackLabel")}</span><span className="mt-0.5 block text-xs text-zinc-500">{t("feedbackSub")}</span></span><ArrowUpRight className="h-4 w-4 text-zinc-600" />
            </a>
          </Section>
          <Section title={t("sectionSession")}>
            <button type="button" onClick={handleSignOut} disabled={signingOut} className="flex min-h-12 w-full items-center gap-3 px-5 text-left text-sm text-zinc-400 transition-colors hover:bg-[#1e2225] hover:text-red-300 disabled:opacity-50">
              <LogOut className="h-4 w-4" /><span>{signingOut ? t("signOutLoading") : t("signOutLabel")}</span>
            </button>
          </Section>
        </div>
      </div>
    </main>
  </div>;
}
