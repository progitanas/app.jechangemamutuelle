import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RequestDuplicateButton } from "@/components/ui/request-duplicate-button";
import { PaymentStatusSync } from "@/components/ui/payment-status-sync";
import { cloudflareApi } from "@/lib/cloudflare-api";

const REQUEST_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "SUSPENDED",
  "COMPLETED",
  "CANCELLED",
] as const;
type RequestStatus = (typeof REQUEST_STATUSES)[number];

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
  searchParams: Promise<{
    status?: string;
    q?: string;
    payment?: string;
    requestId?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { status, q = "", payment, requestId } = await searchParams;
  const parsedStatus = REQUEST_STATUSES.includes(status as RequestStatus)
    ? (status as RequestStatus)
    : undefined;

  const payload = await cloudflareApi<{
    campaigns: Array<Record<string, unknown>>;
  }>(`/v1/campaigns?customerId=${encodeURIComponent(user.id)}`).catch(() => ({
    campaigns: [],
  }));

  const requests = payload.campaigns
    .filter((req) => {
      const statusValue = String(req.status || "SUBMITTED");
      const needType = String(req.need_type || "");
      const campaignName = String(req.campaign_name || "");

      if (parsedStatus && statusValue !== parsedStatus) return false;
      if (
        q &&
        !needType.toLowerCase().includes(q.toLowerCase()) &&
        !campaignName.toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .map((req) => ({
      id: String(req.id),
      campaignName: String(req.campaign_name || "Campagne"),
      needType: String(req.need_type || ""),
      quotaConsumed: Number(req.quota_consumed || 0),
      quotaRequested: Number(req.quota_requested || 0),
      budget: Number(req.budget_max || 0),
      requestedLeads: Number(req.requested_leads || 0),
      maxPricePerLead: Number(req.max_price_per_lead || 0),
      status: String(req.status || "SUBMITTED"),
      paymentStatus:
        String(req.status || "SUBMITTED") === "PAID"
          ? "Paye"
          : String(req.status || "SUBMITTED") === "APPROVED"
            ? "A regler"
            : "En attente",
    }));

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
          {REQUEST_STATUSES.map((currentStatus) => (
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

      {payment === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Paiement confirme{requestId ? ` pour la campagne ${requestId}` : ""}.
          {requestId ? <PaymentStatusSync requestId={requestId} /> : null}
        </div>
      ) : null}

      {payment === "cancel" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Paiement annule. Vous pouvez relancer l'operation quand vous voulez.
        </div>
      ) : null}

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
                    <td className="py-3 pr-4">{req.paymentStatus}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {req.status === "APPROVED" ? (
                          <CheckoutButton requestId={req.id} />
                        ) : null}
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
