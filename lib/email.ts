import { Resend } from "resend";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { LimitReachedEmail } from "@/emails/LimitReachedEmail";
import { ReactivationEmail } from "@/emails/ReactivationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Huntly <hola@huntly.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://huntly.app";

/** Fire-and-forget — logs errors but never throws */
async function send(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send to", to, err);
  }
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  if (!to) return;
  const html = await render(WelcomeEmail({ name, appUrl: APP_URL }));
  await send(to, "Bienvenido a Huntly — haz tu primera búsqueda", html);
}

export async function sendLimitReachedEmail(to: string, name?: string | null) {
  if (!to) return;
  const html = await render(LimitReachedEmail({ name, appUrl: APP_URL }));
  await send(to, "Agotaste tus búsquedas gratis — desbloquea más", html);
}

export async function sendReactivationEmail(to: string, name?: string | null) {
  if (!to) return;
  const html = await render(ReactivationEmail({ name, appUrl: APP_URL }));
  await send(to, "Todavía tienes búsquedas gratis esperándote", html);
}
