import { RequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminStatusSelect } from "@/components/ui/admin-status-select";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q = "" } = await searchParams;
  const parsedStatus = Object.values(RequestStatus).includes(
    status as RequestStatus,
  )
    ? (status as RequestStatus)
    : undefined;

  const requests = await prisma.request.findMany({
    where: {
      ...(parsedStatus ? { status: parsedStatus } : {}),
      ...(q
        ? {
            OR: [
              { needType: { contains: q } },
              { campaignName: { contains: q } },
              { user: { email: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { user: true, order: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
          {Object.values(RequestStatus).map((s) => (
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
                  <td className="py-3 pr-4">
                    {request.order?.paymentStatus || "-"}
                  </td>
                  <td className="py-3">
                    <AdminStatusSelect
                      id={request.id}
                      value={request.status}
                      endpoint="/api/admin/request-status"
                      options={Object.values(RequestStatus)}
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
