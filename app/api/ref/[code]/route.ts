import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.trim().toUpperCase();
  const origin = new URL(request.url).origin;
  const home = new URL(`/${routing.defaultLocale}`, origin);

  if (!code) {
    return NextResponse.redirect(home);
  }

  const referrer = await db.user.findByReferralCode(code).catch(() => null);
  if (!referrer) {
    return NextResponse.redirect(home);
  }

  const cookieStore = await cookies();
  cookieStore.set("huntly_ref", code, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.redirect(home);
}
