import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows production checks while a local dev server uses the default .next.
  distDir: process.env.HUNTLY_NEXT_DIST_DIR ?? ".next",
};

export default withNextIntl(nextConfig);
