import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function LeadsPage({}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mes leads</h1>
        <p className="text-sm text-slate-500">
          Visibles uniquement après paiement validé.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Module leads en cours de finalisation. Les leads seront lisibles ici
          dès que les endpoints seront activés.
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
        title="Aucun lead disponible"
        description="Les donnees leads sont en cours de synchronisation."
      />
    </div>
  );
}
