import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { partnerImportSchema } from "@/lib/schemas";

type ParsedRow = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
};

function parseRows(raw: string): ParsedRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: ParsedRow[] = [];
  for (const line of lines) {
    const separator = line.includes(";") ? ";" : ",";
    const parts = line.split(separator).map((part) => part.trim());
    if (parts.length < 2) continue;

    rows.push({
      name: parts[0],
      email: parts[1],
      phone: parts[2] || undefined,
      city: parts[3] || undefined,
    });
  }

  return rows;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = partnerImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const rows = parseRows(parsed.data.rows);
  if (!rows.length) {
    return NextResponse.json(
      { error: "Aucune ligne valide a importer" },
      { status: 400 },
    );
  }

  let imported = 0;
  for (const row of rows) {
    await prisma.partner.upsert({
      where: { email: row.email },
      update: {
        name: row.name,
        phone: row.phone || null,
        city: row.city || null,
        isActive: true,
      },
      create: {
        name: row.name,
        email: row.email,
        phone: row.phone || null,
        city: row.city || null,
        isActive: true,
      },
    });
    imported += 1;
  }

  return NextResponse.json({ imported });
}

