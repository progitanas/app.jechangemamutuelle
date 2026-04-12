import { getCurrentUser } from "@/lib/auth";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { cloudflareApi } from "@/lib/cloudflare-api";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payload = await cloudflareApi<{
    campaigns: Array<Record<string, unknown>>;
  }>(`/v1/campaigns?customerId=${encodeURIComponent(user.id)}`).catch(() => ({
    campaigns: [],
  }));

  const requestsCount = payload.campaigns.length;
  const paidOrdersCount = 0;
  const leadsCount = 0;

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
            Dernieres campagnes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Campagne</th>
                <th className="py-3 pr-4">Besoin</th>
                <th className="py-3 pr-4">Quota</th>
                <th className="py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {payload.campaigns.slice(0, 5).map((req) => (
                <tr key={String(req.id)} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-700">
                    {String(req.campaign_name || "-")}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {String(req.need_type || "-")}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {Number(req.quota_consumed || 0)}/
                    {Number(req.quota_requested || 0)}
                  </td>
                  <td className="py-3 text-slate-500">
                    {String(req.status || "SUBMITTED")}
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
