"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, Briefcase, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, MonitorPlay, Plus, Search, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "./SidebarContext";
import { PLAN_LIMITS } from "@/lib/plans";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function planLabel(plan: string) {
  return ({ free: "Free", go: "Go", pro: "Pro", agency: "Agency" } as Record<string, string>)[plan] ?? plan;
}

function NavLink({ href, label, icon: Icon, active, open }: {
  href: string;
  label: string;
  icon: typeof Search;
  active: boolean;
  open: boolean;
}) {
  return <Link
    href={href}
    title={!open ? label : undefined}
    aria-label={!open ? label : undefined}
    aria-current={active ? "page" : undefined}
    className={`flex min-h-10 items-center gap-3 rounded-md border px-3 text-sm transition-colors ${open ? "" : "justify-center px-0"} ${active ? "border-[#3a3e43] bg-[#1e2225] font-medium text-white" : "border-transparent text-zinc-500 hover:bg-[#1a1e21] hover:text-zinc-200"}`}
  >
    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-300" : ""}`} strokeWidth={1.8} />
    {open && <span className="truncate">{label}</span>}
  </Link>;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const t = useTranslations("sidebar");
  const { user } = useUser();
  const { credits, bonusTokens, plan, triggerNewSearch } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const isSearch = pathname.includes("/search");
  const displayName = user?.firstName || user?.username || "User";
  const limit = PLAN_LIMITS[plan] ?? 5;

  const newSearch = () => {
    if (isSearch) triggerNewSearch();
    else router.push("/search");
  };

  const nav = [
    { href: "/dashboard", label: t("home"), icon: LayoutDashboard },
    { href: "/crm", label: t("portfolio"), icon: Briefcase },
    { href: "/demos", label: t("demos"), icon: MonitorPlay },
    { href: "/history", label: t("history"), icon: Clock3 },
  ];

  return <aside className={`${isOpen ? "w-60" : "w-[60px]"} flex h-dvh shrink-0 flex-col overflow-hidden border-r border-[#2d3236] bg-[#090b0d] transition-[width] duration-200`}>
    <div className={`flex h-14 shrink-0 items-center border-b border-[#2d3236] ${isOpen ? "justify-between px-4" : "justify-center"}`}>
      {isOpen && <Link href="/dashboard" className="text-[15px] font-semibold tracking-tight text-white">Huntly<span className="text-indigo-400">.</span></Link>}
      <button type="button" onClick={onToggle} title={isOpen ? t("collapse") : t("expand")} aria-label={isOpen ? t("collapse") : t("expand")} className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-[#1e2225] hover:text-zinc-200">
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>

    <nav aria-label={t("workspace")} className={`shrink-0 border-b border-[#2d3236] py-4 ${isOpen ? "px-3" : "px-2"}`}>
      {isOpen && <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{t("workspace")}</p>}
      <button type="button" onClick={newSearch} title={t("newSearch")} aria-label={!isOpen ? t("newSearch") : undefined} className={`mb-3 flex min-h-10 w-full items-center gap-3 rounded-md bg-indigo-500 text-sm font-medium text-white transition-colors hover:bg-indigo-400 ${isOpen ? "px-3" : "justify-center"}`}>
        <Plus className="h-4 w-4 shrink-0" />{isOpen && <span>{t("newSearch")}</span>}
      </button>
      <div className="space-y-1">
        {nav.map((item) => <NavLink key={item.href} {...item} active={pathname.includes(item.href)} open={isOpen} />)}
      </div>
    </nav>

    <div className="flex-1" />

    <div className={`shrink-0 border-t border-[#2d3236] ${isOpen ? "px-3 py-3" : "px-2 py-3"}`}>
      {isOpen && credits !== null && <div className="mb-3 px-3">
        <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500"><span>{t("searchesRemaining")}</span><span className="font-mono tabular-nums text-zinc-300">{credits} / {limit}</span></div>
        {bonusTokens > 0 && <p className="mt-1 text-[11px] text-indigo-300">+{bonusTokens} {t("bonus")}</p>}
        {credits + bonusTokens <= 0 && <Link href="/pricing" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-white">{t("noSearches")} <ArrowUpRight className="h-3 w-3" /></Link>}
      </div>}
      <Link href="/settings" aria-current={pathname.includes("/settings") ? "page" : undefined} title={!isOpen ? t("settings") : undefined} className={`flex min-h-11 items-center gap-3 rounded-md border px-3 transition-colors ${isOpen ? "" : "justify-center px-0"} ${pathname.includes("/settings") ? "border-[#3a3e43] bg-[#1e2225] text-white" : "border-transparent text-zinc-400 hover:bg-[#1a1e21] hover:text-white"}`}>
        {user?.imageUrl ? <img src={user.imageUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" /> : <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d3236] text-xs font-medium text-zinc-200">{displayName.charAt(0).toUpperCase()}</span>}
        {isOpen && <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{displayName}</span><span className="block text-[11px] text-zinc-600">{planLabel(plan)} · {t("settings")}</span></span>}
        {isOpen && <Settings2 className="h-4 w-4 shrink-0 text-zinc-600" />}
      </Link>
    </div>
  </aside>;
}
