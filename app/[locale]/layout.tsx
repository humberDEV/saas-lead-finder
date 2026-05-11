import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import CookieBanner from "@/components/CookieBanner";
import { UTMTracker } from "@/components/UTMTracker";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const BASE = "https://tryhuntly.com";

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        "en": `${BASE}/en`,
        "es": `${BASE}/es`,
        "x-default": `${BASE}/en`,
      },
    },
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${BASE}/${locale}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
      siteName: "Huntly",
      locale: locale === "es" ? "es_ES" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      <html lang={locale}>
        <head>
          <Script
            src="https://datafa.st/js/script.js"
            data-website-id="dfid_S2WbyZq6Y63XY9wjb98h4"
            data-domain="tryhuntly.com"
            strategy="afterInteractive"
          />
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=AW-18141614708"
            strategy="beforeInteractive"
          />
          <Script id="google-ads-init" strategy="beforeInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied'
            });
            gtag('js', new Date());
            gtag('config', 'AW-18141614708');
          `}</Script>
        </head>
        <body
          className={`${inter.className} min-h-screen bg-[#0A0A0A] text-slate-100 selection:bg-indigo-500/30`}
        >
          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={null}>
              <UTMTracker />
            </Suspense>
            {children}
            <CookieBanner />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
