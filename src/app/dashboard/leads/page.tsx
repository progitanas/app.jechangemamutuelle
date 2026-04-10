import Link from "next/link";
import { LeadStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadRejectForm } from "@/components/ui/lead-reject-form";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { status, q = "" } = await searchParams;
  const parsedStatus = Object.values(LeadStatus).includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;

  const leads = await prisma.lead.findMany({
    where: {
      userId: user.id,
      status: parsedStatus ? parsedStatus : { in: ["AVAILABLE", "DELIVERED"] },
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { contactName: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      disputes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mes leads</h1>
        <p className="text-sm text-slate-500">
          Visibles uniquement après paiement validé.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par titre, description ou contact"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Disponibles et livrés</option>
          {Object.values(LeadStatus)
            .filter((currentStatus) => currentStatus !== "LOCKED")
            .map((currentStatus) => (
              <option key={currentStatus} value={currentStatus}>
                {currentStatus}
              </option>
            ))}
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/dashboard/leads"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Réinitialiser
        </Link>
      </form>

      {leads.length === 0 ? (
        <EmptyState
          title="Aucun lead disponible"
          description="Une fois vos commandes validées, vos leads apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">{lead.title}</h2>
                <StatusBadge
                  label={lead.status}
                  tone={lead.status === "DELIVERED" ? "emerald" : "blue"}
                />
              </div>
              <p className="mb-4 text-sm text-slate-600">{lead.description}</p>
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Contact:</span>{" "}
                  {lead.contactName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {lead.contactEmail}
                </p>
                <p>
                  <span className="font-semibold">Téléphone:</span>{" "}
                  {lead.contactPhone}
                </p>
                {lead.deliveredAt ? (
                  <p className="text-xs text-slate-500">
                    Livré le{" "}
                    {new Date(lead.deliveredAt).toLocaleDateString("fr-FR")}
                  </p>
                ) : null}
                {lead.disputes[0] ? (
                  <p className="text-xs text-slate-500">
                    Litige: {lead.disputes[0].status}
                  </p>
                ) : null}
              </div>
              <LeadRejectForm
                leadId={lead.id}
                disabled={lead.disputes[0]?.status === "PENDING_REVIEW"}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
