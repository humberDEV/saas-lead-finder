import { MetadataRoute } from "next";

const BASE = "https://tryhuntly.com";
const LOCALES = ["en", "es"];

// Public routes (non-authenticated)
const ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "",          priority: 1.0, changeFreq: "weekly"  },
  { path: "/pricing",  priority: 0.8, changeFreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap(({ path, priority, changeFreq }) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
    }))
  );
}
