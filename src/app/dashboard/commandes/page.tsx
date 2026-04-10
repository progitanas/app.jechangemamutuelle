import { getCurrentUser } from "@/lib/auth";
import { EmptyState } from "@/components/dashboard/empty-state";
import Link from "next/link";

export default async function OrdersPage({}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Module commandes en migration D1. Les paiements seront synchronises
          via Cloudflare dans la prochaine passe.
        </p>
        <div className="mt-4">
          <Link
            href="/dashboard/demandes"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Retour aux campagnes
          </Link>
        </div>
      </div>

      <EmptyState
        title="Aucune commande disponible"
        description="La source de données MySQL est désactivée en faveur de D1."
      />
    </div>
  );
}
