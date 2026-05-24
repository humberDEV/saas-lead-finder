/** @deprecated Use `@/lib/demo` — kept for older imports */
export { inferCategory as inferTemplate, generateSlug } from "@/lib/demo";
export { getCategoryTheme } from "@/lib/demo/categories";

// Legacy shape for demos list page
import { CATEGORY_THEMES } from "@/lib/demo/categories";
import type { DemoCategory } from "@/lib/demo/types";

export const TEMPLATES = Object.fromEntries(
  (Object.keys(CATEGORY_THEMES) as DemoCategory[]).map((id) => [
    id,
    {
      id,
      label: CATEGORY_THEMES[id].label,
      heroColor: CATEGORY_THEMES[id].heroGradient,
      heroGlow: CATEGORY_THEMES[id].heroGlow,
      accentColor: CATEGORY_THEMES[id].accentText,
      accentBg: CATEGORY_THEMES[id].accentBg,
      icon: CATEGORY_THEMES[id].emoji,
      services: [],
      tagline: "",
    },
  ])
);
