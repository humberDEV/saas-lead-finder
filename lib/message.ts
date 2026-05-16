const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

// ─── SPANISH ──────────────────────────────────────────────────────────────────

function buildES(reviewCount: number, rating: number, formal: boolean): string {
  // Openers — no business name, just casual human greeting
  const opener = pick(["Hola,", "Buenas,", "Hola, buenas."]);

  // Observation — combine rating + no-web naturally
  let obs: string;

  if (rating >= 4.0 && reviewCount >= 10) {
    obs = pick([
      `vi que tienen ${rating.toFixed(1)} estrellas en Google, está muy bien. Pero no encontré web propia.`,
      `tienen ${rating.toFixed(1)}⭐ en Google y bastantes reseñas, pero no aparece ninguna web.`,
      `${rating.toFixed(1)} estrellas en Google y sin web — me llamó la atención.`,
      `muy buena pinta en Google (${rating.toFixed(1)}⭐), pero busqué web y no encontré ninguna.`,
    ]);
  } else if (rating >= 4.0 && reviewCount < 10) {
    obs = pick([
      `vi el negocio en Google, ${rating.toFixed(1)} estrellas, pero no hay web por ningún lado.`,
      `busqué más info y tienen ${rating.toFixed(1)}⭐ en Google, pero sin web propia.`,
    ]);
  } else if (reviewCount >= 250) {
    obs = pick([
      `busqué su web y la verdad, con el tamaño del negocio me sorprende no encontrar ninguna.`,
      `estuve buscando su página web y no di con ella. Para el volumen que manejan llamaba la atención.`,
    ]);
  } else if (reviewCount >= 10) {
    obs = pick([
      `busqué web del negocio y no aparece ninguna.`,
      `tienen buena presencia en Google pero no encontré web propia.`,
      `no encontré página web del negocio por ningún lado.`,
    ]);
  } else {
    obs = pick([
      `busqué más info del negocio y no encontré web.`,
      `no di con ninguna web del negocio.`,
    ]);
  }

  // Proposal — short and direct
  const proposal = formal
    ? pick([
        `Me especializo en webs para negocios como el suyo. ¿Les mando propuesta?`,
        `Hago páginas web para empresas. Si les interesa, les mando algo sin compromiso.`,
      ])
    : pick([
        `Me dedico a hacer webs para negocios locales. ¿Le mando algo?`,
        `Hago webs para negocios así. ¿Le interesa que le mande info?`,
        `Me dedico a esto — ¿le mando propuesta sin compromiso?`,
        `Podría ayudarle con eso. ¿Le parece si le mando algo?`,
      ]);

  return `${opener} ${obs} ${proposal}`;
}

// ─── ENGLISH ──────────────────────────────────────────────────────────────────

function buildEN(reviewCount: number, rating: number, formal: boolean): string {
  const opener = pick(["Hey,", "Hi,", "Hey there,"]);

  let obs: string;

  if (rating >= 4.0 && reviewCount >= 10) {
    obs = pick([
      `I saw you've got ${rating.toFixed(1)} stars on Google — really solid. But I couldn't find a website for you.`,
      `${rating.toFixed(1)} stars and plenty of reviews on Google, but no website anywhere.`,
      `great reviews on Google (${rating.toFixed(1)}⭐) but I couldn't find a site for your business.`,
    ]);
  } else if (rating >= 4.0) {
    obs = pick([
      `I looked you up online — ${rating.toFixed(1)} stars on Google, but no website.`,
      `${rating.toFixed(1)}⭐ on Google and no website yet.`,
    ]);
  } else if (reviewCount >= 250) {
    obs = pick([
      `I searched for your website and honestly, for a business your size I was surprised not to find one.`,
      `looked you up online and couldn't find a website — didn't expect that for a place with this many reviews.`,
    ]);
  } else if (reviewCount >= 10) {
    obs = pick([
      `I looked you up but couldn't find a website.`,
      `you're on Google but I couldn't find a website for you.`,
      `no website anywhere for your business.`,
    ]);
  } else {
    obs = pick([
      `I looked you up and couldn't find a website.`,
      `I couldn't find a website for your business.`,
    ]);
  }

  const proposal = formal
    ? pick([
        `I build websites for established businesses. Would it be okay to send a proposal?`,
        `I specialize in this — happy to send something over if you're open to it.`,
      ])
    : pick([
        `I build websites for local businesses — want me to send something over?`,
        `I do this for a living. Want me to send some info?`,
        `happy to send a quick proposal if you're curious.`,
        `I could help with that — want me to send something?`,
      ]);

  return `${opener} ${obs} ${proposal}`;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function generateContactMessage(
  _name: string,
  hasWebsite: boolean,
  reviewCount: number = 0,
  rating: number = 0,
  locale: string = "es",
  website?: string | null
): string {
  const formal = reviewCount >= 250;

  if (locale === "en") {
    if (hasWebsite) {
      const webRef = website ? ` (${stripProtocol(website)})` : "";
      return `Hi, I came across your business online. You already have a website${webRef} — I also work with businesses looking to freshen things up. Want me to send a few ideas?`;
    }
    return buildEN(reviewCount, rating, formal);
  }

  // Spanish (default)
  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return `Hola, vi su negocio online. Tiene web${webRef} — también trabajo con negocios que quieren renovarla. ¿Le mando algunas ideas?`;
  }
  return buildES(reviewCount, rating, formal);
}
