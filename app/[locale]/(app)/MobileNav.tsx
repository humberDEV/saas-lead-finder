"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Clock, Briefcase, Settings, LayoutDashboard } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");

  const TABS = [
    { href: "/search",    icon: Search,          label: t("search")    },
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/history",   icon: Clock,           label: t("history")   },
    { href: "/crm",       icon: Briefcase,       label: t("portfolio") },
    { href: "/settings",  icon: Settings,        label: t("account")   },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div className="md:hidden shrink-0 h-[60px]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0c0c14]/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch h-[60px]">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname.includes(href.slice(1));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:opacity-70 ${
                  active
                    ? "text-indigo-400"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-wide ${active ? "text-indigo-400" : ""}`}>
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
