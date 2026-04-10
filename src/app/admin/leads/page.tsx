import { LeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminStatusSelect } from "@/components/ui/admin-status-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadSendForm } from "@/components/ui/lead-send-form";
import { DisputeReviewActions } from "@/components/ui/dispute-review-actions";
import Link from "next/link";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q = "" } = await searchParams;
  const parsedStatus = Object.values(LeadStatus).includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;

  const leads = await prisma.lead.findMany({
    where: {
      ...(parsedStatus ? { status: parsedStatus } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { contactEmail: { contains: q } },
              { user: { email: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      user: true,
      request: true,
      deliveries: {
        include: { partner: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
    take: 200,
  });

  const pendingDisputes = await prisma.leadDispute.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      user: true,
      lead: true,
      request: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Leads</h1>
      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par titre, contact ou client"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.values(LeadStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="ml-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/admin/leads"
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
                <th className="py-3 pr-4">Titre</th>
                <th className="py-3 pr-4">Client</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3 pr-4">Dernier envoi</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{lead.title}</td>
                  <td className="py-3 pr-4">{lead.user.email}</td>
                  <td className="py-3 pr-4">{lead.contactEmail}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={lead.status}
                      tone={
                        lead.status === "DELIVERED"
                          ? "emerald"
                          : lead.status === "AVAILABLE"
                            ? "blue"
                            : "amber"
                      }
                    />
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">
                    {lead.deliveries[0]
                      ? `${lead.deliveries[0].partner.name} (${lead.deliveries[0].channel})`
                      : "Aucun envoi"}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-2">
                      <AdminStatusSelect
                        id={lead.id}
                        value={lead.status}
                        endpoint="/api/admin/lead-status"
                        options={Object.values(LeadStatus)}
                      />
                      <LeadSendForm leadId={lead.id} partners={partners} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Litiges en attente
          </h2>
          <span className="text-xs text-slate-500">
            {pendingDisputes.length} a traiter
          </span>
        </div>

        {pendingDisputes.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun litige en attente.</p>
        ) : (
          <div className="space-y-3">
            {pendingDisputes.map((dispute) => (
              <article
                key={dispute.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {dispute.lead.title} - {dispute.user.email}
                  </p>
                  <StatusBadge label={dispute.status} tone="amber" />
                </div>
                <p className="text-xs text-slate-600">
                  Motif: {dispute.reason}
                  {dispute.details ? ` | ${dispute.details}` : ""}
                </p>
                <p className="mb-3 text-xs text-slate-500">
                  Campagne: {dispute.request.campaignName}
                </p>
                <DisputeReviewActions disputeId={dispute.id} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
