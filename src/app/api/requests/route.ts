import { NextResponse } from "next/server";
import { requestSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPrimaryMembership } from "@/lib/organization";
import { notifyOrganizationMembers } from "@/lib/notifications";

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

  const membership = await getPrimaryMembership(session.userId);

  const created = await prisma.request.create({
    data: {
      userId: session.userId,
      organizationId: membership?.organizationId || null,
      createdByUserId: session.userId,
      campaignName: parsed.data.campaignName,
      needType: parsed.data.needType,
      requestedLeads: parsed.data.requestedLeads,
      age: parsed.data.age,
      situation: parsed.data.situation,
      coverageLevel: parsed.data.coverageLevel,
      geoArea: parsed.data.geoArea,
      targetSegment: parsed.data.targetSegment,
      qualityLevel: parsed.data.qualityLevel,
      isExclusive: parsed.data.isExclusive,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      campaignDurationDays: parsed.data.campaignDurationDays,
      budget: parsed.data.budget,
      maxPricePerLead: parsed.data.maxPricePerLead,
      volumeCadence: parsed.data.volumeCadence,
      volumePerCadence: parsed.data.volumePerCadence,
      targetAgeMin: parsed.data.targetAgeMin,
      targetAgeMax: parsed.data.targetAgeMax,
      familySituation: parsed.data.familySituation || null,
      professionalStatus: parsed.data.professionalStatus || null,
      incomeLevel: parsed.data.incomeLevel || null,
      currentContractType: parsed.data.currentContractType || null,
      contractExpiryDate: parsed.data.contractExpiryDate
        ? new Date(parsed.data.contractExpiryDate)
        : null,
      immediateNeed: parsed.data.immediateNeed,
      preferredContactChannel: parsed.data.preferredContactChannel || null,
      phoneRequired: parsed.data.phoneRequired,
      emailRequired: parsed.data.emailRequired,
      alreadyInsured: parsed.data.alreadyInsured,
      customerType: parsed.data.customerType || null,
      deliveryCadence: parsed.data.deliveryCadence,
      deliveryByEmail: parsed.data.deliveryByEmail,
      deliveryByWebhook: parsed.data.deliveryByWebhook,
      deliveryByApi: parsed.data.deliveryByApi,
      deliveryByCsv: parsed.data.deliveryByCsv,
      deliveryToCrm: parsed.data.deliveryToCrm,
      instantNotifications: parsed.data.instantNotifications,
      autoPauseOnQuota: parsed.data.autoPauseOnQuota,
      deliveryHours: parsed.data.deliveryHours || null,
      quotaRequested: parsed.data.quotaRequested,
      dailyLimit: parsed.data.dailyLimit || null,
      monthlyLimit: parsed.data.monthlyLimit || null,
      autoStopAtQuota: parsed.data.autoStopAtQuota,
      autoResumeOnRecharge: parsed.data.autoResumeOnRecharge,
      rolloverUnusedQuota: parsed.data.rolloverUnusedQuota,
      isTemplate: parsed.data.isTemplate,
      templateName: parsed.data.templateName || null,
      isRecurring: parsed.data.isRecurring,
      recurrenceCadence: parsed.data.recurrenceCadence,
      notes: parsed.data.notes || null,
      status: "SUBMITTED",
      estimatedAvailableVolume: Math.max(
        parsed.data.requestedLeads,
        Math.floor(parsed.data.quotaRequested * 1.2),
      ),
      estimatedDaysToQuota: Math.max(
        1,
        Math.ceil(
          parsed.data.quotaRequested /
            Math.max(1, parsed.data.volumePerCadence),
        ),
      ),
      segmentTensionScore: parsed.data.isExclusive ? 70 : 45,
      feasibilityScore: Math.max(
        20,
        Math.min(
          98,
          Math.round(
            (parsed.data.budget /
              Math.max(
                1,
                parsed.data.maxPricePerLead * parsed.data.requestedLeads,
              )) *
              100,
          ),
        ),
      ),
      recommendation:
        parsed.data.isExclusive && parsed.data.maxPricePerLead < 20
          ? "Elargir la zone ou augmenter le prix max par lead pour accelerer la livraison"
          : "Parametrage coherent pour un lancement rapide",
      budgetAlert:
        parsed.data.budget <
        parsed.data.requestedLeads * parsed.data.maxPricePerLead,
      zoneAlert: parsed.data.geoArea.trim().length < 4,
      avgCostPerLead: parsed.data.maxPricePerLead,
      budgetLowThreshold: Math.floor(parsed.data.budget * 0.15),
    },
  });

  if (membership?.organizationId) {
    await notifyOrganizationMembers(membership.organizationId, {
      type: "ACTION_REQUIRED",
      title: "Nouvelle campagne soumise",
      message: `La campagne ${created.campaignName} attend validation.`,
      requestId: created.id,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organizationId: membership.organizationId,
        action: "CAMPAIGN_CREATED",
        targetType: "REQUEST",
        targetId: created.id,
        details: `Campaign ${created.campaignName}`,
      },
    });
  }

  return NextResponse.json({ ok: true, requestId: created.id });
}
