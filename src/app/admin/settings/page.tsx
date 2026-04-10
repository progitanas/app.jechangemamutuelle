import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const [users, requests, orders, leads] = await Promise.all([
    prisma.user.count(),
    prisma.request.count(),
    prisma.order.count(),
    prisma.lead.count(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Paramètres admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Contrôle opérationnel de la plateforme et vérification de la
          configuration.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">État système</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              Stripe secret:{" "}
              {process.env.STRIPE_SECRET_KEY ? "Configuré" : "À configurer"}
            </li>
            <li>
              Stripe webhook:{" "}
              {process.env.STRIPE_WEBHOOK_SECRET ? "Configuré" : "À configurer"}
            </li>
            <li>
              URL applicative:{" "}
              {process.env.NEXT_PUBLIC_APP_URL || "À configurer"}
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Volumes</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Utilisateurs: {users}</li>
            <li>Demandes: {requests}</li>
            <li>Commandes: {orders}</li>
            <li>Leads: {leads}</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
