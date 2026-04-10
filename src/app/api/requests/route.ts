import { NextResponse } from "next/server";
import { requestSchema } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const created = await cloudflareApi<{
      ok: boolean;
      id: string;
      feasibilityScore: number;
      estimatedCost: number;
    }>("/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({
        customerId: session.userId,
        campaignName: parsed.data.campaignName,
        needType: parsed.data.needType,
        requestedLeads: parsed.data.requestedLeads,
        geoArea: parsed.data.geoArea,
        targetSegment: parsed.data.targetSegment,
        qualityLevel: parsed.data.qualityLevel,
        isExclusive: parsed.data.isExclusive,
        budgetMax: parsed.data.budget,
        maxPricePerLead: parsed.data.maxPricePerLead,
        quotaRequested: parsed.data.quotaRequested,
      }),
    });

    return NextResponse.json({ ok: true, requestId: created.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Creation impossible" },
      { status: 400 },
    );
  }
}
