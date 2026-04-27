import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Huntly - Encuentra negocios sin web | Prospección local automática",
  description:
    "Encuentra negocios locales sin página web en 2 minutos. Exporta leads con teléfono directo. Ideal para agencias web. Prueba gratis.",
  keywords:
    "prospección negocios, leads locales, negocios sin web, agencia web, google maps leads, España",
  openGraph: {
    title: "Huntly - Encuentra negocios sin web",
    description: "Prospección local en 2 minutos. 3 búsquedas gratis.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      <html lang="es">
        <body className={`${inter.className} min-h-screen bg-[#0A0A0A] text-slate-100 selection:bg-indigo-500/30`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
