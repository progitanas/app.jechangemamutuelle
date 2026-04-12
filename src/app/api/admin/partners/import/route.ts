import { NextResponse } from "next/server";
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

  return NextResponse.json(
    {
      error: "Import partenaires temporairement indisponible",
      parsedRows: rows.length,
    },
    { status: 501 },
  );
}
