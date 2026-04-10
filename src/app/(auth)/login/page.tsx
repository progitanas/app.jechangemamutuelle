import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Connexion
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Accedez a votre espace JechangeMaMutuelle.
      </p>
      <LoginForm />
    </div>
  );
}
