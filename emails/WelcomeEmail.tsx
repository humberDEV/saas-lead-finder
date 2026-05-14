import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name?: string | null;
  appUrl: string;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] ?? null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a Huntly — haz tu primera búsqueda</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>
            {firstName ? `Hola ${firstName},` : "Hola,"}
          </Text>

          <Text style={text}>
            Ya tienes acceso a Huntly. Buscamos negocios locales sin página web
            para que puedas ofrecerles exactamente eso.
          </Text>

          <Text style={text}>
            Tienes 3 búsquedas gratis para empezar. Solo escribe un nicho
            (peluquerías, fontaneros, restaurantes...), elige una ciudad, y
            Huntly te da una lista de negocios sin web con su contacto y un
            mensaje listo para enviar.
          </Text>

          <Text style={text}>
            <Link href={`${appUrl}/dashboard`} style={link}>
              Haz tu primera búsqueda →
            </Link>
          </Text>

          <Text style={text}>
            Si tienes alguna duda, responde este email directamente.
          </Text>

          <Text style={signature}>
            — El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

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

const link: React.CSSProperties = {
  color: "#1a1a1a",
  textDecoration: "underline",
};

const signature: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "28px",
  color: "#555555",
  margin: "32px 0 0",
};
