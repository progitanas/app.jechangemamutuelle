import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const source = await prisma.request.findFirst({
    where: { id, userId: session.userId },
  });

  if (!source) {
    return NextResponse.json(
      { error: "Campagne introuvable" },
      { status: 404 },
    );
  }

  const duplicated = await prisma.request.create({
    data: {
      userId: source.userId,
      campaignName: `${source.campaignName} (copie)`,
      needType: source.needType,
      requestedLeads: source.requestedLeads,
      age: source.age,
      situation: source.situation,
      coverageLevel: source.coverageLevel,
      geoArea: source.geoArea,
      targetSegment: source.targetSegment,
      qualityLevel: source.qualityLevel,
      isExclusive: source.isExclusive,
      startDate: source.startDate,
      campaignDurationDays: source.campaignDurationDays,
      budget: source.budget,
      maxPricePerLead: source.maxPricePerLead,
      volumeCadence: source.volumeCadence,
      volumePerCadence: source.volumePerCadence,
      targetAgeMin: source.targetAgeMin,
      targetAgeMax: source.targetAgeMax,
      familySituation: source.familySituation,
      professionalStatus: source.professionalStatus,
      incomeLevel: source.incomeLevel,
      currentContractType: source.currentContractType,
      contractExpiryDate: source.contractExpiryDate,
      immediateNeed: source.immediateNeed,
      preferredContactChannel: source.preferredContactChannel,
      phoneRequired: source.phoneRequired,
      emailRequired: source.emailRequired,
      alreadyInsured: source.alreadyInsured,
      customerType: source.customerType,
      deliveryCadence: source.deliveryCadence,
      deliveryByEmail: source.deliveryByEmail,
      deliveryByWebhook: source.deliveryByWebhook,
      deliveryByApi: source.deliveryByApi,
      deliveryByCsv: source.deliveryByCsv,
      deliveryToCrm: source.deliveryToCrm,
      instantNotifications: source.instantNotifications,
      autoPauseOnQuota: source.autoPauseOnQuota,
      deliveryHours: source.deliveryHours,
      quotaRequested: source.quotaRequested,
      quotaConsumed: 0,
      dailyLimit: source.dailyLimit,
      monthlyLimit: source.monthlyLimit,
      autoStopAtQuota: source.autoStopAtQuota,
      autoResumeOnRecharge: source.autoResumeOnRecharge,
      rolloverUnusedQuota: source.rolloverUnusedQuota,
      isTemplate: source.isTemplate,
      templateName: source.templateName,
      sourceRequestId: source.id,
      isRecurring: source.isRecurring,
      recurrenceCadence: source.recurrenceCadence,
      notes: source.notes,
      status: "DRAFT",
      estimatedAvailableVolume: source.estimatedAvailableVolume,
      estimatedDaysToQuota: source.estimatedDaysToQuota,
      segmentTensionScore: source.segmentTensionScore,
      feasibilityScore: source.feasibilityScore,
      recommendation: source.recommendation,
      budgetAlert: source.budgetAlert,
      zoneAlert: source.zoneAlert,
      suggestedCriteria: source.suggestedCriteria,
      avgCostPerLead: source.avgCostPerLead,
      walletCredit: source.walletCredit,
      autoRechargeEnabled: source.autoRechargeEnabled,
      budgetLowThreshold: source.budgetLowThreshold,
    },
  });

  return NextResponse.json({ ok: true, requestId: duplicated.id });
}
