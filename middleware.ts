import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/crm(.*)",
  "/api/leads(.*)",
  "/api/credits(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|api/stripe/webhook).*)",
    "/",
    "/(api(?!/stripe/webhook)|trpc)(.*)",
  ],
};
