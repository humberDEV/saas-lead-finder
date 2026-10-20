import "server-only";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

/** Admin access is tied to an authenticated Clerk identity, never a URL secret. */
export async function requireAdmin() {
  const { userId } = await auth();
  const allowedIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!userId || !allowedIds.includes(userId)) notFound();
  return userId;
}
