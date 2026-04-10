import { AdminStatusSelect } from "@/components/ui/admin-status-select";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
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

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q = "" } = await searchParams;
  const parsedStatus = REQUEST_STATUSES.includes(status as RequestStatus)
    ? (status as RequestStatus)
    : undefined;

  const payload = await cloudflareApi<{
    campaigns: Array<Record<string, unknown>>;
  }>("/v1/campaigns").catch(() => ({ campaigns: [] }));

  const requests = payload.campaigns
    .filter((r) => {
      const statusValue = String(r.status || "SUBMITTED");
      const searchCorpus =
        `${String(r.need_type || "")} ${String(r.campaign_name || "")}`.toLowerCase();
      if (parsedStatus && statusValue !== parsedStatus) return false;
      if (q && !searchCorpus.includes(q.toLowerCase())) return false;
      return true;
    })
    .map((r) => ({
      id: String(r.id),
      user: { email: String(r.customer_id || "-") },
      campaignName: String(r.campaign_name || "-"),
      needType: String(r.need_type || "-"),
      quotaConsumed: Number(r.quota_consumed || 0),
      quotaRequested: Number(r.quota_requested || 0),
      status: String(r.status || "SUBMITTED"),
      order: null,
    }));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Demandes</h1>
      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par besoin ou email client"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="ml-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/admin/demandes"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Réinitialiser
        </Link>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Client</th>
                <th className="py-3 pr-4">Campagne</th>
                <th className="py-3 pr-4">Quota</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3 pr-4">Paiement</th>
                <th className="py-3">Changer</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{request.user.email}</td>
                  <td className="py-3 pr-4">
                    <p>{request.campaignName}</p>
                    <p className="text-xs text-slate-500">{request.needType}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">
                    {request.quotaConsumed}/{request.quotaRequested}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={request.status}
                      tone={
                        request.status === "CANCELLED"
                          ? "red"
                          : request.status === "REJECTED"
                            ? "red"
                            : request.status === "PENDING"
                              ? "amber"
                              : request.status === "DRAFT"
                                ? "amber"
                                : "blue"
                      }
                    />
                  </td>
                  <td className="py-3 pr-4">-</td>
                  <td className="py-3">
                    <AdminStatusSelect
                      id={request.id}
                      value={request.status}
                      endpoint="/api/admin/request-status"
                      options={[...REQUEST_STATUSES]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
