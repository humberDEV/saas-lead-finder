/**
 * Applies a rating bonus/penalty to a base score.
 * Only for leads that passed the no-phone / inactive / has-website filters.
 */
function applyRatingAdjustment(score: number, rating: number): number {
  if (rating <= 0) return score; // no rating data
  if (rating >= 4.0) return Math.min(100, score + 5);
  if (rating < 3.0) return Math.max(0, score - 10);
  return score;
}

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

  // Sin web — evaluar por volumen de reseñas + rating
  const ratingNote =
    rating >= 4.0
      ? ` Buena valoración (${rating.toFixed(1)}⭐).`
      : rating > 0 && rating < 3.0
      ? ` Valoración baja (${rating.toFixed(1)}⭐).`
      : "";

  // Zona ideal: negocio consolidado (10–249 reseñas)
  if (reviewCount >= 10 && reviewCount < 250) {
    return {
      score: applyRatingAdjustment(95, rating),
      explanation: `Negocio activo con ${reviewCount} reseñas y sin web. Perfil ideal para vender una página web.${ratingNote}`,
      temperature: "🟢",
      label: "Oportunidad ideal",
    };
  }

  // Negocio grande — ticket alto, proceso más largo
  if (reviewCount >= 250) {
    return {
      score: applyRatingAdjustment(80, rating),
      explanation: `Negocio grande sin web. Posible ticket alto, pero procesos de decisión más lentos.${ratingNote}`,
      temperature: "🟡",
      label: "Ticket alto",
    };
  }

  // Pocas reseñas — negocio nuevo o con poco tráfico
  if (reviewCount > 0) {
    return {
      score: applyRatingAdjustment(60, rating),
      explanation: `Negocio nuevo o con poco volumen. Puede necesitar web pero quizá no tenga presupuesto aún.${ratingNote}`,
      temperature: "🟠",
      label: "Explorar",
    };
  }

  // Sin reseñas — riesgo alto
  return {
    score: applyRatingAdjustment(40, rating),
    explanation: `Sin reseñas en Google. Difícil saber si está activo o tiene presupuesto para una web.${ratingNote}`,
    temperature: "🟠",
    label: "Explorar",
  };
}
