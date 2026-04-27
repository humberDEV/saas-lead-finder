export function generateContactMessage(name: string, hasWebsite: boolean, reviewCount: number = 0, rating: number = 0): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return pick([
    `Hola, ¿qué tal?`,
    `Hola, ¿cómo están?`,
    `Hola, buenas tardes`,
    `Hola, ¿todo bien?`,
    `Buenas, ¿cómo les va?`,
    `Hola, buenas`,
    `Hola 👋`,
  ]);
}
