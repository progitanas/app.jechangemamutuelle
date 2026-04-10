import { prisma } from "@/lib/prisma";
import { PartnerCreateForm } from "@/components/forms/partner-create-form";
import { PartnerImportForm } from "@/components/forms/partner-import-form";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    include: {
      _count: {
        select: { deliveries: true },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Partenaires B2B
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gère les structures intéressées et leurs réceptions de leads.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Ajouter un partenaire
          </h2>
          <PartnerCreateForm />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Import en masse
          </h2>
          <PartnerImportForm />
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Liste des partenaires
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Nom</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Ville</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3">Leads reçus</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-700">
                    {partner.name}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{partner.email}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {partner.city || "-"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        partner.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {partner.isActive ? "ACTIF" : "INACTIF"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">
                    {partner._count.deliveries}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

