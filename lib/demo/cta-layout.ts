import type { CtaVariant, LandingArchetype } from "./layout";

/** CTA del hero adaptado al layout (columnas estrechas, barra fija, etc.) */
export function resolveHeroCtaVariant(
  ctaVariant: CtaVariant,
  archetype: LandingArchetype
): CtaVariant {
  if (ctaVariant === "floating-bar") return "dual-pill";
  if (ctaVariant === "card-panel") return "stack-full";

  const preferStack: LandingArchetype[] = ["bento", "split", "card"];
  if (preferStack.includes(archetype) && ctaVariant === "dual-pill") {
    return "stack-full";
  }

  return ctaVariant;
}
