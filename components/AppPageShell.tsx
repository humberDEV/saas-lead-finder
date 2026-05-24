"use client";

import type { ReactNode } from "react";
import { appMainClass, appScrollClass } from "./app-layout";

/** Layout compartido para páginas del app autenticado */
export function AppPageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${appScrollClass} ${className}`}>
      <main className={appMainClass}>{children}</main>
    </div>
  );
}
