import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fail closed: the old ?key= URL secret is intentionally no longer accepted.
  await requireAdmin();

  return (
    <html lang="en">
      <head>
        <title>Huntly Admin</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#0A0A0A",
          color: "#e2e8f0",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
