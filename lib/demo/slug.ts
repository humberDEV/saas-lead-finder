export function generateSlug(name: string, city: string, suffix: string): string {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const cityPart = city.split(",")[0] || city;
  return `${normalize(name)}-${normalize(cityPart)}-${suffix}`;
}
