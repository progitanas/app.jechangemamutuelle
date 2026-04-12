import Link from "next/link";

const LEAD_STATUSES = [
  "NEW",
  "AVAILABLE",
  "DELIVERED",
  "REJECTED",
  "DUPLICATE",
  "UNREACHABLE",
  "QUALIFIED",
] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q = "" } = await searchParams;
  const parsedStatus = LEAD_STATUSES.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;

  const leads: Array<{ id: string; title: string; contactEmail: string }> = [];

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
          {LEAD_STATUSES.map((s) => (
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
                  <td className="py-3 pr-4">-</td>
                  <td className="py-3 pr-4">{lead.contactEmail}</td>
                  <td className="py-3 pr-4">{parsedStatus || "-"}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600">-</td>
                  <td className="py-3">
                    <span className="text-xs text-slate-500">
                      Bientot disponible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Les modules leads avancés (envoi, litiges, remplacements) sont en
          cours de finalisation.
        </p>
      </div>
    </div>
  );
}
