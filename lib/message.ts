const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Openers ──────────────────────────────────────────────────────────────────
const OPENERS = [
  "Hola, buenos dias.",
  "Hola, buenas tardes.",
  "Hola, buenas.",
  "Buenas,",
];

// ── Cómo encontré el negocio ─────────────────────────────────────────────────
const HOW_FOUND = [
  "he visto vuestro negocio en Google Maps y tenia una consulta.",
  "os he encontrado buscando en Google Maps y queria haceros una pregunta.",
  "vi vuestra ficha en Google Maps y me surgio una duda.",
  "he visto vuestro local en Google Maps y queria comentaros algo.",
];

// ── Observacion sobre la ausencia de web ─────────────────────────────────────
function noWebObs(reviewCount: number): string {
  if (reviewCount >= 50) {
    return pick([
      `Teneis ${reviewCount} resenas en Google, lo que indica que el negocio va bien, pero no he encontrado pagina web propia.`,
      `He visto que teneis bastantes resenas en Maps, pero no teneis web propia.`,
      `Con ${reviewCount} resenas en Google ya tenis bastante presencia, aunque no teneis pagina web.`,
    ]);
  }
  if (reviewCount >= 10) {
    return pick([
      "He buscado vuestra web y no he encontrado ninguna.",
      "No he encontrado pagina web del negocio.",
      "Teneis ficha en Google pero no web propia.",
    ]);
  }
  return pick([
    "He buscado vuestra web y no aparece ninguna.",
    "No he visto que tengais pagina web.",
    "No he encontrado web propia del negocio.",
  ]);
}

// ── Propuesta ────────────────────────────────────────────────────────────────
const PROPOSALS = [
  "Me dedico a hacer paginas web para negocios locales y, si os interesa, puedo enviaros informacion sin compromiso.",
  "Hago webs para negocios como el vuestro y, si quereis, os mando algo de informacion.",
  "Me dedico al diseno web para negocios locales. Si os interesa podria enviaros una propuesta sin ningun compromiso.",
  "Trabajo haciendo webs para negocios de la zona. Si os parece bien, puedo mandaros algo de informacion.",
];

// ── URL en texto plano para incluir en el mensaje ────────────────────────────
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

  // Negocio que ya tiene web: mensaje de rediseno
  if (hasWebsite) {
    const webRef = website ? ` (${stripProtocol(website)})` : "";
    return [
      opener,
      `he visto vuestro negocio en Google Maps.`,
      `Teneis web${webRef}, aunque me dedico tambien a redisenos y mejoras para negocios que quieran renovar su presencia online.`,
      `Si os interesa, puedo enviaros algunas ideas sin ningun compromiso.`,
    ].join(" ");
  }

  const howFound = pick(HOW_FOUND);
  const obs = noWebObs(reviewCount);
  const proposal = pick(PROPOSALS);

  return [opener, howFound, obs, proposal].join(" ");
}
