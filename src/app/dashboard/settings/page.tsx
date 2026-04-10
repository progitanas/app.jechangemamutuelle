import { PasswordForm } from "@/components/forms/password-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  const [notifications, invoices] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    membership
      ? prisma.invoice.findMany({
          where: { organizationId: membership.organizationId },
          orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">Paramètres</h1>
        <p className="mt-2 text-sm text-slate-500">
          Configuréz votre compte et sécuriséz votre accès.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {notifications.length === 0 ? (
              <li>Aucune notification.</li>
            ) : (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <span className="font-semibold">{notification.title}</span>
                  {" - "}
                  {notification.message}
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Facturation consolidée
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {invoices.length === 0 ? (
              <li>Aucune facture consolidée.</li>
            ) : (
              invoices.map((invoice) => (
                <li key={invoice.id}>
                  {invoice.periodMonth}/{invoice.periodYear} -{" "}
                  {invoice.totalAmount} EUR ({invoice.status})
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <PasswordForm />
    </div>
  );
}
