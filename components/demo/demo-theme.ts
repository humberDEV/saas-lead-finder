import type { CSSProperties } from "react";
import type { DemoTheme } from "@/lib/demo/types";

export function isBrandedTheme(theme: DemoTheme): boolean {
  return Boolean(theme.brand);
}

export function accentProps(theme: DemoTheme) {
  if (isBrandedTheme(theme)) {
    return { style: { color: theme.accentText } as const, className: "" };
  }
  return { className: theme.accentText, style: undefined };
}

export function borderAccent(theme: DemoTheme): CSSProperties | undefined {
  if (!theme.brand) return undefined;
  return { borderColor: `${theme.brand.primary}40` };
}

export function heroBgStyle(theme: DemoTheme, branded: boolean): CSSProperties | undefined {
  return branded ? { background: theme.heroGradient } : undefined;
}

export function heroGlowStyle(theme: DemoTheme, branded: boolean): CSSProperties | undefined {
  return branded ? { background: theme.heroGlow } : undefined;
}

export function primaryBtnStyle(theme: DemoTheme, branded: boolean): CSSProperties | undefined {
  if (!branded) return undefined;
  return { background: theme.ctaPrimary, boxShadow: theme.glow };
}

export function pageBgStyle(theme: DemoTheme): CSSProperties {
  const deep = theme.brand?.deep ?? "#07070a";
  const primary = theme.brand?.primary ?? "#6366f1";
  return {
    background: `linear-gradient(180deg, ${deep} 0%, ${primary}18 12%, #07070a 32%, #07070a 100%)`,
  };
}

export function cardSurfaceStyle(theme: DemoTheme): CSSProperties | undefined {
  if (!theme.brand) return undefined;
  const { primary } = theme.brand;
  return {
    borderColor: `${primary}38`,
    background: `linear-gradient(145deg, ${primary}16 0%, rgba(255,255,255,0.03) 50%)`,
  };
}

export function iconWellStyle(theme: DemoTheme): CSSProperties | undefined {
  if (!theme.brand) return undefined;
  return {
    backgroundColor: `${theme.brand.primary}24`,
    color: theme.accentText,
  };
}

export function infoBarStyle(theme: DemoTheme): CSSProperties | undefined {
  if (!theme.brand) return undefined;
  return {
    borderColor: `${theme.brand.primary}25`,
    background: `linear-gradient(90deg, ${theme.brand.primary}10 0%, transparent 60%)`,
  };
}

export function ambientBrandLayers(theme: DemoTheme): CSSProperties[] {
  if (!theme.brand) return [];
  return [
    { background: theme.heroGlow },
    { background: theme.heroGradient, opacity: 0.42 },
  ];
}
