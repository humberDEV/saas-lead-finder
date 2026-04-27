export function calculateOpportunityScore(
  hasWebsite: boolean,
  rating: number = 0,
  reviewCount: number = 0,
  businessStatus: string = '',
  phone: string | null = null
): { score: number; explanation: string; temperature: string; label: string } {

  // Sin teléfono — imposible contactar
  if (!phone) {
    return {
      score: 0,
      explanation: "No tiene teléfono registrado. No hay forma de contactar.",
      temperature: "🔴",
      label: "Sin contacto",
    };
  }

  // Negocio no operativo
  if (businessStatus && businessStatus !== 'OPERATIONAL') {
    return {
      score: 0,
      explanation: "El negocio no aparece como activo en Google Maps.",
      temperature: "🔴",
      label: "Inactivo",
    };
  }

  // Ya tiene web — no necesita el servicio principal
  if (hasWebsite) {
    return {
      score: 10,
      explanation: "Ya tiene web. Posible oportunidad de rediseño, pero no es el perfil ideal.",
      temperature: "🔴",
      label: "Ya tiene web",
    };
  }

  // Sin web a partir de aquí — evaluar por volumen de reseñas

  // Zona ideal: negocio consolidado sin web (10–250 reseñas)
  if (reviewCount >= 10 && reviewCount < 250) {
    return {
      score: 95,
      explanation: `Negocio activo con ${reviewCount} reseñas y sin web. Perfil ideal para vender una página web. Tiene clientes pero pierde los que buscan en Google.`,
      temperature: "🟢",
      label: "Oportunidad ideal",
    };
  }

  // Negocio grande sin web — ticket alto pero proceso más largo
  if (reviewCount >= 250) {
    return {
      score: 80,
      explanation: "Negocio grande sin web. Posible ticket alto, pero suelen tener procesos de decisión más lentos.",
      temperature: "🟡",
      label: "Ticket alto",
    };
  }

  // Pocas reseñas — negocio nuevo o con poco tráfico
  if (reviewCount > 0 && reviewCount < 10) {
    return {
      score: 60,
      explanation: "Negocio nuevo o con poco volumen. Puede necesitar web pero quizá no tenga presupuesto aún.",
      temperature: "🟠",
      label: "Explorar",
    };
  }

  // Sin reseñas — riesgo alto
  return {
    score: 40,
    explanation: "Sin reseñas en Maps. Difícil saber si está activo o tiene presupuesto para una web.",
    temperature: "🟠",
    label: "Explorar",
  };
}
