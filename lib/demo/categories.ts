import type { DemoCategory, DemoTheme } from "./types";

type CtaPalette = Pick<
  DemoTheme,
  "heroGlow" | "ctaPrimary" | "ctaPrimaryHover" | "ctaPanel" | "ctaOutline"
>;

const CTA: Record<string, CtaPalette> = {
  amber: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,191,36,0.18),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30",
    ctaPrimaryHover: "hover:from-amber-400 hover:to-orange-500",
    ctaPanel: "from-amber-500/20 via-orange-600/5 to-[#07070a]",
    ctaOutline: "border-amber-400/35 text-amber-100 hover:bg-amber-500/10",
  },
  rose: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,113,133,0.18),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30",
    ctaPrimaryHover: "hover:from-rose-400 hover:to-pink-500",
    ctaPanel: "from-rose-500/20 via-pink-600/5 to-[#07070a]",
    ctaOutline: "border-rose-400/35 text-rose-100 hover:bg-rose-500/10",
  },
  orange: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.2),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/30",
    ctaPrimaryHover: "hover:from-orange-400 hover:to-red-500",
    ctaPanel: "from-orange-500/20 via-red-600/5 to-[#07070a]",
    ctaOutline: "border-orange-400/35 text-orange-100 hover:bg-orange-500/10",
  },
  cyan: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.16),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-cyan-500 to-sky-600 shadow-cyan-500/30",
    ctaPrimaryHover: "hover:from-cyan-400 hover:to-sky-500",
    ctaPanel: "from-cyan-500/18 via-sky-600/5 to-[#07070a]",
    ctaOutline: "border-cyan-400/35 text-cyan-100 hover:bg-cyan-500/10",
  },
  sky: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.16),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/30",
    ctaPrimaryHover: "hover:from-sky-400 hover:to-blue-500",
    ctaPanel: "from-sky-500/18 via-blue-600/5 to-[#07070a]",
    ctaOutline: "border-sky-400/35 text-sky-100 hover:bg-sky-500/10",
  },
  purple: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(192,132,252,0.18),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-purple-500/30",
    ctaPrimaryHover: "hover:from-purple-400 hover:to-fuchsia-500",
    ctaPanel: "from-purple-500/20 via-fuchsia-600/5 to-[#07070a]",
    ctaOutline: "border-purple-400/35 text-purple-100 hover:bg-purple-500/10",
  },
  emerald: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(52,211,153,0.16),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30",
    ctaPrimaryHover: "hover:from-emerald-400 hover:to-green-500",
    ctaPanel: "from-emerald-500/18 via-green-600/5 to-[#07070a]",
    ctaOutline: "border-emerald-400/35 text-emerald-100 hover:bg-emerald-500/10",
  },
  indigo: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(129,140,248,0.16),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-indigo-500/30",
    ctaPrimaryHover: "hover:from-indigo-400 hover:to-violet-500",
    ctaPanel: "from-indigo-500/18 via-violet-600/5 to-[#07070a]",
    ctaOutline: "border-indigo-400/35 text-indigo-100 hover:bg-indigo-500/10",
  },
  teal: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.16),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-teal-500 to-emerald-600 shadow-teal-500/30",
    ctaPrimaryHover: "hover:from-teal-400 hover:to-emerald-500",
    ctaPanel: "from-teal-500/18 via-emerald-600/5 to-[#07070a]",
    ctaOutline: "border-teal-400/35 text-teal-100 hover:bg-teal-500/10",
  },
  violet: {
    heroGlow: "[background:radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(167,139,250,0.2),transparent)]",
    ctaPrimary: "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-violet-500/35",
    ctaPrimaryHover: "hover:from-violet-400 hover:to-indigo-500",
    ctaPanel: "from-violet-500/22 via-indigo-600/8 to-[#07070a]",
    ctaOutline: "border-violet-400/35 text-violet-100 hover:bg-violet-500/10",
  },
};

function theme(
  base: Omit<DemoTheme, keyof CtaPalette>,
  palette: keyof typeof CTA
): DemoTheme {
  return { ...base, ...CTA[palette] };
}

export const CATEGORY_THEMES: Record<DemoCategory, DemoTheme> = {
  barberia: theme(
    {
      heroGradient: "from-zinc-950 via-stone-900 to-amber-950/40",
      accentText: "text-amber-400",
      accentBg: "bg-amber-500",
      accentBorder: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      label: "Barbería",
      emoji: "✂️",
    },
    "amber"
  ),
  peluqueria: theme(
    {
      heroGradient: "from-zinc-950 via-rose-950/50 to-fuchsia-950/30",
      accentText: "text-rose-400",
      accentBg: "bg-rose-500",
      accentBorder: "border-rose-500/30",
      glow: "shadow-rose-500/20",
      label: "Peluquería",
      emoji: "💇",
    },
    "rose"
  ),
  restaurante: theme(
    {
      heroGradient: "from-zinc-950 via-orange-950/50 to-red-950/30",
      accentText: "text-orange-400",
      accentBg: "bg-orange-500",
      accentBorder: "border-orange-500/30",
      glow: "shadow-orange-500/20",
      label: "Restaurante",
      emoji: "🍽️",
    },
    "orange"
  ),
  dentista: theme(
    {
      heroGradient: "from-zinc-950 via-cyan-950/40 to-sky-950/50",
      accentText: "text-cyan-400",
      accentBg: "bg-cyan-500",
      accentBorder: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
      label: "Clínica dental",
      emoji: "🦷",
    },
    "cyan"
  ),
  clinica: theme(
    {
      heroGradient: "from-zinc-950 via-blue-950/50 to-indigo-950/30",
      accentText: "text-sky-400",
      accentBg: "bg-sky-500",
      accentBorder: "border-sky-500/30",
      glow: "shadow-sky-500/20",
      label: "Centro de salud",
      emoji: "🏥",
    },
    "sky"
  ),
  estetica: theme(
    {
      heroGradient: "from-zinc-950 via-purple-950/50 to-fuchsia-950/40",
      accentText: "text-purple-400",
      accentBg: "bg-purple-500",
      accentBorder: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      label: "Estética",
      emoji: "✨",
    },
    "purple"
  ),
  gimnasio: theme(
    {
      heroGradient: "from-zinc-950 via-emerald-950/40 to-green-950/50",
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-500",
      accentBorder: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      label: "Gimnasio",
      emoji: "💪",
    },
    "emerald"
  ),
  abogado: theme(
    {
      heroGradient: "from-zinc-950 via-slate-900 to-indigo-950/50",
      accentText: "text-indigo-300",
      accentBg: "bg-indigo-500",
      accentBorder: "border-indigo-500/30",
      glow: "shadow-indigo-500/20",
      label: "Despacho legal",
      emoji: "⚖️",
    },
    "indigo"
  ),
  veterinaria: theme(
    {
      heroGradient: "from-zinc-950 via-teal-950/40 to-emerald-950/30",
      accentText: "text-teal-400",
      accentBg: "bg-teal-500",
      accentBorder: "border-teal-500/30",
      glow: "shadow-teal-500/20",
      label: "Veterinaria",
      emoji: "🐾",
    },
    "teal"
  ),
  taller: theme(
    {
      heroGradient: "from-zinc-950 via-neutral-900 to-amber-950/30",
      accentText: "text-amber-300",
      accentBg: "bg-amber-600",
      accentBorder: "border-amber-500/30",
      glow: "shadow-amber-500/15",
      label: "Taller",
      emoji: "🔧",
    },
    "amber"
  ),
  hotel: theme(
    {
      heroGradient: "from-zinc-950 via-violet-950/30 to-slate-900",
      accentText: "text-violet-300",
      accentBg: "bg-violet-500",
      accentBorder: "border-violet-500/30",
      glow: "shadow-violet-500/20",
      label: "Alojamiento",
      emoji: "🏨",
    },
    "violet"
  ),
  general: theme(
    {
      heroGradient: "from-[#07070a] via-indigo-950/40 to-violet-950/30",
      accentText: "text-violet-400",
      accentBg: "bg-violet-500",
      accentBorder: "border-violet-500/30",
      glow: "shadow-violet-500/25",
      label: "Negocio local",
      emoji: "📍",
    },
    "violet"
  ),
};

export function getCategoryTheme(category: DemoCategory): DemoTheme {
  return CATEGORY_THEMES[category] ?? CATEGORY_THEMES.general;
}
