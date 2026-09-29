import { Resend } from "resend";
import { render } from "@react-email/components";
import { PaymentFailedEmail } from "@/emails/PaymentFailedEmail";
import { PaymentReceiptEmail } from "@/emails/PaymentReceiptEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Huntly <hola@huntly.app>";
/** Logs delivery errors but never throws into a request/webhook handler. */
async function send(
  to: string,
  subject: string,
  html: string,
  idempotencyKey?: string
) {
  try {
    const { error } = await resend.emails.send(
      { from: FROM, to, subject, html },
      idempotencyKey ? { idempotencyKey } : undefined
    );
    if (error) {
      console.error("[email] Failed to send to", to, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send to", to, err);
    return false;
  }
}

export async function sendPaymentFailedEmail(
  to: string,
  details: {
    name?: string | null;
    paymentUrl: string;
    amount: string;
    attemptCount: number;
    invoiceId: string;
  }
) {
  if (!to) return false;
  const html = await render(PaymentFailedEmail(details));
  return send(
    to,
    `Acción necesaria: pago pendiente de ${details.amount}`,
    html,
    `payment-failed/${details.invoiceId}/${details.attemptCount}`
  );
}

export async function sendPaymentReceiptEmail(
  to: string,
  details: {
    name?: string | null;
    amount: string;
    invoiceUrl: string;
    invoicePdfUrl?: string | null;
    invoiceId: string;
  }
) {
  if (!to) return false;
  const html = await render(PaymentReceiptEmail(details));
  return send(
    to,
    `Pago recibido: ${details.amount} — factura de Huntly`,
    html,
    `payment-receipt/${details.invoiceId}`
  );
}
