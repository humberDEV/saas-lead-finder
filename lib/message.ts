const GREETINGS_ES = [
  "Hola, ¿qué tal?",
  "Hola, ¿cómo están?",
  "Hola, buenas tardes",
  "Hola, ¿todo bien?",
  "Buenas, ¿cómo les va?",
  "Hola, buenas",
  "Hola 👋",
];

const GREETINGS_EN = [
  "Hi, how are you?",
  "Hello, how's it going?",
  "Hi there, good afternoon",
  "Hey, how are you doing?",
  "Hello, how's everything?",
  "Hi there",
  "Hey 👋",
];

export function generateContactMessage(name: string, hasWebsite: boolean, reviewCount: number = 0, rating: number = 0, locale: string = "es"): string {
  const greetings = locale === "en" ? GREETINGS_EN : GREETINGS_ES;
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return pick(greetings);
}
