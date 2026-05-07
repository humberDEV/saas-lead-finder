"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const VALID_PLANS = ["go", "pro"];

export default function CheckoutRedirectPage() {
  const params = useParams();
  const plan = params.plan as string;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!VALID_PLANS.includes(plan)) {
      setError(true);
      return;
    }
    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey: plan }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.url) window.location.href = data.url;
        else setError(true);
      })
      .catch(() => setError(true));
  }, [plan]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-3">No se pudo iniciar el pago.</p>
          <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
            Ver planes →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-[#0A0A0A]">
      <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
      <p className="text-zinc-400 text-sm">Preparando tu checkout…</p>
    </div>
  );
}
