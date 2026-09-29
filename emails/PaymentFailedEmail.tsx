import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentFailedEmailProps {
  name?: string | null;
  paymentUrl: string;
  amount: string;
  attemptCount: number;
}

export function PaymentFailedEmail({
  name,
  paymentUrl,
  amount,
  attemptCount,
}: PaymentFailedEmailProps) {
  const firstName = name?.split(" ")[0] ?? null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Necesitamos que revises el pago de tu suscripción a Huntly</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>{firstName ? `Hola ${firstName},` : "Hola,"}</Text>

          <Text style={text}>
            No hemos podido procesar el pago de <strong>{amount}</strong> de tu
            suscripción a Huntly. Este es el intento número {attemptCount}.
          </Text>

          <Text style={text}>
            Puede deberse a una tarjeta caducada, fondos insuficientes o una
            validación pendiente del banco. Revisa el pago para evitar que tu
            suscripción y tus búsquedas se interrumpan.
          </Text>

          <Button href={paymentUrl} style={button}>
            Revisar y completar el pago
          </Button>

          <Text style={small}>
            El botón abre una página segura de Stripe. Huntly nunca recibe ni
            almacena los datos completos de tu tarjeta.
          </Text>

          <Text style={text}>
            Si ya lo has solucionado, puedes ignorar este mensaje. Si no
            reconoces la suscripción o necesitas ayuda, responde a este email y
            lo revisaremos contigo.
          </Text>

          <Text style={signature}>— El equipo de Huntly</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PaymentFailedEmail;

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "520px",
};

const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "28px",
  color: "#1a1a1a",
  margin: "0 0 20px",
};

const button: React.CSSProperties = {
  backgroundColor: "#6d28d9",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
  margin: "4px 0 24px",
  padding: "13px 20px",
  textDecoration: "none",
};

const small: React.CSSProperties = {
  color: "#666666",
  fontSize: "13px",
  lineHeight: "21px",
  margin: "0 0 24px",
};

const signature: React.CSSProperties = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "28px",
  margin: "32px 0 0",
};
