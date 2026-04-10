import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyOrganizationMembers } from "@/lib/notifications";

function isAuthorized(req: Request) {
  const expected = process.env.AUTOMATION_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const now = new Date();

  const stopCandidates = await prisma.request.findMany({
    where: {
      autoStopAtQuota: true,
      status: { in: ["APPROVED", "PAID", "DELIVERED", "SUBMITTED"] },
    },
    select: { id: true, quotaConsumed: true, quotaRequested: true },
  });

  let suspendedCount = 0;
  for (const candidate of stopCandidates) {
    if (candidate.quotaConsumed < candidate.quotaRequested) continue;
    await prisma.request.update({
      where: { id: candidate.id },
      data: { status: "SUSPENDED" },
    });
    suspendedCount += 1;
  }

  const recurring = await prisma.request.findMany({
    where: {
      isRecurring: true,
      recurrenceCadence: { not: "NONE" },
      nextRenewalDate: { lte: now },
    },
    take: 100,
  });

  let generatedRecurring = 0;

  for (const source of recurring) {
    const nextRenewal = new Date(source.nextRenewalDate || now);
    if (source.recurrenceCadence === "WEEKLY") {
      nextRenewal.setDate(nextRenewal.getDate() + 7);
    } else {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }

    await prisma.$transaction([
      prisma.request.create({
        data: {
          userId: source.userId,
          organizationId: source.organizationId,
          createdByUserId: source.createdByUserId,
          campaignName: `${source.campaignName} (renouvellement)`,
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
          nextRenewalDate: source.nextRenewalDate,
          notes: source.notes,
          status: "SUBMITTED",
          estimatedAvailableVolume: source.estimatedAvailableVolume,
          estimatedDaysToQuota: source.estimatedDaysToQuota,
          segmentTensionScore: source.segmentTensionScore,
          feasibilityScore: source.feasibilityScore,
          recommendation: source.recommendation,
          budgetAlert: source.budgetAlert,
          zoneAlert: source.zoneAlert,
          suggestedCriteria: source.suggestedCriteria,
          avgCostPerLead: source.avgCostPerLead,
          budgetLowThreshold: source.budgetLowThreshold,
        },
      }),
      prisma.request.update({
        where: { id: source.id },
        data: { nextRenewalDate: nextRenewal },
      }),
    ]);

    generatedRecurring += 1;

    if (source.organizationId) {
      await notifyOrganizationMembers(source.organizationId, {
        type: "ACTION_REQUIRED",
        title: "Renouvellement automatique",
        message: `Une nouvelle campagne recurrente a ete creee depuis ${source.campaignName}.`,
        requestId: source.id,
      });
    }
  }

  const budgetAlerts = await prisma.request.findMany({
    where: {
      budgetLowAlertSent: false,
      budgetLowThreshold: { not: null },
    },
    take: 200,
  });

  let lowBudgetNotified = 0;

  for (const request of budgetAlerts) {
    if (request.budgetLowThreshold == null) continue;
    const remaining = request.budget - request.totalCost;
    if (remaining > request.budgetLowThreshold) continue;

    if (request.organizationId) {
      await notifyOrganizationMembers(request.organizationId, {
        type: "BUDGET_LOW",
        title: "Budget presque epuise",
        message: `La campagne ${request.campaignName} approche sa limite budgetaire.`,
        requestId: request.id,
      });
      lowBudgetNotified += 1;
    }

    await prisma.request.update({
      where: { id: request.id },
      data: { budgetLowAlertSent: true },
    });
  }

  return NextResponse.json({
    ok: true,
    suspended: suspendedCount,
    generatedRecurring,
    lowBudgetNotified,
  });
}
