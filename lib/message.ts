export function generateContactMessage(name: string, hasWebsite: boolean, reviewCount: number = 0, rating: number = 0): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (!hasWebsite) {
    if (reviewCount >= 10) {
      return pick([
        `Hola, vi su perfil en Google Maps. Se ve que tienen buena reputación, ¿llevan mucho tiempo con el negocio?`,
        `Hola, encontré ${name} en Google Maps. Muy buenas reseñas, ¿cómo les ha ido últimamente?`,
        `Hola, vi su negocio en Maps y me llamó la atención. ¿Siguen atendiendo con normalidad?`,
        `Hola, los encontré por Google Maps. Se nota que la gente los recomienda bastante, ¿no?`,
      ]);
    }

    if (reviewCount > 0 && reviewCount < 10) {
      return pick([
        `Hola, vi ${name} en Google Maps. ¿Cómo va el negocio?`,
        `Hola, encontré su negocio en Maps. ¿Siguen activos?`,
        `Hola, los vi en Google Maps. ¿Están atendiendo actualmente?`,
      ]);
    }

    // 0 reseñas
    return pick([
      `Hola, vi su negocio en Google Maps. ¿Están abiertos actualmente?`,
      `Hola, encontré ${name} en Maps. ¿Siguen con el negocio?`,
      `Hola, los vi en Google Maps. ¿Están operando?`,
    ]);
  }

  // Ya tiene web
  return pick([
    `Hola, vi su negocio en Google Maps. ¿Cómo les ha ido últimamente?`,
    `Hola, encontré ${name} por Google Maps. Se ve interesante lo que hacen, ¿llevan mucho tiempo?`,
    `Hola, los encontré en Maps. ¿Cómo va todo con el negocio?`,
  ]);
}
