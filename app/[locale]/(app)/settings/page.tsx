"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, LogOut, MessageCircle, ChevronRight,
  Zap, CheckCircle, User, Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "../SidebarContext";

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free:    { label: "Free",    color: "text-zinc-400",   bg: "bg-zinc-800" },
  go:      { label: "Go",      color: "text-indigo-300", bg: "bg-indigo-500/20" },
  pro:     { label: "Pro",     color: "text-violet-300", bg: "bg-violet-500/20" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/60">
        {children}
      </div>
    </motion.div>
  );
}

function Row({
  icon,
  label,
  sub,
  right,
  onClick,
  href,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const inner = (
    <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${
      onClick || href
        ? danger
          ? "hover:bg-red-500/8 cursor-pointer"
          : "hover:bg-white/[0.03] cursor-pointer"
        : ""
    }`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? "bg-red-500/15" : "bg-white/5"
      }`}>
        <span className={danger ? "text-red-400" : "text-zinc-400"}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      {right ?? (onClick || href ? <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" /> : null)}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return inner;
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { plan, credits } = useSidebar();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.username ?? "Usuario";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const handleManagePlan = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0A0A0A]">
      <main className="max-w-lg mx-auto p-6 md:p-10 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">Configuración</h1>
          <p className="text-zinc-500 text-sm mt-1">Gestiona tu cuenta, plan y preferencias.</p>
        </motion.div>

        {/* Account */}
        <Section title="Cuenta">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full ring-2 ring-white/10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center ring-2 ring-white/10">
                  <span className="text-sm font-black text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{email}</p>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${planMeta.bg} ${planMeta.color}`}>
              {planMeta.label}
            </span>
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan">
          {plan === "free" ? (
            <>
              <Row
                icon={<Zap className="w-4 h-4" />}
                label="Actualizar a Go"
                sub="100 búsquedas/mes · $9"
                href="/pricing"
              />
              <Row
                icon={<CheckCircle className="w-4 h-4" />}
                label="Ver todos los planes"
                sub="Compara Go y Pro"
                href="/pricing"
              />
            </>
          ) : (
            <Row
              icon={<CreditCard className="w-4 h-4" />}
              label={loadingPortal ? "Abriendo portal..." : "Gestionar plan"}
              sub={`Plan ${planMeta.label} · ${credits ?? "—"} búsquedas restantes`}
              onClick={handleManagePlan}
              right={
                loadingPortal ? (
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                ) : undefined
              }
            />
          )}
        </Section>

        {/* Soporte */}
        <Section title="Soporte">
          <Row
            icon={<MessageCircle className="w-4 h-4" />}
            label="Enviar feedback"
            sub="Cuéntanos qué mejorarías"
            href="mailto:huntly@outlook.com?subject=Feedback%20Huntly"
          />
          <Row
            icon={<Shield className="w-4 h-4" />}
            label="Política de privacidad"
            sub="Cómo gestionamos tus datos"
            href="mailto:huntly@outlook.com?subject=Privacidad"
          />
        </Section>

        {/* Sesión */}
        <Section title="Sesión">
          <Row
            icon={<User className="w-4 h-4" />}
            label="Cuenta conectada"
            sub={email}
            right={<span className="text-xs text-zinc-600">Clerk</span>}
          />
          <Row
            icon={<LogOut className="w-4 h-4" />}
            label={signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            sub="Salir de Huntly"
            onClick={handleSignOut}
            danger
            right={
              signingOut ? (
                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" />
              ) : undefined
            }
          />
        </Section>

        <p className="text-center text-xs text-zinc-700 mt-8">Huntly · tryhuntly.com</p>

      </main>
    </div>
  );
}
