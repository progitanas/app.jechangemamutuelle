import { PasswordForm } from "@/components/forms/password-form";
import { EmailVerificationCard } from "@/components/ui/email-verification-card";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
            <li>Vos notifications seront affichées ici.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Facturation consolidée
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Vos factures seront affichées ici.</li>
          </ul>
        </article>
      </section>

      <EmailVerificationCard />

      <PasswordForm />
    </div>
  );
}
