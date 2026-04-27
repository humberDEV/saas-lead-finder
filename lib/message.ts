export function generateContactMessage(name: string, hasWebsite: boolean, reviewCount: number = 0, rating: number = 0): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (!hasWebsite) {
    if (reviewCount >= 10) {
      return pick([
        `Vi que tienen ${reviewCount} reseñas en Maps y una nota de ${rating}. ¿Les llega gente también por búsquedas en Google o principalmente por recomendación?`,
        `Buenas reseñas en Maps. ¿Tienen web o de momento solo aparecen en Google Maps?`,
        `Vi su ficha en Maps, buena valoración. ¿Están recibiendo clientes nuevos por internet o funciona más el boca a boca?`,
        `${reviewCount} reseñas y ${rating} de nota en Maps, eso no lo tiene cualquiera. ¿Les buscan también por Google o todo viene por referidos?`,
      ]);
    }

    if (reviewCount > 0 && reviewCount < 10) {
      return pick([
        `Vi su negocio en Maps, parece que están empezando. ¿Cómo están consiguiendo los primeros clientes?`,
        `Encontré su ficha en Maps. ¿Llevan mucho tiempo o acaban de abrir?`,
        `Vi ${name} en Maps. ¿Ya les están llegando clientes o están empezando a darse a conocer?`,
      ]);
    }

    // 0 reseñas
    return pick([
      `Vi su ficha en Google Maps. ¿El negocio está activo actualmente?`,
      `Encontré su perfil en Maps pero no vi más información. ¿Siguen operando?`,
      `Vi ${name} en Maps pero no encontré mucha info. ¿Están abiertos al público?`,
    ]);
  }

  // Ya tiene web
  return pick([
    `Vi su web desde Maps. ¿Saben si les llega gente desde Google o la mayoría viene por otro lado?`,
    `Entré a su página. ¿Están recibiendo consultas desde ahí o todavía no lo han medido?`,
    `Vi que tienen web. ¿Les funciona para captar clientes o es más una tarjeta de presentación?`,
  ]);
}
