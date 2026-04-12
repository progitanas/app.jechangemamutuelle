import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  let stripe;

  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Paiement Stripe non configure" },
      { status: 500 },
    );
  }

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook non configure" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const requestId = session.metadata?.requestId;

    if (requestId) {
      await cloudflareApi(
        `/v1/campaigns/${encodeURIComponent(requestId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "PAID" }),
        },
      ).catch(() => null);
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
