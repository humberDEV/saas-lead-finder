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

interface LimitReachedEmailProps {
  name?: string | null;
  appUrl: string;
  noWebsite?: number;
  contactable?: number;
}

export function LimitReachedEmail({ name, appUrl, noWebsite, contactable }: LimitReachedEmailProps) {
  const firstName = name?.split(" ")[0] ?? null;

  return (
    <Html lang="es">
      <Head />
      <Preview>Agotaste tus búsquedas gratis en Huntly</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>
            {firstName ? `Hola ${firstName},` : "Hola,"}
          </Text>

          <Text style={text}>
            Agotaste las 3 búsquedas del plan gratuito. Eso significa que ya
            sabes que Huntly funciona.
          </Text>

          {noWebsite && contactable ? (
            <Text style={text}>
              En esas búsquedas encontraste {noWebsite} negocios sin web y{" "}
              {contactable} leads con contacto directo. Un solo cliente de esos
              cubre el plan de sobra.
            </Text>
          ) : null}

          <Text style={text}>
            Para seguir, el plan Go son $9/mes y te da 100 búsquedas. El Pro
            son $19/mes con 250.{" "}
            <Link href={`${appUrl}/pricing`} style={link}>
              Ver planes →
            </Link>
          </Text>

          <Text style={text}>
            Si tienes alguna pregunta antes de decidir, responde este email.
          </Text>

          <Text style={signature}>
            — El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LimitReachedEmail;

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
