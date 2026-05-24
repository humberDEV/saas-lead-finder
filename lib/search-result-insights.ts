/** Resumen de una búsqueda para explicar resultados “vacíos” de oportunidades. */
export type SearchResultInsights = {
  total: number;
  /** Verde / amarillo (score ≥ 50) */
  prime: number;
  /** Naranja contactable (40–49) */
  explore: number;
  withWeb: number;
  noPhone: number;
  inactive: number;
};

type PlaceLike = {
  score: number;
  has_website?: boolean;
  phone?: string | null;
  business_status?: string;
};

export function analyzeSearchResults(places: PlaceLike[]): SearchResultInsights {
  const insights: SearchResultInsights = {
    total: places.length,
    prime: 0,
    explore: 0,
    withWeb: 0,
    noPhone: 0,
    inactive: 0,
  };

  for (const p of places) {
    if (!p.phone) {
      insights.noPhone++;
      continue;
    }
    if (p.business_status && p.business_status !== "OPERATIONAL") {
      insights.inactive++;
      continue;
    }
    if (p.has_website || p.score <= 10) {
      insights.withWeb++;
      continue;
    }
    if (p.score >= 50) insights.prime++;
    else if (p.score >= 40) insights.explore++;
  }

  return insights;
}

/** Nichos que suelen dar más negocios locales sin web (match parcial en el nombre). */
const PREFERRED_NICHE_HINTS = [
  "barber",
  "peluquer",
  "hair",
  "salon",
  "taller",
  "mecánic",
  "mechanic",
  "dent",
  "fisio",
  "physio",
  "reform",
  "estétic",
  "esthetic",
  "beauty",
  "fontaner",
  "plumb",
  "cerrajer",
  "locksmith",
  "lavander",
  "laundry",
  "óptic",
  "optic",
  "veterinar",
  "vet ",
  "nutricion",
  "nutrition",
  "psicolog",
  "psycholog",
  "yoga",
  "crossfit",
  "alarm",
  "mudanza",
  "moving",
  "joyer",
  "jewel",
  "carpinter",
  "carpent",
  "climatiz",
  "hvac",
  "fotógraf",
  "photograph",
];

function nicheScore(name: string): number {
  const n = name.toLowerCase();
  return PREFERRED_NICHE_HINTS.some((h) => n.includes(h)) ? 1 : 0;
}

/** Sugiere otros nichos del pool (misma lista i18n que el buscador). */
export function suggestAlternateNiches(
  currentNiche: string,
  pool: string[],
  count = 3
): string[] {
  const cur = currentNiche.trim().toLowerCase();
  const others = pool.filter((n) => n.trim().toLowerCase() !== cur);
  if (!others.length) return [];

  const preferred = others.filter((n) => nicheScore(n) > 0);
  const rest = others.filter((n) => nicheScore(n) === 0);
  const shuffledPreferred = [...preferred].sort(() => Math.random() - 0.5);
  const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
  const merged = [...shuffledPreferred, ...shuffledRest];

  return merged.slice(0, Math.min(count, merged.length));
}
