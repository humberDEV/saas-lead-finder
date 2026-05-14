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

interface LimitReachedEmailProps {
  name?: string | null;
  appUrl: string;
  /** Totals accumulated across all free searches */
  noWebsite?: number;
  contactable?: number;
}

export function LimitReachedEmail({ name, appUrl, noWebsite, contactable }: LimitReachedEmailProps) {
  const firstName = name?.split(" ")[0] ?? "ahí";

  return (
    <Html lang="es">
      <Head />
      <Preview>Agotaste tus búsquedas gratis — desbloquea más ahora</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>Huntly</Heading>

          <Heading style={h1}>
            {firstName}, agotaste tus búsquedas 🎯
          </Heading>

          <Text style={text}>
            Has usado las 3 búsquedas del plan gratuito. Eso significa que ya
            sabes que Huntly funciona.
          </Text>

          <Text style={text}>
            Para seguir encontrando clientes, elige el plan que mejor encaje:
          </Text>

          <Section style={plansBox}>
            <Section style={planRow}>
              <Text style={planName}>Go — $9/mes</Text>
              <Text style={planDesc}>100 búsquedas al mes. Para empezar a escalar.</Text>
            </Section>
            <Hr style={planDivider} />
            <Section style={planRow}>
              <Text style={planName}>Pro — $19/mes</Text>
              <Text style={planDesc}>250 búsquedas al mes. Para agencias y freelancers en serio.</Text>
            </Section>
          </Section>

          <Section style={btnSection}>
            <Button href={`${appUrl}/pricing`} style={button}>
              Ver planes y desbloquear →
            </Button>
          </Section>

          {noWebsite && contactable ? (
            <Text style={callout}>
              💡 En tus 3 búsquedas encontraste{" "}
              <strong>{noWebsite} negocios sin web</strong> y{" "}
              <strong>{contactable} leads contactables</strong>. Con un plan de
              100 búsquedas eso se multiplica por 33 — un solo cliente de esos
              cubre el plan Go de sobra.
            </Text>
          ) : (
            <Text style={callout}>
              💡 Con 100 búsquedas al mes tienes potencial para contactar miles
              de negocios. Un solo cliente cierra el plan entero.
            </Text>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Responde este email si tienes alguna pregunta antes de actualizar.
            <br />— El equipo de Huntly
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LimitReachedEmail;

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

const plansBox: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  padding: "8px 24px",
  margin: "8px 0 24px",
};

const planRow: React.CSSProperties = {
  padding: "12px 0",
};

const planName: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 4px",
};

const planDesc: React.CSSProperties = {
  fontSize: "14px",
  color: "#71717a",
  margin: 0,
};

const planDivider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #27272a",
  margin: "4px 0",
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

const callout: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#a1a1aa",
  backgroundColor: "#18181b",
  borderLeft: "3px solid #a855f7",
  borderRadius: "0 8px 8px 0",
  padding: "12px 16px",
  margin: "0 0 24px",
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
