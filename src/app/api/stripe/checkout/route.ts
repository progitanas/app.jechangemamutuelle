import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { cloudflareApi } from "@/lib/cloudflare-api";

const checkoutSchema = z.object({
  requestId: z.string().min(1, "requestId requis"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL non configure" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Paiement Stripe non configure" },
      { status: 500 },
    );
  }

  const requestId = parsed.data.requestId;

  type CampaignDto = {
    id: string;
    customer_id: string;
    campaign_name?: string;
    estimated_cost?: number;
    requested_leads?: number;
    max_price_per_lead?: number;
    budget_max?: number;
  };

  let campaign: CampaignDto;
  try {
    const payload = await cloudflareApi<{ campaign: CampaignDto }>(
      `/v1/campaigns/${encodeURIComponent(requestId)}`,
    );
    campaign = payload.campaign;
  } catch {
    return NextResponse.json(
      { error: "Campagne introuvable" },
      { status: 404 },
    );
  }

  if (!campaign || campaign.customer_id !== session.userId) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const rawAmount =
    Number(campaign.estimated_cost || 0) ||
    Number(campaign.requested_leads || 0) *
      Number(campaign.max_price_per_lead || 0) ||
    Number(campaign.budget_max || 0);

  const amountCents = Math.max(100, Math.round(rawAmount * 100));

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/dashboard/demandes?payment=success&requestId=${encodeURIComponent(requestId)}`,
      cancel_url: `${appUrl}/dashboard/demandes?payment=cancel&requestId=${encodeURIComponent(requestId)}`,
      metadata: {
        requestId,
        userId: session.userId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `Campagne ${campaign.campaign_name || requestId}`,
              description: "Paiement de campagne leads",
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      { error: "Impossible de creer la session de paiement" },
      { status: 500 },
    );
  }
}
