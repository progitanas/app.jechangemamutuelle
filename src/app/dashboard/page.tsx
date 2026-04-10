import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";

function statusTone(status: string) {
  if (status === "PAID" || status === "DELIVERED") return "emerald" as const;
  if (status === "IN_REVIEW") return "blue" as const;
  if (status === "CANCELLED") return "red" as const;
  return "amber" as const;
}

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [requestsCount, paidOrdersCount, leadsCount, latestRequests] =
    await Promise.all([
      prisma.request.count({ where: { userId: user.id } }),
      prisma.order.count({
        where: { userId: user.id, paymentStatus: "SUCCEEDED" },
      }),
      prisma.lead.count({
        where: { userId: user.id, status: { in: ["AVAILABLE", "DELIVERED"] } },
      }),
      prisma.request.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Dashboard client
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue rapide sur vos demandes, paiements et leads.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Demandes" value={requestsCount} />
        <KpiCard label="Commandes payées" value={paidOrdersCount} />
        <KpiCard label="Leads reçus" value={leadsCount} />
        <KpiCard
          label="Taux conversion"
          value={`${requestsCount ? Math.round((paidOrdersCount / requestsCount) * 100) : 0}%`}
          hint="Paiements / demandes"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Dernieres demandes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Besoin</th>
                <th className="py-3 pr-4">Budget</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {latestRequests.map((req) => (
                <tr key={req.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-700">
                    {req.needType}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {req.budget} EUR/mois
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge
                      label={req.status}
                      tone={statusTone(req.status)}
                    />
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR")}
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

