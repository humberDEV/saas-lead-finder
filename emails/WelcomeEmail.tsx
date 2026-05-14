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

interface WelcomeEmailProps {
  name?: string | null;
  appUrl: string;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] ?? "ahí";

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a Huntly — encuentra tu primer cliente hoy</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>Huntly</Heading>

          <Heading style={h1}>Hola, {firstName} 👋</Heading>

          <Text style={text}>
            Ya tienes acceso a Huntly. Buscamos negocios locales sin página web
            para que tú puedas ofrecerles exactamente eso.
          </Text>

          <Text style={text}>
            Tienes <strong>3 búsquedas gratis</strong> para empezar. Así
            funciona:
          </Text>

          <Section style={steps}>
            <Text style={step}>
              <strong>1.</strong> Escribe un nicho — "peluquerías", "fontaneros",
              "restaurantes"
            </Text>
            <Text style={step}>
              <strong>2.</strong> Elige una ciudad
            </Text>
            <Text style={step}>
              <strong>3.</strong> Huntly te da una lista de negocios sin web,
              con puntuación y mensaje de contacto listo para enviar
            </Text>
          </Section>

          <Section style={btnSection}>
            <Button href={`${appUrl}/dashboard`} style={button}>
              Hacer mi primera búsqueda →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Si tienes cualquier duda, responde este email directamente.
            <br />— El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

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

const steps: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "8px 0 24px",
};

const step: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#d4d4d8",
  margin: "0 0 8px",
};

const btnSection: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
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
