"use client";

import { useEffect, useState } from "react";

const KEY = "cookie_consent";

function updateConsent(granted: boolean) {
  if (typeof window === "undefined" || !("gtag" in window)) return;
  const state = granted ? "granted" : "denied";
  (window as any).gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "granted") {
      updateConsent(true);
    } else if (!saved) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(KEY, "granted");
    updateConsent(true);
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(KEY, "denied");
    updateConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 py-3 bg-neutral-900 border-t border-neutral-800 text-xs text-zinc-400">
      <p className="flex-1">
        Usamos cookies publicitarias para medir el rendimiento de nuestros anuncios.{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-200 transition-colors"
        >
          Más info
        </a>
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={reject}
          className="px-3 py-1.5 rounded-md border border-neutral-700 text-zinc-400 hover:text-zinc-200 hover:border-neutral-600 transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={accept}
          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
