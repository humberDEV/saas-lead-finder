import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function date(timestamp: number) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" })
    .format(new Date(timestamp * 1000));
}

export default async function DisputesPage() {
  await requireAdmin();
  const disputes = await stripe.disputes.list({ limit: 50 });
  const ordered = [...disputes.data].sort((a, b) => {
    const actionA = a.status === "needs_response" || a.status === "warning_needs_response" ? 0 : 1;
    const actionB = b.status === "needs_response" || b.status === "warning_needs_response" ? 0 : 1;
    return actionA - actionB || b.created - a.created;
  });

  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
    <Link href="/admin" style={{ color: "#a5b4fc", fontSize: 13 }}>← Admin</Link>
    <h1 style={{ margin: "18px 0 6px", fontSize: 26 }}>Disputas</h1>
    <p style={{ color: "#aab4c0", fontSize: 14, lineHeight: 1.6, maxWidth: 720 }}>
      Expedientes de solo lectura. Responde, acepta o reembolsa desde Stripe después de revisar cada caso.
      Aquí no se guardan datos completos de tarjeta ni se envía evidencia automáticamente.
    </p>
    <div style={{ marginTop: 24, border: "1px solid #3b4147", borderRadius: 8, overflow: "hidden" }}>
      {ordered.length === 0 ? <p style={{ padding: 24, color: "#aab4c0" }}>No hay disputas en Stripe.</p> : ordered.map((dispute) => <Link
        key={dispute.id}
        href={`/admin/disputes/${dispute.id}`}
        style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #2d3743", color: "#f1f5f9", textDecoration: "none", background: "#19212b" }}
      >
        <span style={{ flex: "1 1 240px", minWidth: 0 }}><strong style={{ display: "block", fontSize: 14 }}>{dispute.reason.replaceAll("_", " ")}</strong><small style={{ color: "#aab4c0" }}>{dispute.id}</small></span>
        <span style={{ flex: "0 1 120px", fontSize: 14 }}>{money(dispute.amount, dispute.currency)}</span>
        <span style={{ flex: "0 1 140px", color: dispute.status.includes("needs_response") ? "#fbbf24" : "#aab4c0", fontSize: 13 }}>{dispute.status.replaceAll("_", " ")}</span>
        <span style={{ flex: "0 1 140px", color: "#aab4c0", fontSize: 13 }}>{date(dispute.created)}</span>
      </Link>)}
    </div>
    {disputes.has_more && <p style={{ color: "#aab4c0", fontSize: 13 }}>Se muestran las 50 disputas más recientes. El histórico completo está en Stripe.</p>}
  </main>;
}
