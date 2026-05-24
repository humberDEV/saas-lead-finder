/** Utilidades de color (sin dependencias) */

export function normalizeHex(hex: string): string | null {
  const h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const h = n.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** 0 = sin cambio, negativo = oscurecer, positivo = aclarar */
export function adjustHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const f = 1 + amount;
  return rgbToHex(rgb.r * f, rgb.g * f, rgb.b * f);
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isTooLight(hex: string): boolean {
  return luminance(hex) > 0.62;
}

export function isTooDark(hex: string): boolean {
  return luminance(hex) < 0.08;
}

export function pickReadableAccent(hex: string): string {
  if (isTooLight(hex)) return adjustHex(hex, -0.35);
  if (isTooDark(hex)) return adjustHex(hex, 0.25);
  return hex;
}

/** Hash estable para variar el tono entre negocios del mismo rubro */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Desplazamiento en adjustHex (−spread … +spread) derivado del seed */
export function seedToneOffset(seed: string, spread = 0.22): number {
  const h = hashString(seed);
  return ((h % 1000) / 1000) * spread * 2 - spread;
}
