import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ReactivationEmailProps {
  name?: string | null;
  appUrl: string;
}

export function ReactivationEmail({ name, appUrl }: ReactivationEmailProps) {
  const firstName = name?.split(" ")[0] ?? "ahí";

  return (
    <Html lang="es">
      <Head />
      <Preview>Todavía tienes búsquedas gratis esperándote en Huntly</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>Huntly</Heading>

          <Heading style={h1}>{firstName}, ¿sigues buscando clientes?</Heading>

          <Text style={text}>
            Te registraste en Huntly hace unos días pero todavía no has hecho
            tu primera búsqueda.
          </Text>

          <Text style={text}>
            Sigues teniendo <strong>3 búsquedas gratis</strong>. En menos de 2
            minutos puedes tener una lista de negocios sin web listos para
            contactar.
          </Text>

          <Section style={exampleBox}>
            <Text style={exampleTitle}>Ejemplo real:</Text>
            <Text style={exampleItem}>🔍 "peluquerías" en Ciudad de México</Text>
            <Text style={exampleItem}>→ 18 negocios sin web encontrados</Text>
            <Text style={exampleItem}>→ 12 con número de teléfono o WhatsApp</Text>
            <Text style={exampleItem}>→ Mensaje de contacto generado automáticamente</Text>
          </Section>

          <Section style={btnSection}>
            <Button href={`${appUrl}/dashboard`} style={button}>
              Hacer mi primera búsqueda →
            </Button>
          </Section>

          <Text style={subtext}>
            Es gratis. No necesitas tarjeta de crédito.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Si necesitas ayuda para empezar, responde este email.
            <br />— El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ReactivationEmail;

const main: React.CSSProperties = {
  backgroundColor: "#0f0f0f",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "560px",
};

const logo: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#a855f7",
  margin: "0 0 32px",
};

const h1: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 16px",
};

const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#a1a1aa",
  margin: "0 0 16px",
};

const exampleBox: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  padding: "16px 24px",
  margin: "8px 0 24px",
};

const exampleTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 12px",
};

const exampleItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#d4d4d8",
  margin: "0 0 6px",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0 16px",
};

const button: React.CSSProperties = {
  backgroundColor: "#a855f7",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  borderRadius: "8px",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const subtext: React.CSSProperties = {
  fontSize: "13px",
  color: "#52525b",
  textAlign: "center",
  margin: "0 0 32px",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #27272a",
  margin: "32px 0 24px",
};

const footer: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#52525b",
};
