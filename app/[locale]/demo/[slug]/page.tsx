import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DemoLanding } from "@/components/demo/DemoLanding";
import { normalizeBusinessData } from "@/lib/demo/normalize";
import { rehydrateDemoTheme } from "@/lib/demo/brand-colors";
import type { Metadata } from "next";

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = await db.demo.findBySlug(params.slug);
  if (!demo) return { title: "Demo no encontrada" };
  const raw = demo.businessData as Record<string, unknown>;
  const data = normalizeBusinessData(raw, demo.template);
  return {
    title: `${data.name} — ${data.cityShort || data.city || "Demo"}`,
    description: data.heroSubtitle,
    openGraph: data.heroImage
      ? { images: [{ url: data.heroImage }] }
      : undefined,
  };
}

export default async function DemoPage({ params }: Props) {
  const demo = await db.demo.findBySlug(params.slug);
  if (!demo) notFound();

  db.demo.incrementViews(params.slug).catch(() => null);

  const normalized = normalizeBusinessData(
    demo.businessData as Record<string, unknown>,
    demo.template
  );
  const data = await rehydrateDemoTheme(normalized);

  return <DemoLanding data={data} />;
}
