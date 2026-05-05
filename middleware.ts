import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/crm(.*)",
  "/api/leads(.*)",
  "/api/credits(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();

  // Don't apply intl middleware to API routes or admin
  if (
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/admin")
  ) {
    return;
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|api/stripe/webhook).*)",
    "/",
    "/(api(?!/stripe/webhook)|trpc)(.*)",
  ],
};
