const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Short, neutral openers — "usted" form, no regional markers
const OPENERS = [
  "Hola, buenos dias.",
  "Hola, buenas tardes.",
  "Hola, buenas.",
  "Buenas,",
];

// How they found the business
const HOW_FOUND = [
  "he visto su negocio en Google Maps y queria comentarle algo.",
  "encontre su negocio en Google Maps y tenia una consulta.",
  "vi su ficha en Google Maps y queria hacerle una pregunta.",
];

// No-website observation — varies by review count
function noWebObs(reviewCount: number): string {
  if (reviewCount >= 50) {
    return pick([
      `Vi que tiene ${reviewCount} resenas en Google, que esta muy bien, pero no encontre pagina web propia.`,
      `Tiene bastante actividad en Maps, aunque no tiene web propia.`,
    ]);
  }
  if (reviewCount >= 10) {
    return pick([
      "Busque su web y no encontre ninguna.",
      "No encontre pagina web del negocio.",
      "Tiene presencia en Google Maps pero no web propia.",
    ]);
  }
  return pick([
    "Busque su web y no aparece ninguna.",
    "No encontre pagina web de su negocio.",
  ]);
}

// Closing proposal — direct, no pressure
const PROPOSALS = [
  "Me dedico al diseno web para negocios locales y, si le interesa, puedo enviarle informacion sin compromiso.",
  "Hago paginas web para negocios como el suyo. Si le parece bien, puedo mandarle algo de informacion.",
  "Me dedico a crear webs para negocios locales. Si le interesa, puedo enviarle una propuesta sin ningun compromiso.",
];

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function generateContactMessage(
  name: string,
  hasWebsite: boolean,
  reviewCount: number = 0,
  _rating: number = 0,
  _locale: string = "es",
  website?: string | null
): string {
  const opener = pick(OPENERS);

  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return `${opener} he visto su negocio en Google Maps. Tiene web${webRef}, aunque me especializo tambien en redisenos para negocios que quieran renovar su presencia online. Si le interesa, puedo enviarle algunas ideas sin compromiso.`;
  }

  return [opener, pick(HOW_FOUND), noWebObs(reviewCount), pick(PROPOSALS)].join(" ");
}
