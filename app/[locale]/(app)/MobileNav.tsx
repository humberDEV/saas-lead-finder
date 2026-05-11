"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Clock, Briefcase, Settings, LayoutDashboard } from "lucide-react";

const TABS = [
  { href: "/search",    icon: Search,          label: "Buscar"    },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/history",   icon: Clock,           label: "Historial" },
  { href: "/crm",       icon: Briefcase,       label: "Cartera"   },
  { href: "/settings",  icon: Settings,        label: "Cuenta"    },
] as const;

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden shrink-0 border-t border-white/[0.06] bg-[#0c0c14]">
      <div className="flex items-stretch h-[60px] pb-[env(safe-area-inset-bottom,0px)]">
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
  );
}
