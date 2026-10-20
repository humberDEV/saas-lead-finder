"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  History,
  Briefcase,
  Settings,
  MonitorPlay,
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");

  const TABS = [
    { href: "/search", icon: Search, label: t("search") },
    { href: "/history", icon: History, label: t("history") },
    { href: "/demos", icon: MonitorPlay, label: t("demos") },
    { href: "/crm", icon: Briefcase, label: t("portfolio") },
    { href: "/settings", icon: Settings, label: t("account") },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div className="md:hidden shrink-0 h-[60px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#2d3236] bg-[#090b0d]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch h-[60px]">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname.includes(href.slice(1));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-0.5 transition-colors active:opacity-70 ${
                  active
                    ? "text-violet-300"
                    : "text-zinc-500 hover:text-zinc-100"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.75} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-violet-400" />
                  )}
                </div>
                <span
                  className={`max-w-[4rem] truncate text-[10px] font-medium tracking-tight ${
                    active ? "text-violet-300" : ""
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
