import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { partnerCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const partners = await prisma.partner.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ partners });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = partnerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const created = await prisma.partner.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      deliveryWebhookUrl: parsed.data.deliveryWebhookUrl || null,
      apiEndpoint: parsed.data.apiEndpoint || null,
      apiKey: parsed.data.apiKey || null,
      csvEmail: parsed.data.csvEmail || null,
      crmWebhookUrl: parsed.data.crmWebhookUrl || null,
      isActive: true,
    },
  });

  return NextResponse.json({ partner: created }, { status: 201 });
}
