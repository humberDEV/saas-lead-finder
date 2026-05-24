/** Negocios sin web contactables (misma lógica que descuenta crédito en /api/search) */
export function countLeadOpportunities(
  places: { score: number; phone?: string | null }[]
): number {
  return places.filter((p) => p.score >= 40 && Boolean(p.phone)).length;
}
