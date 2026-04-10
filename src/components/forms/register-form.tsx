"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/schemas";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          (data as { error?: string }).error || "Inscription impossible",
        );
        return;
      }

      toast.success("Compte créé");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Connexion backend indisponible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Prénom
          </label>
          <input
            {...register("firstName")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
          {errors.firstName ? (
            <p className="mt-1 text-xs text-rose-600">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nom
          </label>
          <input
            {...register("lastName")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
          {errors.lastName ? (
            <p className="mt-1 text-xs text-rose-600">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          {...register("email")}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Mot de passe
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-rose-600">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <button
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Déjà inscrit?{" "}
        <Link href="/login" className="font-semibold text-emerald-600">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
