import Link from "next/link";
import { PaymentStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { status, q = "" } = await searchParams;
  const parsedStatus = Object.values(PaymentStatus).includes(
    status as PaymentStatus,
  )
    ? (status as PaymentStatus)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      ...(parsedStatus ? { paymentStatus: parsedStatus } : {}),
      ...(q ? { request: { needType: { contains: q } } } : {}),
    },
    include: { request: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Mes commandes
        </h1>
        <p className="text-sm text-slate-500">
          Suivez les paiements et leur statut.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par type de demande"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les paiements</option>
          {Object.values(PaymentStatus).map((currentStatus) => (
            <option key={currentStatus} value={currentStatus}>
              {currentStatus}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/dashboard/commandes"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Réinitialiser
        </Link>
      </form>

      {orders.length === 0 ? (
        <EmptyState
          title="Aucune commande"
          description="Vos paiements apparaitront ici."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Demande</th>
                  <th className="py-3 pr-4">Montant</th>
                  <th className="py-3 pr-4">Paiement</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-slate-700">
                      {order.request.needType}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {(order.amount / 100).toFixed(2)} EUR
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge
                        label={order.paymentStatus}
                        tone={
                          order.paymentStatus === "SUCCEEDED"
                            ? "emerald"
                            : order.paymentStatus === "FAILED"
                              ? "red"
                              : "amber"
                        }
                      />
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
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

