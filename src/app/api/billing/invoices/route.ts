import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireOrganizationRole,
  getPrimaryMembership,
} from "@/lib/organization";

export async function GET() {
  try {
    const { membership } = await requireOrganizationRole([
      "OWNER",
      "MANAGER",
      "BUYER",
    ]);
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: membership.organizationId },
      include: { items: true },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      take: 24,
    });

    return NextResponse.json({ ok: true, invoices });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}

export async function POST() {
  try {
    const { user } = await requireOrganizationRole(["OWNER", "MANAGER"]);
    const membership = await getPrimaryMembership(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Aucune organisation" },
        { status: 400 },
      );
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const requests = await prisma.request.findMany({
      where: {
        organizationId: membership.organizationId,
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      select: { id: true, leadsDelivered: true, avgCostPerLead: true },
    });

    const invoice = await prisma.invoice.upsert({
      where: {
        organizationId_periodMonth_periodYear: {
          organizationId: membership.organizationId,
          periodMonth: month,
          periodYear: year,
        },
      },
      create: {
        organizationId: membership.organizationId,
        periodMonth: month,
        periodYear: year,
        status: "ISSUED",
        issuedAt: now,
      },
      update: {
        status: "ISSUED",
        issuedAt: now,
      },
    });

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });

    let total = 0;
    for (const request of requests) {
      const amount = request.leadsDelivered * request.avgCostPerLead;
      total += amount;
      if (amount <= 0) continue;
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          requestId: request.id,
          amount,
          quantity: request.leadsDelivered,
          unitPrice: request.avgCostPerLead,
        },
      });
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { totalAmount: total },
    });

    return NextResponse.json({
      ok: true,
      invoiceId: invoice.id,
      totalAmount: total,
    });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
