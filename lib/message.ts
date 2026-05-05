const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── SPANISH ──────────────────────────────────────────────────────────────────

const OPENERS_ES = [
  "Hola, buenos dias.",
  "Hola, buenas tardes.",
  "Hola, buenas.",
  "Buenas,",
];

const HOW_FOUND_ES = [
  "he visto su negocio en Google Maps y queria comentarle algo.",
  "encontre su negocio en Google Maps y tenia una consulta.",
  "vi su ficha en Google Maps y queria hacerle una pregunta.",
];

function noWebObs_ES(reviewCount: number): string {
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

const PROPOSALS_ES = [
  "Me dedico al diseno web para negocios locales y, si le interesa, puedo enviarle informacion sin compromiso.",
  "Hago paginas web para negocios como el suyo. Si le parece bien, puedo mandarle algo de informacion.",
  "Me dedico a crear webs para negocios locales. Si le interesa, puedo enviarle una propuesta sin ningun compromiso.",
];

// ─── ENGLISH ──────────────────────────────────────────────────────────────────

const OPENERS_EN = [
  "Hi, hope you're doing well.",
  "Hello,",
  "Hi there,",
];

const HOW_FOUND_EN = [
  "I came across your business on Google Maps and wanted to reach out.",
  "I found your listing on Google Maps and had a quick question.",
  "I noticed your business on Google Maps and thought I'd get in touch.",
];

function noWebObs_EN(reviewCount: number): string {
  if (reviewCount >= 50) {
    return pick([
      `I can see you have ${reviewCount} reviews on Google, which is great, but I couldn't find a website for your business.`,
      `You have solid activity on Google Maps, though I didn't find a website.`,
    ]);
  }
  if (reviewCount >= 10) {
    return pick([
      "I searched for your website but couldn't find one.",
      "I noticed your business doesn't have its own website yet.",
      "You're on Google Maps but I couldn't find a website for you.",
    ]);
  }
  return pick([
    "I searched for your website but nothing came up.",
    "I couldn't find a website for your business.",
  ]);
}

const PROPOSALS_EN = [
  "I build websites for local businesses and would be happy to send you some information, no commitment.",
  "I specialize in websites for businesses like yours. If you're interested, I can send over some details.",
  "I create websites for local businesses. If you'd like, I can put together a quick proposal for you, no strings attached.",
];

// ─── SHARED ───────────────────────────────────────────────────────────────────

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function generateContactMessage(
  name: string,
  hasWebsite: boolean,
  reviewCount: number = 0,
  _rating: number = 0,
  locale: string = "es",
  website?: string | null
): string {
  if (locale === "en") {
    const opener = pick(OPENERS_EN);
    if (hasWebsite) {
      const webRef = website ? ` (${stripProtocol(website)})` : "";
      return `${opener} I found your business on Google Maps. You already have a website${webRef}, but I also help businesses that want to refresh their online presence. If that sounds interesting, I'd be happy to share some ideas with no commitment.`;
    }
    return [opener, pick(HOW_FOUND_EN), noWebObs_EN(reviewCount), pick(PROPOSALS_EN)].join(" ");
  }

  // Spanish (default)
  const opener = pick(OPENERS_ES);
  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return `${opener} he visto su negocio en Google Maps. Tiene web${webRef}, aunque me especializo tambien en redisenos para negocios que quieran renovar su presencia online. Si le interesa, puedo enviarle algunas ideas sin compromiso.`;
  }
  return [opener, pick(HOW_FOUND_ES), noWebObs_ES(reviewCount), pick(PROPOSALS_ES)].join(" ");
}
