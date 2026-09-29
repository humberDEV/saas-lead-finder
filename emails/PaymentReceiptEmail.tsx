import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentReceiptEmailProps {
  name?: string | null;
  amount: string;
  invoiceUrl: string;
  invoicePdfUrl?: string | null;
}

export function PaymentReceiptEmail({
  name,
  amount,
  invoiceUrl,
  invoicePdfUrl,
}: PaymentReceiptEmailProps) {
  const firstName = name?.split(" ")[0] ?? null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Hemos recibido tu pago de Huntly</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>{firstName ? `Hola ${firstName},` : "Hola,"}</Text>
          <Text style={text}>
            Hemos recibido correctamente tu pago de <strong>{amount}</strong>.
            Tu suscripción a Huntly continúa activa.
          </Text>
          <Button href={invoiceUrl} style={button}>
            Ver factura y recibo
          </Button>
          {invoicePdfUrl ? (
            <Text style={small}>
              También puedes <Link href={invoicePdfUrl}>descargar la factura en PDF</Link>.
            </Text>
          ) : null}
          <Text style={text}>
            Si no reconoces este pago o necesitas ayuda, responde directamente a
            este correo.
          </Text>
          <Text style={signature}>— El equipo de Huntly</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PaymentReceiptEmail;

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
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "28px",
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
  color: "#555555",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 24px",
};

const signature: React.CSSProperties = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "28px",
  margin: "32px 0 0",
};
