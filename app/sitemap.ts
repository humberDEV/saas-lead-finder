import { MetadataRoute } from "next";

const BASE = "https://tryhuntly.com";
const LOCALES = ["en", "es"];

// Public routes (non-authenticated)
const ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "weekly" },
];

// Spanish-only SEO pages
const ES_ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/para-freelancers", priority: 0.8, changeFreq: "monthly" },
  { path: "/para-agencias", priority: 0.8, changeFreq: "monthly" },
  { path: "/blog/conseguir-clientes-web", priority: 0.7, changeFreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const localePages = ROUTES.flatMap(({ path, priority, changeFreq }) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
    }))
  );

  const esPages = ES_ROUTES.map(({ path, priority, changeFreq }) => ({
    url: `${BASE}/es${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));

  return [...localePages, ...esPages];
}
