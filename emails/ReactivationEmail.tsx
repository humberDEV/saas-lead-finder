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

interface ReactivationEmailProps {
  name?: string | null;
  appUrl: string;
  lastNiche?: string | null;
  lastCity?: string | null;
  tokensLeft?: number;
}

export function ReactivationEmail({ name, appUrl, lastNiche, lastCity, tokensLeft }: ReactivationEmailProps) {
  const firstName = name?.split(" ")[0] ?? null;
  const hasLastSearch = !!(lastNiche && lastCity);
  const remaining = tokensLeft ?? 3;

  return (
    <Html lang="es">
      <Head />
      <Preview>Todavía tienes búsquedas gratis en Huntly</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>
            {firstName ? `Hola ${firstName},` : "Hola,"}
          </Text>

          {hasLastSearch ? (
            <Text style={text}>
              La última vez buscaste "{lastNiche}" en {lastCity}. Todavía
              tienes {remaining} {remaining === 1 ? "búsqueda" : "búsquedas"}{" "}
              gratis esperándote.
            </Text>
          ) : (
            <Text style={text}>
              Te registraste en Huntly hace unos días pero todavía no has
              hecho ninguna búsqueda. Tienes {remaining} búsquedas gratis
              esperándote.
            </Text>
          )}

          <Text style={text}>
            En menos de 2 minutos tienes una lista de negocios sin web con
            contacto directo y mensaje listo para enviar.{" "}
            <Link href={`${appUrl}/dashboard`} style={link}>
              {hasLastSearch ? "Seguir buscando →" : "Hacer mi primera búsqueda →"}
            </Link>
          </Text>

          <Text style={text}>
            Si necesitas ayuda para empezar, responde este email.
          </Text>

          <Text style={signature}>
            — El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ReactivationEmail;

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
