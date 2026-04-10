import Link from "next/link";
import { RequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RequestDuplicateButton } from "@/components/ui/request-duplicate-button";

function statusTone(status: string) {
  if (status === "PAID" || status === "DELIVERED") return "emerald" as const;
  if (status === "APPROVED" || status === "SUBMITTED") return "blue" as const;
  if (status === "IN_REVIEW") return "blue" as const;
  if (status === "REJECTED") return "red" as const;
  if (status === "CANCELLED") return "red" as const;
  return "amber" as const;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { status, q = "" } = await searchParams;
  const parsedStatus = Object.values(RequestStatus).includes(
    status as RequestStatus,
  )
    ? (status as RequestStatus)
    : undefined;

  const requests = await prisma.request.findMany({
    where: {
      userId: user.id,
      ...(parsedStatus ? { status: parsedStatus } : {}),
      ...(q
        ? {
            OR: [
              { needType: { contains: q } },
              { campaignName: { contains: q } },
            ],
          }
        : {}),
    },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Mes campagnes
          </h1>
          <p className="text-sm text-slate-500">
            Creez et suivez vos campagnes de leads B2B.
          </p>
        </div>
        <Link
          href="/dashboard/demandes/new"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Nouvelle campagne
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par type de besoin"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.values(RequestStatus).map((currentStatus) => (
            <option key={currentStatus} value={currentStatus}>
              {currentStatus}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/dashboard/demandes"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Réinitialiser
        </Link>
      </form>

      {requests.length === 0 ? (
        <EmptyState
          title="Aucune demande pour le moment"
          description="Creez votre première demande pour lancer le matching."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Campagne</th>
                  <th className="py-3 pr-4">Quota</th>
                  <th className="py-3 pr-4">Budget</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 pr-4">Paiement</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-700">
                      <p>{req.campaignName}</p>
                      <p className="text-xs text-slate-500">{req.needType}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      <p>
                        {req.quotaConsumed}/{req.quotaRequested}
                      </p>
                      <p className="text-xs text-slate-500">
                        Restant{" "}
                        {Math.max(0, req.quotaRequested - req.quotaConsumed)}
                      </p>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (req.quotaConsumed /
                                  Math.max(1, req.quotaRequested)) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      <p>{req.budget} EUR max</p>
                      <p className="text-xs text-slate-500">
                        Estime {req.requestedLeads * req.maxPricePerLead} EUR
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge
                        label={req.status}
                        tone={statusTone(req.status)}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      {req.order?.paymentStatus || "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {req.order?.paymentStatus === "SUCCEEDED" ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            Paye
                          </span>
                        ) : (
                          <CheckoutButton requestId={req.id} />
                        )}
                        <RequestDuplicateButton requestId={req.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
