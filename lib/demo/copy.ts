import type {
  DemoCategory,
  DemoCtaCopy,
  DemoLocale,
  DemoSectionCopy,
  DemoServiceItem,
} from "./types";

export interface CopyContext {
  name: string;
  cityShort: string;
  cityFull: string | null;
  rating: number;
  reviewCount: number;
  niche: string | null;
  locale: DemoLocale;
}

function city(ctx: CopyContext): string {
  return ctx.cityShort || (ctx.locale === "en" ? "your area" : "tu zona");
}

type SubtitleFn = (ctx: CopyContext) => string;

/** Sin rating/reseñas aquí — eso va una sola vez en la UI */
const HERO_SUBTITLES: Record<DemoCategory, SubtitleFn> = {
  barberia: (ctx) =>
    ctx.locale === "en"
      ? `Men's cuts and grooming in ${city(ctx)}`
      : `Cortes y cuidado masculino en ${city(ctx)}`,

  peluqueria: (ctx) =>
    ctx.locale === "en"
      ? `Hair colour and styling in ${city(ctx)}`
      : `Color, corte y peinado en ${city(ctx)}`,

  restaurante: (ctx) =>
    ctx.locale === "en"
      ? `Local dining in ${city(ctx)}`
      : `Cocina de proximidad en ${city(ctx)}`,

  dentista: (ctx) =>
    ctx.locale === "en"
      ? `Dental clinic in ${city(ctx)}`
      : `Clínica dental en ${city(ctx)}`,

  clinica: (ctx) =>
    ctx.locale === "en"
      ? `Healthcare in ${city(ctx)}`
      : `Centro de salud en ${city(ctx)}`,

  estetica: (ctx) =>
    ctx.locale === "en"
      ? `Aesthetic treatments in ${city(ctx)}`
      : `Tratamientos estéticos en ${city(ctx)}`,

  gimnasio: (ctx) =>
    ctx.locale === "en"
      ? `Training and classes in ${city(ctx)}`
      : `Entrenamiento y clases en ${city(ctx)}`,

  abogado: (ctx) =>
    ctx.locale === "en"
      ? `Legal advice in ${city(ctx)}`
      : `Asesoría legal en ${city(ctx)}`,

  veterinaria: (ctx) =>
    ctx.locale === "en"
      ? `Veterinary care in ${city(ctx)}`
      : `Clínica veterinaria en ${city(ctx)}`,

  taller: (ctx) =>
    ctx.locale === "en"
      ? `Auto repair in ${city(ctx)}`
      : `Taller mecánico en ${city(ctx)}`,

  hotel: (ctx) =>
    ctx.locale === "en"
      ? `Rooms in ${city(ctx)}`
      : `Alojamiento en ${city(ctx)}`,

  general: (ctx) => {
    const niche = ctx.niche?.trim();
    if (niche) {
      return ctx.locale === "en"
        ? `${niche} in ${city(ctx)}`
        : `${niche} en ${city(ctx)}`;
    }
    return ctx.locale === "en"
      ? `Local business in ${city(ctx)}`
      : `Negocio local en ${city(ctx)}`;
  },
};

export function buildHeroSubtitle(category: DemoCategory, ctx: CopyContext): string {
  return HERO_SUBTITLES[category](ctx);
}

const SERVICES: Record<DemoCategory, { es: DemoServiceItem[]; en: DemoServiceItem[] }> = {
  barberia: {
    es: [
      { icon: "scissors", title: "Corte clásico", description: "Estilo a medida con acabado profesional." },
      { icon: "sparkles", title: "Barba y perfilado", description: "Definición limpia y productos de calidad." },
      { icon: "user", title: "Asesoría de look", description: "Te recomendamos el corte que mejor te queda." },
      { icon: "clock", title: "Cita rápida", description: "Reserva por WhatsApp y entra sin esperas." },
    ],
    en: [
      { icon: "scissors", title: "Classic cut", description: "Tailored style with a clean finish." },
      { icon: "sparkles", title: "Beard trim", description: "Sharp lines and quality products." },
      { icon: "user", title: "Style advice", description: "We pick the cut that suits you best." },
      { icon: "clock", title: "Quick booking", description: "Book on WhatsApp — walk in on time." },
    ],
  },
  peluqueria: {
    es: [
      { icon: "scissors", title: "Corte y peinado", description: "Look actualizado para el día a día." },
      { icon: "palette", title: "Color y mechas", description: "Técnicas suaves que respetan tu cabello." },
      { icon: "sparkles", title: "Tratamientos", description: "Hidratación, brillo y recuperación." },
      { icon: "calendar", title: "Cita online", description: "Escríbenos y te encajamos en agenda." },
    ],
    en: [
      { icon: "scissors", title: "Cut & blow-dry", description: "Fresh looks for everyday wear." },
      { icon: "palette", title: "Color & highlights", description: "Gentle techniques, healthy hair." },
      { icon: "sparkles", title: "Treatments", description: "Hydration, shine, and repair." },
      { icon: "calendar", title: "Book a slot", description: "Message us — we'll fit you in." },
    ],
  },
  restaurante: {
    es: [
      { icon: "utensils", title: "Carta de temporada", description: "Producto local y platos de autor." },
      { icon: "coffee", title: "Menú del día", description: "Opción completa a buen precio." },
      { icon: "users", title: "Grupos y eventos", description: "Celebraciones con menú a medida." },
      { icon: "package", title: "Para llevar", description: "Pide por teléfono y recoge listo." },
    ],
    en: [
      { icon: "utensils", title: "Seasonal menu", description: "Local produce, chef-driven dishes." },
      { icon: "coffee", title: "Lunch special", description: "Full meal at a fair price." },
      { icon: "users", title: "Groups & events", description: "Custom menus for celebrations." },
      { icon: "package", title: "Takeaway", description: "Call ahead — pick up ready." },
    ],
  },
  dentista: {
    es: [
      { icon: "smile", title: "Revisión y limpieza", description: "Control periódico con enfoque preventivo." },
      { icon: "sparkles", title: "Estética dental", description: "Blanqueamiento y armonía de sonrisa." },
      { icon: "shield", title: "Urgencias", description: "Atención cuando más lo necesitas." },
      { icon: "users", title: "Toda la familia", description: "Desde la primera visita del pequeño." },
    ],
    en: [
      { icon: "smile", title: "Check-up & cleaning", description: "Preventive care, clear explanations." },
      { icon: "sparkles", title: "Cosmetic dentistry", description: "Whitening and smile design." },
      { icon: "shield", title: "Emergencies", description: "We're here when it can't wait." },
      { icon: "users", title: "Family care", description: "From kids' first visits onward." },
    ],
  },
  clinica: {
    es: [
      { icon: "stethoscope", title: "Consulta", description: "Diagnóstico claro y plan personalizado." },
      { icon: "heart", title: "Seguimiento", description: "Acompañamiento entre visitas." },
      { icon: "clock", title: "Citas flexibles", description: "Horarios adaptados a tu rutina." },
      { icon: "map-pin", title: "En el barrio", description: `Acceso fácil en ${"{city}"}`.replace("{city}", "tu zona") },
    ],
    en: [
      { icon: "stethoscope", title: "Consultation", description: "Clear diagnosis, personal plan." },
      { icon: "heart", title: "Follow-up", description: "Support between appointments." },
      { icon: "clock", title: "Flexible hours", description: "Schedules that fit your routine." },
      { icon: "map-pin", title: "Local clinic", description: "Easy to reach in your area." },
    ],
  },
  estetica: {
    es: [
      { icon: "sparkles", title: "Facial", description: "Tratamientos adaptados a tu piel." },
      { icon: "hand", title: "Manicura / pedicura", description: "Acabado impecable y duradero." },
      { icon: "sun", title: "Depilación", description: "Técnicas cómodas y resultados visibles." },
      { icon: "flower", title: "Masajes", description: "Relajación y bienestar en sesión." },
    ],
    en: [
      { icon: "sparkles", title: "Facials", description: "Treatments matched to your skin." },
      { icon: "hand", title: "Nails", description: "Flawless, long-lasting finish." },
      { icon: "sun", title: "Hair removal", description: "Comfortable methods, visible results." },
      { icon: "flower", title: "Massage", description: "Relaxation in every session." },
    ],
  },
  gimnasio: {
    es: [
      { icon: "dumbbell", title: "Musculación", description: "Zona equipada y ambiente motivador." },
      { icon: "users", title: "Clases grupales", description: "HIIT, yoga, spinning y más." },
      { icon: "target", title: "Entreno personal", description: "Plan a tu medida con seguimiento." },
      { icon: "apple", title: "Nutrición", description: "Complementa tu rutina con guía clara." },
    ],
    en: [
      { icon: "dumbbell", title: "Weights floor", description: "Equipped zone, motivating vibe." },
      { icon: "users", title: "Group classes", description: "HIIT, yoga, spin, and more." },
      { icon: "target", title: "Personal training", description: "Custom plan with accountability." },
      { icon: "apple", title: "Nutrition", description: "Clear guidance alongside training." },
    ],
  },
  abogado: {
    es: [
      { icon: "scale", title: "Primera consulta", description: "Evaluamos tu caso sin rodeos." },
      { icon: "file", title: "Tramitación", description: "Gestión documental de principio a fin." },
      { icon: "shield", title: "Defensa", description: "Representación con criterio y experiencia." },
      { icon: "phone", title: "Contacto directo", description: "Habla con tu abogado, no con un call center." },
    ],
    en: [
      { icon: "scale", title: "Initial consult", description: "Straight talk about your case." },
      { icon: "file", title: "Paperwork", description: "End-to-end filing and follow-up." },
      { icon: "shield", title: "Representation", description: "Experienced advocacy in court." },
      { icon: "phone", title: "Direct line", description: "Speak with your lawyer, not a bot." },
    ],
  },
  veterinaria: {
    es: [
      { icon: "heart", title: "Consulta general", description: "Revisiones y vacunas al día." },
      { icon: "scissors", title: "Peluquería canina", description: "Higiene y confort para tu mascota." },
      { icon: "pill", title: "Tratamientos", description: "Protocolos claros y seguimiento." },
      { icon: "phone", title: "Urgencias", description: "Llámanos ante cualquier síntoma grave." },
    ],
    en: [
      { icon: "heart", title: "Wellness visit", description: "Check-ups and vaccines up to date." },
      { icon: "scissors", title: "Grooming", description: "Hygiene and comfort for your pet." },
      { icon: "pill", title: "Treatment plans", description: "Clear protocols and follow-up." },
      { icon: "phone", title: "Emergencies", description: "Call us for urgent symptoms." },
    ],
  },
  taller: {
    es: [
      { icon: "wrench", title: "Mecánica general", description: "Diagnóstico honesto antes de reparar." },
      { icon: "gauge", title: "ITV y revisiones", description: "Preparamos tu coche para pasar sin sorpresas." },
      { icon: "droplet", title: "Aceite y filtros", description: "Mantenimiento rápido con piezas de calidad." },
      { icon: "car", title: "Neumáticos", description: "Cambio, equilibrado y presión a punto." },
    ],
    en: [
      { icon: "wrench", title: "General repair", description: "Honest diagnosis before any work." },
      { icon: "gauge", title: "Inspection prep", description: "Get road-ready without surprises." },
      { icon: "droplet", title: "Oil & filters", description: "Quick service, quality parts." },
      { icon: "car", title: "Tires", description: "Change, balance, correct pressure." },
    ],
  },
  hotel: {
    es: [
      { icon: "bed", title: "Habitaciones", description: "Descanso cómodo en el centro de la ciudad." },
      { icon: "coffee", title: "Desayuno", description: "Empieza el día con producto local." },
      { icon: "wifi", title: "Wi‑Fi y trabajo", description: "Conexión estable para viajeros." },
      { icon: "map-pin", title: "Ubicación", description: "Cerca de lo esencial en la zona." },
    ],
    en: [
      { icon: "bed", title: "Rooms", description: "Comfortable stays near the action." },
      { icon: "coffee", title: "Breakfast", description: "Start the day with local produce." },
      { icon: "wifi", title: "Wi‑Fi & work", description: "Stable connection for travelers." },
      { icon: "map-pin", title: "Location", description: "Close to what matters in town." },
    ],
  },
  general: {
    es: [
      { icon: "star", title: "Atención cercana", description: "Trato directo con quien atiende." },
      { icon: "map-pin", title: "En tu barrio", description: "Fácil de encontrar y de aparcar." },
      { icon: "phone", title: "Reserva rápida", description: "Llama o escribe por WhatsApp." },
      { icon: "shield", title: "Confianza", description: "Reseñas reales de clientes de la zona." },
    ],
    en: [
      { icon: "star", title: "Personal service", description: "You talk to the people who serve you." },
      { icon: "map-pin", title: "Neighborhood spot", description: "Easy to find, easy to park." },
      { icon: "phone", title: "Quick booking", description: "Call or message on WhatsApp." },
      { icon: "shield", title: "Trusted locally", description: "Real reviews from nearby customers." },
    ],
  },
};

export function buildServices(category: DemoCategory, locale: DemoLocale): DemoServiceItem[] {
  const pack = SERVICES[category] ?? SERVICES.general;
  const items = locale === "en" ? pack.en : pack.es;
  return items.map((s) => ({
    ...s,
    description: s.description.replace("tu zona", locale === "en" ? "your area" : "tu zona"),
  }));
}

const CTA_COPY: Record<DemoCategory, { es: Omit<DemoCtaCopy, never>; en: Omit<DemoCtaCopy, never> }> = {
  barberia: {
    es: {
      waHero: "Reservar por WhatsApp",
      waFooter: "Pedir cita por WhatsApp",
      callHero: "Llamar al barbero",
      callFooter: "Llamar ahora",
      footerTitle: "¿Te guardamos sitio?",
      footerSub: "Escríbenos y te confirmamos hora hoy mismo.",
    },
    en: {
      waHero: "Book on WhatsApp",
      waFooter: "Book via WhatsApp",
      callHero: "Call the shop",
      callFooter: "Call now",
      footerTitle: "Want a slot?",
      footerSub: "Message us — we'll confirm your time today.",
    },
  },
  peluqueria: {
    es: {
      waHero: "Pedir cita",
      waFooter: "Reservar por WhatsApp",
      callHero: "Llamar al salón",
      callFooter: "Llamar al salón",
      footerTitle: "¿Nueva imagen esta semana?",
      footerSub: "Cuéntanos qué buscas y te asesoramos sin compromiso.",
    },
    en: {
      waHero: "Book appointment",
      waFooter: "Book on WhatsApp",
      callHero: "Call the salon",
      callFooter: "Call the salon",
      footerTitle: "Ready for a refresh?",
      footerSub: "Tell us what you want — free advice, no pressure.",
    },
  },
  restaurante: {
    es: {
      waHero: "Reservar mesa",
      waFooter: "Reservar por WhatsApp",
      callHero: "Llamar para reservar",
      callFooter: "Reservar por teléfono",
      footerTitle: "¿Comemos hoy?",
      footerSub: "Reserva mesa o pregunta por el menú del día.",
    },
    en: {
      waHero: "Reserve a table",
      waFooter: "Book on WhatsApp",
      callHero: "Call to book",
      callFooter: "Call to reserve",
      footerTitle: "Join us today?",
      footerSub: "Book a table or ask about today's specials.",
    },
  },
  dentista: {
    es: {
      waHero: "Pedir cita dental",
      waFooter: "Solicitar cita",
      callHero: "Llamar a la clínica",
      callFooter: "Llamar a la clínica",
      footerTitle: "¿Hace tiempo que no revisas?",
      footerSub: "Primera consulta sin compromiso — pregúntanos disponibilidad.",
    },
    en: {
      waHero: "Book dental visit",
      waFooter: "Request appointment",
      callHero: "Call the clinic",
      callFooter: "Call the clinic",
      footerTitle: "Time for a check-up?",
      footerSub: "Ask about availability — no-obligation first visit.",
    },
  },
  clinica: {
    es: {
      waHero: "Pedir cita",
      waFooter: "Contactar por WhatsApp",
      callHero: "Llamar al centro",
      callFooter: "Llamar al centro",
      footerTitle: "¿Necesitas una cita?",
      footerSub: "Te orientamos y buscamos el hueco que mejor te venga.",
    },
    en: {
      waHero: "Book appointment",
      waFooter: "Contact on WhatsApp",
      callHero: "Call the clinic",
      callFooter: "Call the clinic",
      footerTitle: "Need an appointment?",
      footerSub: "We'll guide you and find a slot that works.",
    },
  },
  estetica: {
    es: {
      waHero: "Reservar tratamiento",
      waFooter: "Pedir cita estética",
      callHero: "Llamar al centro",
      callFooter: "Llamar ahora",
      footerTitle: "¿Empezamos tu tratamiento?",
      footerSub: "Cuéntanos qué buscas y te recomendamos la mejor opción.",
    },
    en: {
      waHero: "Book treatment",
      waFooter: "Book aesthetic visit",
      callHero: "Call the studio",
      callFooter: "Call now",
      footerTitle: "Start your treatment?",
      footerSub: "Tell us your goals — we'll recommend the right plan.",
    },
  },
  gimnasio: {
    es: {
      waHero: "Probar una clase",
      waFooter: "Info por WhatsApp",
      callHero: "Llamar al gym",
      callFooter: "Llamar al gym",
      footerTitle: "¿Vienes a entrenar?",
      footerSub: "Pregunta por prueba gratuita o planes sin permanencia.",
    },
    en: {
      waHero: "Try a class",
      waFooter: "Ask on WhatsApp",
      callHero: "Call the gym",
      callFooter: "Call the gym",
      footerTitle: "Ready to train?",
      footerSub: "Ask about a free trial or flexible memberships.",
    },
  },
  abogado: {
    es: {
      waHero: "Consulta por WhatsApp",
      waFooter: "Escribir al despacho",
      callHero: "Llamar al despacho",
      callFooter: "Llamar al despacho",
      footerTitle: "¿Hablamos de tu caso?",
      footerSub: "Primera consulta confidencial — cuéntanos tu situación.",
    },
    en: {
      waHero: "WhatsApp consult",
      waFooter: "Message the firm",
      callHero: "Call the office",
      callFooter: "Call the office",
      footerTitle: "Discuss your case?",
      footerSub: "Confidential first consult — tell us your situation.",
    },
  },
  veterinaria: {
    es: {
      waHero: "Pedir cita",
      waFooter: "WhatsApp urgencias",
      callHero: "Llamar a la clínica",
      callFooter: "Llamar ahora",
      footerTitle: "¿Tu mascota necesita revisión?",
      footerSub: "Citas y urgencias — respuesta rápida por WhatsApp.",
    },
    en: {
      waHero: "Book visit",
      waFooter: "WhatsApp urgent",
      callHero: "Call the clinic",
      callFooter: "Call now",
      footerTitle: "Pet needs a check-up?",
      footerSub: "Appointments & urgent care — quick reply on WhatsApp.",
    },
  },
  taller: {
    es: {
      waHero: "Pedir presupuesto",
      waFooter: "WhatsApp al taller",
      callHero: "Llamar al taller",
      callFooter: "Llamar al taller",
      footerTitle: "¿Revisamos tu coche?",
      footerSub: "Presupuesto sin compromiso — dinos el modelo y el problema.",
    },
    en: {
      waHero: "Get a quote",
      waFooter: "WhatsApp the shop",
      callHero: "Call the garage",
      callFooter: "Call the garage",
      footerTitle: "Car needs a look?",
      footerSub: "No-obligation quote — tell us the model and issue.",
    },
  },
  hotel: {
    es: {
      waHero: "Consultar disponibilidad",
      waFooter: "Reservar por WhatsApp",
      callHero: "Llamar recepción",
      callFooter: "Llamar recepción",
      footerTitle: "¿Buscas habitación?",
      footerSub: "Pregunta fechas y tarifas — te respondemos al momento.",
    },
    en: {
      waHero: "Check availability",
      waFooter: "Book on WhatsApp",
      callHero: "Call reception",
      callFooter: "Call reception",
      footerTitle: "Need a room?",
      footerSub: "Ask dates and rates — we'll reply right away.",
    },
  },
  general: {
    es: {
      waHero: "Escribir por WhatsApp",
      waFooter: "Contactar por WhatsApp",
      callHero: "Llamar ahora",
      callFooter: "Llamar ahora",
      footerTitle: "¿Hablamos?",
      footerSub: "Estamos encantados de atenderte — sin compromiso.",
    },
    en: {
      waHero: "Message on WhatsApp",
      waFooter: "Contact on WhatsApp",
      callHero: "Call now",
      callFooter: "Call now",
      footerTitle: "Let's talk",
      footerSub: "Happy to help — no obligation.",
    },
  },
};

const SECTION_COPY: Record<DemoCategory, { es: DemoSectionCopy; en: DemoSectionCopy }> = {
  barberia: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Todo lo que hacemos en la barbería",
      reviewsTitle: "Opiniones en Google",
      locationTitle: "Dónde estamos",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "What we offer at the shop",
      reviewsTitle: "Google reviews",
      locationTitle: "Find us",
    },
  },
  peluqueria: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Corte, color y tratamientos",
      reviewsTitle: "Clientas y clientes",
      locationTitle: "El salón",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "Cuts, colour and treatments",
      reviewsTitle: "What clients say",
      locationTitle: "The salon",
    },
  },
  restaurante: {
    es: {
      servicesTitle: "En la carta",
      servicesSub: "Lo más pedido en sala",
      reviewsTitle: "Quién ha venido",
      locationTitle: "Reserva y ubicación",
    },
    en: {
      servicesTitle: "On the menu",
      servicesSub: "Guest favourites",
      reviewsTitle: "Diners say",
      locationTitle: "Book & location",
    },
  },
  dentista: {
    es: {
      servicesTitle: "Tratamientos",
      servicesSub: "Prevención y estética dental",
      reviewsTitle: "Pacientes",
      locationTitle: "La clínica",
    },
    en: {
      servicesTitle: "Treatments",
      servicesSub: "Preventive and cosmetic care",
      reviewsTitle: "Patients say",
      locationTitle: "The clinic",
    },
  },
  clinica: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Atención y seguimiento",
      reviewsTitle: "Valoraciones",
      locationTitle: "Ubicación y contacto",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "Care and follow-up",
      reviewsTitle: "Ratings",
      locationTitle: "Location & contact",
    },
  },
  estetica: {
    es: {
      servicesTitle: "Tratamientos",
      servicesSub: "Belleza y bienestar",
      reviewsTitle: "Experiencias",
      locationTitle: "Visítanos",
    },
    en: {
      servicesTitle: "Treatments",
      servicesSub: "Beauty and wellness",
      reviewsTitle: "Experiences",
      locationTitle: "Visit us",
    },
  },
  gimnasio: {
    es: {
      servicesTitle: "Instalaciones",
      servicesSub: "Zonas y clases",
      reviewsTitle: "Socios",
      locationTitle: "El centro",
    },
    en: {
      servicesTitle: "Facilities",
      servicesSub: "Zones and classes",
      reviewsTitle: "Members",
      locationTitle: "The gym",
    },
  },
  abogado: {
    es: {
      servicesTitle: "Áreas",
      servicesSub: "Cómo podemos ayudarte",
      reviewsTitle: "Opiniones",
      locationTitle: "Despacho",
    },
    en: {
      servicesTitle: "Practice areas",
      servicesSub: "How we can help",
      reviewsTitle: "Reviews",
      locationTitle: "Office",
    },
  },
  veterinaria: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Para tu mascota",
      reviewsTitle: "Dueños",
      locationTitle: "Clínica",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "For your pet",
      reviewsTitle: "Pet owners",
      locationTitle: "Clinic",
    },
  },
  taller: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Mecánica y mantenimiento",
      reviewsTitle: "Conductores",
      locationTitle: "El taller",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "Repair and maintenance",
      reviewsTitle: "Drivers",
      locationTitle: "Garage",
    },
  },
  hotel: {
    es: {
      servicesTitle: "Estancia",
      servicesSub: "Comodidades",
      reviewsTitle: "Huéspedes",
      locationTitle: "Llegar",
    },
    en: {
      servicesTitle: "Stay",
      servicesSub: "Amenities",
      reviewsTitle: "Guests",
      locationTitle: "Getting here",
    },
  },
  general: {
    es: {
      servicesTitle: "Servicios",
      servicesSub: "Lo que ofrecemos",
      reviewsTitle: "Opiniones",
      locationTitle: "Dónde estamos",
    },
    en: {
      servicesTitle: "Services",
      servicesSub: "What we offer",
      reviewsTitle: "Reviews",
      locationTitle: "Find us",
    },
  },
};

export function buildSectionCopy(
  category: DemoCategory,
  locale: DemoLocale
): DemoSectionCopy {
  const pack = SECTION_COPY[category] ?? SECTION_COPY.general;
  return locale === "en" ? pack.en : pack.es;
}

export function buildCtaCopy(
  category: DemoCategory,
  name: string,
  locale: DemoLocale
): DemoCtaCopy {
  const pack = CTA_COPY[category] ?? CTA_COPY.general;
  const base = locale === "en" ? pack.en : pack.es;
  return {
    ...base,
    footerTitle: base.footerTitle.replace("{name}", name),
  };
}
