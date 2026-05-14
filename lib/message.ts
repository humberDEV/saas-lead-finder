const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── SPANISH ──────────────────────────────────────────────────────────────────

const OPENERS_ES = [
  "Hola, buenas.",
  "Hola, ¿qué tal?",
  "Buenas,",
];

const HOW_FOUND_ES = [
  "vi su negocio en Google Maps y quería hacerle una consulta rápida.",
  "encontré su local en Google Maps y quería comentarle algo.",
  "busqué su negocio en Maps y me surgió una pregunta.",
];

function noWebObs_ES(reviewCount: number): string {
  if (reviewCount >= 50) {
    return pick([
      `Tiene ${reviewCount} reseñas en Google, que está muy bien, pero no encontré página web propia.`,
      `Buena presencia en Maps, aunque no tiene página web todavía.`,
    ]);
  }
  if (reviewCount >= 10) {
    return pick([
      "Busqué su página web y no encontré ninguna.",
      "Tiene ficha en Google Maps pero no web propia.",
      "No encontré página web del negocio.",
    ]);
  }
  return pick([
    "Busqué su página web y no aparece ninguna.",
    "No encontré web del negocio.",
  ]);
}

const PROPOSALS_ES = [
  "Me dedico al diseño web para negocios locales. ¿Le interesaría que le envíe información?",
  "Hago páginas web para negocios como el suyo. Si le parece bien, le mando algo sin compromiso.",
  "Creo webs para negocios locales. ¿Le importaría que le enviara una propuesta rápida?",
];

// ─── ENGLISH ──────────────────────────────────────────────────────────────────

const OPENERS_EN = [
  "Hey, hope you're well.",
  "Hi there,",
  "Hey,",
];

const HOW_FOUND_EN = [
  "I came across your business on Google Maps and had a quick question.",
  "I found your place on Google Maps and wanted to reach out.",
  "I spotted your business on Maps and thought I'd drop you a message.",
];

function noWebObs_EN(reviewCount: number): string {
  if (reviewCount >= 50) {
    return pick([
      `You've got ${reviewCount} Google reviews, which is great — but I couldn't find a website for you.`,
      `Solid presence on Maps, but I didn't come across a website for your business.`,
    ]);
  }
  if (reviewCount >= 10) {
    return pick([
      "I looked for your website but couldn't find one.",
      "You're on Google Maps but don't seem to have a website yet.",
      "Couldn't find a website for your business.",
    ]);
  }
  return pick([
    "I looked you up but couldn't find a website.",
    "Your business doesn't seem to have a website yet.",
  ]);
}

const PROPOSALS_EN = [
  "I build websites for local businesses — would it be okay if I sent you some info?",
  "I make websites for businesses like yours. Happy to send something over if you're curious.",
  "I design websites for local businesses. Would you mind if I sent a quick proposal?",
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
      return `${opener} I found your business on Google Maps. You already have a website${webRef} — I also help businesses that want to freshen up their online presence. Would it be okay if I sent over a few ideas?`;
    }
    return [opener, pick(HOW_FOUND_EN), noWebObs_EN(reviewCount), pick(PROPOSALS_EN)].join(" ");
  }

  // Spanish (default)
  const opener = pick(OPENERS_ES);
  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return `${opener} vi su negocio en Google Maps. Tiene página web${webRef} — también trabajo con negocios que quieren renovar su presencia online. ¿Le importaría que le enviara algunas ideas?`;
  }
  return [opener, pick(HOW_FOUND_ES), noWebObs_ES(reviewCount), pick(PROPOSALS_ES)].join(" ");
}
