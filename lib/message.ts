/**
 * Primer WhatsApp: que respondan, no que compren.
 * Una pregunta fácil. Cero pitch. Español neutro / inglés neutro.
 */

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export type MessageLocale = "es" | "en";

function toLocale(locale: string): MessageLocale {
  return locale.toLowerCase().startsWith("en") ? "en" : "es";
}

/** Nombre corto (antes del guión, sin S.L.) */
export function businessLabel(rawName: string): string | null {
  const cleaned = rawName.trim().replace(/\s+/g, " ");
  if (!cleaned || /^sin nombre$/i.test(cleaned)) return null;

  const primary = (cleaned.split(/\s*[-–|·]\s*/)[0] ?? cleaned).trim();
  const stripped = primary
    .replace(/\s+(S\.?\s*L\.?|S\.?\s*A\.?|S\.?\s*A\.?\s*S\.?|LLC|Inc\.?|Ltd\.?)$/i, "")
    .trim();
  if (stripped.length < 2) return null;

  const words = stripped.split(/\s+/);
  const short = words.length > 4 ? words.slice(0, 3).join(" ") : stripped;
  return short.length > 42 ? `${short.slice(0, 39).trim()}…` : short;
}

type Tier = "busy" | "normal" | "new";

function tier(reviewCount: number): Tier {
  if (reviewCount >= 40) return "busy";
  if (reviewCount >= 8) return "normal";
  return "new";
}

function useName(label: string | null): string | null {
  if (!label) return null;
  return Math.random() < 0.55 ? label : null;
}

// ─── Sin web: parece cliente o vecino con duda práctica ───────────────────────

const NO_WEB_ES: Record<Tier, string[]> = {
  busy: [
    "Hola, buenas. Vi el local en Google con muchas reseñas. ¿Atienden sin cita o hay que reservar?",
    "Buenas tardes. Disculpe el mensaje, ¿este WhatsApp es el del negocio para pedir info?",
    "Hola! Estoy buscando {name} y me salió en Maps. ¿Sigue siendo este el contacto?",
    "Buenas. Una duda rápida: ¿cómo hacen para que la gente vea precios o servicios, solo por aquí?",
    "Hola, perdón que moleste. ¿Guardan turno por WhatsApp o mejor llamar?",
  ],
  normal: [
    "Hola! Vi {name} en Google. ¿Atienden hoy o solo con cita?",
    "Buenas, disculpe. ¿Este número es el correcto para consultar horarios?",
    "Hola. En Maps no me quedó claro si tienen lista de precios en algún lado, ¿me la pueden pasar por aquí?",
    "Buenas! ¿Siguen en la misma dirección que sale en Google?",
    "Hola, buenas. ¿Responden más rápido por aquí o por teléfono?",
  ],
  new: [
    "Hola, disculpe el mensaje. ¿Es usted {name}?",
    "Buenas. Vi el negocio en Google y quería confirmar si atienden fines de semana.",
    "Hola! ¿Este WhatsApp es del local para preguntar antes de ir?",
    "Buenas, una duda tonta: ¿abren mañana o es solo entre semana?",
  ],
};

const NO_WEB_EN: Record<Tier, string[]> = {
  busy: [
    "Hi! Saw you on Google with tons of reviews. Walk-ins ok or appointment only?",
    "Hey, sorry to bother — is this the right WhatsApp to ask about your services?",
    "Hi. Looking for {name} on Maps — is this still the best number?",
    "Hey quick question: how do people usually check prices, just message here?",
    "Hi! Do you take bookings on WhatsApp or better to call?",
  ],
  normal: [
    "Hey! Found {name} on Google. Are you open today or by appointment only?",
    "Hi, sorry — is this the right number for hours?",
    "Hey. Maps didn't show where to see your prices — can you send them here?",
    "Hi! Still at the same address as on Google?",
    "Hey, do you reply faster here or by phone?",
  ],
  new: [
    "Hi, sorry to message — is this {name}?",
    "Hey. Saw the business on Google, do you open on weekends?",
    "Hi! Is this the shop WhatsApp to ask before coming in?",
    "Hey dumb question — open tomorrow or weekdays only?",
  ],
};

// ─── Con web: confusión de usuario, no auditoría de agencia ───────────────────

const WITH_WEB_ES = [
  "Hola, buenas. Intenté ver info en su página y no me cargó bien en el celular, ¿a ustedes les pasa igual?",
  "Buenas! Vi {name} online. ¿El formulario de contacto les llega o a veces falla?",
  "Hola, disculpe. ¿Sigue siendo este el WhatsApp del negocio? En la web no me quedó claro.",
  "Buenas. ¿Reservan por la web o es más fácil escribir por aquí?",
];

const WITH_WEB_EN = [
  "Hi! Tried checking your site on my phone and it was kinda slow — does it work ok for you?",
  "Hey. Found {name} online — does the contact form actually reach you?",
  "Hi, sorry — is this still the business WhatsApp? Wasn't sure from the website.",
  "Hey, do you take bookings on the site or easier to message here?",
];

function fillName(template: string, name: string | null): string {
  if (!name) return template.replace(/\{name\}/g, "el local").replace(/  +/g, " ");
  return template.replace(/\{name\}/g, name);
}

function pickNoWeb(locale: MessageLocale, t: Tier, name: string | null): string {
  const pool = locale === "en" ? NO_WEB_EN[t] : NO_WEB_ES[t];
  return fillName(pick(pool), name);
}

function pickWithWeb(locale: MessageLocale, name: string | null): string {
  const pool = locale === "en" ? WITH_WEB_EN : WITH_WEB_ES;
  return fillName(pick(pool), name);
}

export function generateContactMessage(
  name: string,
  hasWebsite: boolean,
  reviewCount: number = 0,
  _rating: number = 0,
  locale: string = "es",
  _website?: string | null
): string {
  const lang = toLocale(locale);
  const label = useName(businessLabel(name));
  const t = tier(reviewCount);

  if (hasWebsite) return pickWithWeb(lang, label);
  return pickNoWeb(lang, t, label);
}
