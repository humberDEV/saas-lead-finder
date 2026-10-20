import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function date(value: number | string | null | undefined) {
  if (!value) return "—";
  const time = typeof value === "number" ? value * 1000 : Date.parse(value);
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(time);
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function detail(event: string, raw: unknown) {
  const props = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  if (event === "search_completed") {
    return `${String(props.niche ?? "Búsqueda")} · ${String(props.city ?? "")} · ${String(props.resultCount ?? "?")} resultados`;
  }
  if (event === "checkout_started" || event === "checkout_completed") {
    return `Plan ${String(props.planKey ?? "?")} · sesión ${String(props.checkoutSessionId ?? "—")}`;
  }
  if (event === "payment_recovered" || event === "payment_receipt_email_sent") {
    return `Factura ${String(props.invoiceId ?? "—")}`;
  }
  if (event === "subscription_started" || event === "subscription_cancelled") {
    return `Plan ${String(props.planKey ?? props.previousPlan ?? "—")}`;
  }
  return "";
}

const labelStyle = { display: "block", marginBottom: 4, color: "#9eabb9", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".07em" };
const boxStyle = { border: "1px solid #3b4147", borderRadius: 8, background: "#19212b", padding: 18 };

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  if (!/^du_[A-Za-z0-9]+$/.test(params.id)) notFound();

  const dispute = await stripe.disputes.retrieve(params.id);
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
  const charge = await stripe.charges.retrieve(chargeId);
  const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
  const user = customerId ? await db.user.findByStripeCustomerId(customerId) : null;
  const from = new Date((charge.created - 30 * 86400) * 1000).toISOString();

  const [eventsResult, searchesResult] = user ? await Promise.all([
    supabase.from("product_events")
      .select("event,properties,created_at")
      .eq("user_id", user.id)
      .gte("created_at", from)
      .order("created_at", { ascending: false })
      .limit(250),
    supabase.from("search_history")
      .select("niche,city,result_count,created_at")
      .eq("user_id", user.id)
      .gte("created_at", from)
      .order("created_at", { ascending: false })
      .limit(100),
  ]) : [null, null];

  const card = charge.payment_method_details?.card;
  const dashboardUrl = `https://dashboard.stripe.com/${dispute.livemode ? "" : "test/"}disputes/${dispute.id}`;
  const events = eventsResult?.data ?? [];
  const searches = searchesResult?.data ?? [];

  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", lineHeight: 1.5 }}>
    <Link href="/admin/disputes" style={{ color: "#a5b4fc", fontSize: 13 }}>← Disputas</Link>
    <h1 style={{ margin: "18px 0 4px", fontSize: 26 }}>Expediente de disputa</h1>
    <p style={{ marginTop: 0, color: "#9eabb9", fontSize: 13 }}>{dispute.id} · Información de solo lectura</p>
    <p style={{ color: "#d7dee7", fontSize: 14, maxWidth: 850 }}>
      Comprueba el motivo y la fecha límite; contacta al cliente cuando corresponda. Adjunta únicamente evidencia relevante y veraz desde Stripe.
      Este expediente no decide ni envía la respuesta por ti.
    </p>
    <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", margin: "4px 0 24px", padding: "10px 14px", borderRadius: 5, background: "#a78bfa", color: "#0d131a", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Abrir disputa en Stripe ↗</a>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
      <section style={boxStyle}><span style={labelStyle}>Estado / motivo</span><strong>{dispute.status.replaceAll("_", " ")}</strong><div style={{ color: "#bbc5d1", fontSize: 13 }}>{dispute.reason.replaceAll("_", " ")}</div></section>
      <section style={boxStyle}><span style={labelStyle}>Importe</span><strong>{money(dispute.amount, dispute.currency)}</strong><div style={{ color: "#bbc5d1", fontSize: 13 }}>Cargo {charge.id}</div></section>
      <section style={boxStyle}><span style={labelStyle}>Fecha límite de respuesta</span><strong>{date(dispute.evidence_details?.due_by)}</strong><div style={{ color: "#bbc5d1", fontSize: 13 }}>Abierta {date(dispute.created)}</div></section>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12, marginTop: 12 }}>
      <section style={boxStyle}>
        <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>Pago en Stripe</h2>
        <p style={{ margin: "6px 0" }}><span style={labelStyle}>Cliente</span>{charge.billing_details.name || user?.name || "—"} · {charge.billing_details.email || user?.email || "—"}</p>
        <p style={{ margin: "6px 0" }}><span style={labelStyle}>Cuenta de Stripe</span>{customerId || "—"}</p>
        <p style={{ margin: "6px 0" }}><span style={labelStyle}>Cargo</span>{date(charge.created)} · {charge.status}</p>
        <p style={{ margin: "6px 0" }}><span style={labelStyle}>Tarjeta</span>{card ? `${card.brand} ···· ${card.last4}` : "No disponible"}</p>
        <p style={{ margin: "6px 0" }}><span style={labelStyle}>3D Secure / riesgo</span>{card?.three_d_secure?.result || "Sin dato"} · {charge.outcome?.risk_level || "Sin dato"}</p>
        {charge.receipt_url && <a href={charge.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc", fontSize: 13 }}>Ver recibo de Stripe ↗</a>}
      </section>
      <section style={boxStyle}>
        <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>Cuenta de Huntly</h2>
        {user ? <>
          <p style={{ margin: "6px 0" }}><span style={labelStyle}>Cuenta / correo</span>{user.clerkId} · {user.email || "—"}</p>
          <p style={{ margin: "6px 0" }}><span style={labelStyle}>Plan actual</span>{user.plan}</p>
          <p style={{ margin: "6px 0" }}><span style={labelStyle}>Suscripción</span>{user.stripeSubscriptionId || "—"}</p>
          <p style={{ margin: "6px 0" }}><span style={labelStyle}>Búsquedas acumuladas</span>{user.searchesCount ?? "—"}</p>
        </> : <p style={{ color: "#fbbf24", fontSize: 13 }}>No se encontró una cuenta de Huntly para este cliente de Stripe. Verifica la vinculación antes de responder.</p>}
      </section>
    </div>

    <section style={{ ...boxStyle, marginTop: 12 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>Actividad del producto</h2>
      <p style={{ color: "#9eabb9", fontSize: 12 }}>Desde {date(from)} (30 días antes del cargo). Los registros prueban uso de la cuenta, no por sí solos la autorización de la tarjeta.</p>
      {eventsResult?.error && <p style={{ color: "#fbbf24" }}>No se pudieron consultar los eventos de uso.</p>}
      {!eventsResult?.error && events.length === 0 && <p style={{ color: "#9eabb9" }}>Sin eventos registrados en este intervalo.</p>}
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}><thead><tr><th style={{ padding: 8 }}>Fecha</th><th style={{ padding: 8 }}>Evento</th><th style={{ padding: 8 }}>Detalle</th></tr></thead><tbody>{events.map((event, index) => <tr key={`${event.created_at}-${index}`} style={{ borderTop: "1px solid #2d3743" }}><td style={{ padding: 8, whiteSpace: "nowrap" }}>{date(event.created_at)}</td><td style={{ padding: 8, whiteSpace: "nowrap" }}>{event.event}</td><td style={{ padding: 8, color: "#bbc5d1" }}>{detail(event.event, event.properties)}</td></tr>)}</tbody></table></div>
      {events.length === 250 && <p style={{ color: "#fbbf24", fontSize: 12 }}>Solo se muestran los 250 eventos más recientes del intervalo.</p>}
    </section>

    <section style={{ ...boxStyle, marginTop: 12 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>Búsquedas registradas</h2>
      <p style={{ color: "#9eabb9", fontSize: 12 }}>El historial muestra uso del servicio; no incluye los datos de los leads ni información de tarjeta.</p>
      {searchesResult?.error && <p style={{ color: "#fbbf24" }}>No se pudo consultar el historial.</p>}
      {!searchesResult?.error && searches.length === 0 && <p style={{ color: "#9eabb9" }}>Sin búsquedas registradas en este intervalo.</p>}
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}><thead><tr><th style={{ padding: 8 }}>Fecha</th><th style={{ padding: 8 }}>Búsqueda</th><th style={{ padding: 8 }}>Resultados</th></tr></thead><tbody>{searches.map((row, index) => <tr key={`${row.created_at}-${index}`} style={{ borderTop: "1px solid #2d3743" }}><td style={{ padding: 8, whiteSpace: "nowrap" }}>{date(row.created_at)}</td><td style={{ padding: 8 }}>{row.niche} · {row.city}</td><td style={{ padding: 8 }}>{row.result_count}</td></tr>)}</tbody></table></div>
      {searches.length === 100 && <p style={{ color: "#fbbf24", fontSize: 12 }}>Solo se muestran las 100 búsquedas más recientes del intervalo.</p>}
    </section>
  </main>;
}
