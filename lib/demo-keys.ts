export function businessDemoKey(name: string, address: string): string {
  const n = name.trim().toLowerCase().replace(/\s+/g, " ");
  const a = address.trim().toLowerCase().replace(/\s+/g, " ");
  return `${n}|${a}`;
}

export function buildDemosByKey(
  demos: Array<{ slug: string; businessData: Record<string, unknown> | unknown }>
): Record<string, string> {
  const byKey: Record<string, string> = {};
  for (const demo of demos) {
    const raw = demo.businessData as Record<string, unknown>;
    const n = String(raw.name ?? "").trim();
    const a = String(raw.address ?? "").trim();
    if (n && a) byKey[businessDemoKey(n, a)] = demo.slug;
  }
  return byKey;
}

/** Mapa índice de tarjeta → slug (búsqueda). */
export function demoMapForPlaces(
  places: Array<{ name: string; address: string }>,
  byKey: Record<string, string>
): Record<number, string> {
  const map: Record<number, string> = {};
  places.forEach((place, index) => {
    const slug = byKey[businessDemoKey(place.name, place.address)];
    if (slug) map[index] = slug;
  });
  return map;
}
