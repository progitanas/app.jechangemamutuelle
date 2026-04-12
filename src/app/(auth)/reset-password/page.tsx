import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Reinitialiser le mot de passe
      </h1>

      {!token ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Lien invalide ou incomplet.
          </p>
          <p className="text-sm text-slate-500">
            Demandez un nouveau lien depuis la page mot de passe oublie.
          </p>
          <Link href="/forgot-password" className="font-semibold text-emerald-600">
            Aller a mot de passe oublie
          </Link>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </div>
  );
}
