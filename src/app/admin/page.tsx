import { KpiCard } from "@/components/dashboard/kpi-card";
import { cloudflareApi } from "@/lib/cloudflare-api";

export default async function AdminHomePage() {
  const campaigns = await cloudflareApi<{
    campaigns: Array<Record<string, unknown>>;
  }>("/v1/campaigns").catch(() => ({ campaigns: [] }));

  const requests = campaigns.campaigns.length;
  const users = 0;
  const orders = 0;
  const leads = 0;

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
            {campaigns.campaigns.slice(0, 5).map((request) => (
              <div
                key={String(request.id)}
                className="rounded-xl border border-slate-100 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {String(request.campaign_name || "-")}
                </p>
                <p className="text-xs text-slate-500">
                  {String(request.need_type || "-")} -{" "}
                  {String(request.status || "SUBMITTED")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Dernieres commandes</h2>
          <p className="text-sm text-slate-600">
            Données commandes en migration D1.
          </p>
        </div>
      </section>
    </div>
  );
}
