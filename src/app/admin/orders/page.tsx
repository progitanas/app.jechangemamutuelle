import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

const PAYMENT_STATUSES = ["PENDING", "SUCCEEDED", "FAILED"] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q = "" } = await searchParams;
  const parsedStatus = PAYMENT_STATUSES.includes(status as PaymentStatus)
    ? (status as PaymentStatus)
    : undefined;

  const orders: Array<{
    id: string;
    user: { email: string };
    request: { needType: string };
    amount: number;
    paymentStatus: PaymentStatus;
    createdAt: string;
  }> = [];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Commandes</h1>
      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par client ou besoin"
          className="min-w-64 flex-1 rounded-xl border border-slate-200 px-4 py-2.5"
        />
        <select
          name="status"
          defaultValue={parsedStatus || ""}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Tous les paiements</option>
          {PAYMENT_STATUSES.map((currentStatus) => (
            <option key={currentStatus} value={currentStatus}>
              {currentStatus}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Filtrer
        </button>
        <Link
          href="/admin/orders"
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
                <th className="py-3 pr-4">Demande</th>
                <th className="py-3 pr-4">Montant</th>
                <th className="py-3 pr-4">Paiement</th>
                <th className="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{order.user.email}</td>
                  <td className="py-3 pr-4">{order.request.needType}</td>
                  <td className="py-3 pr-4">
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
                  <td className="py-3">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
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
