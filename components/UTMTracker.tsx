"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const COOKIE_NAME = "_hutm";
const SESSION_KEY = "_hsid";
const COOKIE_DAYS = 30;

function readCookieUtms(): Record<string, string> {
  try {
    const match = document.cookie.match(
      new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)")
    );
    if (!match) return {};
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

function writeCookieUtms(utms: Record<string, string>) {
  const expires = new Date(
    Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(utms)
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function UTMTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlUtms: Record<string, string> = {};
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
    ]) {
      const val = searchParams.get(key);
      if (val) urlUtms[key] = val;
    }

    const hasUrlUtms = Object.keys(urlUtms).length > 0;
    if (hasUrlUtms) writeCookieUtms(urlUtms);

    const utms = hasUrlUtms ? urlUtms : readCookieUtms();
    const sessionId = getSessionId();

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        path: pathname,
        referrer: document.referrer || null,
        utm_source: utms.utm_source ?? null,
        utm_medium: utms.utm_medium ?? null,
        utm_campaign: utms.utm_campaign ?? null,
        utm_term: utms.utm_term ?? null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
