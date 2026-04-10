import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function AdminHomePage() {
  const [users, requests, orders, leads, latestRequests, latestOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.request.count(),
      prisma.order.count({ where: { paymentStatus: "SUCCEEDED" } }),
      prisma.lead.count(),
      prisma.request.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Dashboard admin
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilotage global des utilisateurs, demandes, paiements et leads.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Utilisateurs" value={users} />
        <KpiCard label="Demandes" value={requests} />
        <KpiCard label="Paiements réussis" value={orders} />
        <KpiCard label="Leads" value={leads} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Dernieres demandes</h2>
          <div className="space-y-3">
            {latestRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-slate-100 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {request.needType}
                </p>
                <p className="text-xs text-slate-500">
                  {request.user.email} - {request.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Dernieres commandes</h2>
          <div className="space-y-3">
            {latestOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-100 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {order.user.email}
                </p>
                <p className="text-xs text-slate-500">
                  {(order.amount / 100).toFixed(2)} EUR - {order.paymentStatus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

