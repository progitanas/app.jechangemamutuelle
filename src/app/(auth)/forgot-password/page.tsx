import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Mot de passe oublie
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Saisissez votre email pour recevoir un lien de reinitialisation.
      </p>
      <ForgotPasswordForm />
      <p className="mt-5 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-emerald-600">
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}
