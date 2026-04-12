import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cloudflareApi } from "@/lib/cloudflare-api";

type CampaignDto = {
  id: string;
  customer_id: string;
  status?: string;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payload = await cloudflareApi<{ campaign: CampaignDto }>(
      `/v1/campaigns/${encodeURIComponent(id)}`,
    );

    if (!payload.campaign || payload.campaign.customer_id !== session.userId) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    return NextResponse.json({
      ok: true,
      requestId: payload.campaign.id,
      status: String(payload.campaign.status || "SUBMITTED"),
    });
  } catch {
    return NextResponse.json(
      { error: "Campagne introuvable" },
      { status: 404 },
    );
  }
}