import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/tokens";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const user = await getOrCreateUser(userId);
    if (user.plan === "free") return NextResponse.json([]);
    const leads = await db.savedLead.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const {
      name, address, phone, score, status, notes,
      website, hasWebsite, hasWhatsapp, rating, reviewCount,
      suggestedMessage, temperature, scoreLabel,
    } = body;

    const user = await getOrCreateUser(userId);
    if (user.plan === "free") {
      return NextResponse.json({ error: "Necesitas un plan de pago para guardar leads." }, { status: 403 });
    }
    const lead = await db.savedLead.create({
      data: {
        userId: user.id,
        name,
        address,
        phone,
        score,
        status: status || "PENDIENTE",
        notes,
        website,
        hasWebsite,
        hasWhatsapp,
        rating,
        reviewCount,
        suggestedMessage,
        temperature,
        scoreLabel,
      },
    });

    return NextResponse.json(lead);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { leadId, status, notes } = body;

    const lead = await db.savedLead.update({
      where: { id: leadId },
      data: { status, notes },
    });

    return NextResponse.json(lead);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
