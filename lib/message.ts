const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Strips protocol and trailing slash from a URL for inline display */
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Returns the first meaningful segment of a business name, removing suffixes like "- Barber Shop" */
function cleanName(raw: string): string {
  return raw.split(/[-|·,]/)[0].trim();
}

// ─── SPANISH ──────────────────────────────────────────────────────────────────

function buildES(
  rawName: string,
  reviewCount: number,
  rating: number,
  formal: boolean
): string {
  const n = cleanName(rawName);

  // Observation: no website — never mention Maps
  const noWebObs = formal
    ? pick([
        `Busqué ${n} en internet y no encuentro página web.`,
        `Estuve buscando la web de ${n} y no aparece ninguna.`,
        `Con todo lo que manejan, me sorprendió no encontrar web de ${n}.`,
      ])
    : reviewCount >= 10
    ? pick([
        "Busqué su web y no encontré ninguna.",
        "No le encontré página web.",
        "Tiene ficha en Google pero no web propia.",
      ])
    : pick([
        "Busqué su web y no aparece nada.",
        "No encontré web del negocio.",
      ]);

  // Rating line — only if >= 4.0
  const ratingLine =
    rating >= 4.0
      ? pick([
          `Con ${rating.toFixed(1)} estrellas en Google, merece una web acorde.`,
          `Sus ${rating.toFixed(1)} estrellas en Google hablan bien del negocio — es una lástima no tener web.`,
          `Tiene ${rating.toFixed(1)} estrellas en Google, eso se aprovecha mucho mejor con una web propia.`,
        ])
      : null;

  // Proposal
  const proposal = formal
    ? pick([
        `Me especializo en webs para negocios consolidados. ¿Les envío una propuesta?`,
        `Desarrollo páginas web para empresas como ${n}. ¿Puedo enviarles información?`,
        `Trabajo con negocios del tamaño de ${n}. ¿Les mando algo sin compromiso?`,
      ])
    : pick([
        "Me dedico a hacer webs para negocios locales. ¿Le mando algo?",
        "Hago páginas web para negocios como el suyo. ¿Le envío info sin compromiso?",
        "Creo webs para negocios locales. ¿Le parece si le mando una propuesta rápida?",
      ]);

  const parts = [`Hola ${n},`, noWebObs];
  if (ratingLine) parts.push(ratingLine);
  parts.push(proposal);

  return parts.join(" ");
}

// ─── ENGLISH ──────────────────────────────────────────────────────────────────

function buildEN(
  rawName: string,
  reviewCount: number,
  rating: number,
  formal: boolean
): string {
  const n = cleanName(rawName);

  const noWebObs = formal
    ? pick([
        `I searched for ${n} online and couldn't find a website.`,
        `I looked you up and was surprised not to find a website for ${n}.`,
        `${n} doesn't seem to have a website, given the size of the business.`,
      ])
    : reviewCount >= 10
    ? pick([
        "I looked you up online and couldn't find a website.",
        "I couldn't find a website for you anywhere.",
        "You're on Google but don't seem to have a website yet.",
      ])
    : pick([
        "I looked you up but couldn't find a website.",
        "Your business doesn't seem to have a website yet.",
      ]);

  const ratingLine =
    rating >= 4.0
      ? pick([
          `${rating.toFixed(1)} stars on Google — you deserve a proper website to match.`,
          `With ${rating.toFixed(1)} stars on Google, a website would really do you justice.`,
          `Your ${rating.toFixed(1)}-star rating speaks for itself — a website would take it further.`,
        ])
      : null;

  const proposal = formal
    ? pick([
        `I specialize in websites for established businesses. Would it be okay to send a proposal?`,
        `I build websites for businesses like ${n}. Mind if I send something over?`,
        `I work with businesses the size of ${n} — happy to send a proposal if you're open to it.`,
      ])
    : pick([
        "I build websites for local businesses — want me to send something over?",
        "I make websites for businesses like yours. Happy to send info if you're curious.",
        "I design websites for local businesses. Mind if I send a quick proposal?",
      ]);

  const parts = [`Hi ${n},`, noWebObs];
  if (ratingLine) parts.push(ratingLine);
  parts.push(proposal);

  return parts.join(" ");
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function generateContactMessage(
  name: string,
  hasWebsite: boolean,
  reviewCount: number = 0,
  rating: number = 0,
  locale: string = "es",
  website?: string | null
): string {
  const formal = reviewCount >= 250;
  const n = cleanName(name);

  if (locale === "en") {
    if (hasWebsite) {
      const webRef = website ? ` (${stripProtocol(website)})` : "";
      return `Hi ${n}, I see you already have a website${webRef}. I also work with businesses looking to freshen things up online — want me to send a few ideas?`;
    }
    return buildEN(name, reviewCount, rating, formal);
  }

  // Spanish (default)
  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return `Hola ${n}, veo que ya tiene web${webRef}. También trabajo con negocios que quieren renovar su presencia online. ¿Le mando algunas ideas?`;
  }
  return buildES(name, reviewCount, rating, formal);
}
