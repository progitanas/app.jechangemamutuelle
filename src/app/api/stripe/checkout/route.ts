import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { requestId } = await req.json();

  const request = await prisma.request.findFirst({
    where: { id: requestId, userId: session.userId },
  });

  if (!request) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
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

  const amount = 4900;
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/commandes?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/demandes?payment=cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: {
            name: `Demande mutuelle - ${request.needType}`,
            description: "Traitement prioritaire et livraison des leads",
          },
        },
      },
    ],
    metadata: {
      userId: session.userId,
      requestId: request.id,
    },
  });

  await prisma.order.upsert({
    where: { requestId: request.id },
    create: {
      userId: session.userId,
      requestId: request.id,
      stripeSessionId: checkout.id,
      amount,
      paymentStatus: "PENDING",
    },
    update: {
      stripeSessionId: checkout.id,
      amount,
      paymentStatus: "PENDING",
    },
  });

  return NextResponse.json({ url: checkout.url });
}
