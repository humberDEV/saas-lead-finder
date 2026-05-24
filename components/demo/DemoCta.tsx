import type { CSSProperties } from "react";
import type { DemoCtaCopy, DemoTheme } from "@/lib/demo/types";
import type { CtaVariant } from "@/lib/demo/layout";
import {
  accentProps,
  isBrandedTheme,
  primaryBtnStyle,
} from "./demo-theme";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4 shrink-0"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

export interface DemoCtaProps {
  variant: CtaVariant;
  placement: "hero" | "footer" | "sticky";
  theme: DemoTheme;
  cta: DemoCtaCopy;
  waUrl: string | null;
  cleanPhone: string;
  phone: string | null;
  hasWhatsapp: boolean;
  align?: "left" | "center";
}

function btnShell(extra = "") {
  return `inline-flex min-h-[48px] w-full sm:w-auto sm:min-w-[10.5rem] max-w-full items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold leading-snug text-center transition-all hover:brightness-110 ${extra}`;
}

function CtaButtons({
  theme,
  branded,
  waUrl,
  cleanPhone,
  phone,
  waLabel,
  callLabel,
  layout,
}: {
  theme: DemoTheme;
  branded: boolean;
  waUrl: string | null;
  cleanPhone: string;
  phone: string | null;
  waLabel: string;
  callLabel: string;
  layout: "row" | "stack";
}) {
  const waClass = `${btnShell(
    "border border-emerald-400/45 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/25"
  )} ${layout === "stack" ? "sm:max-w-none" : ""}`;

  const callClass = branded
    ? btnShell("text-white shadow-lg")
    : `${btnShell(`text-white shadow-lg ${theme.ctaPrimary} ${theme.ctaPrimaryHover}`)}`;

  const callStyle = primaryBtnStyle(theme, branded);

  const wrapClass =
    layout === "stack"
      ? "flex flex-col gap-2.5 w-full max-w-md"
      : "flex flex-col sm:flex-row flex-wrap gap-2.5 w-full max-w-xl";

  return (
    <div className={wrapClass}>
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={waClass}
        >
          <WhatsAppIcon />
          <span className="min-w-0 line-clamp-2">{waLabel}</span>
        </a>
      )}
      {phone && (
        <a href={`tel:${cleanPhone}`} className={callClass} style={callStyle}>
          <PhoneIcon />
          <span className="min-w-0 line-clamp-2">{callLabel}</span>
        </a>
      )}
    </div>
  );
}

export function DemoCta({
  variant,
  placement,
  theme,
  cta,
  waUrl,
  cleanPhone,
  phone,
  align = "left",
}: DemoCtaProps) {
  const branded = isBrandedTheme(theme);
  const waLabel = placement === "footer" ? cta.waFooter : cta.waHero;
  const callLabel = placement === "footer" ? cta.callFooter : cta.callHero;

  if (!waUrl && !phone) return null;

  const alignWrap =
    align === "center"
      ? "w-full flex flex-col items-center"
      : "w-full max-w-full";

  /* ── Barra fija móvil ── */
  if (variant === "floating-bar" && placement === "sticky") {
    const stickyBtn =
      "flex min-h-[48px] flex-1 min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white";

    return (
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#07070a]/95 backdrop-blur-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${stickyBtn} bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/30`}
            >
              <WhatsAppIcon />
              <span className="truncate">{waLabel}</span>
            </a>
          )}
          {phone && (
            <a
              href={`tel:${cleanPhone}`}
              className={stickyBtn}
              style={primaryBtnStyle(theme, branded) as CSSProperties}
            >
              <PhoneIcon />
              <span className="truncate">{callLabel}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  const buttons = (
    <CtaButtons
      theme={theme}
      branded={branded}
      waUrl={waUrl}
      cleanPhone={cleanPhone}
      phone={phone}
      waLabel={waLabel}
      callLabel={callLabel}
      layout={variant === "stack-full" || variant === "card-panel" ? "stack" : "row"}
    />
  );

  if (variant === "stack-full" || variant === "card-panel") {
    return <div className={alignWrap}>{buttons}</div>;
  }

  if (variant === "minimal-row") {
    return (
      <div className={alignWrap}>
        <CtaButtons
          theme={theme}
          branded={branded}
          waUrl={waUrl}
          cleanPhone={cleanPhone}
          phone={phone}
          waLabel={waLabel}
          callLabel={callLabel}
          layout="row"
        />
      </div>
    );
  }

  return <div className={alignWrap}>{buttons}</div>;
}
