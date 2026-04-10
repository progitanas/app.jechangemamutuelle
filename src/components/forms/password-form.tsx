"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { passwordChangeSchema, type PasswordChangeInput } from "@/lib/schemas";

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (values: PasswordChangeInput) => {
    setLoading(true);

    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Mise à jour impossible");
      setLoading(false);
      return;
    }

    toast.success("Mot de passe mis à jour");
    reset();
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900">Sécurité du compte</h2>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Mot de passe actuel
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
        />
        {errors.currentPassword ? (
          <p className="mt-1 text-xs text-rose-600">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            {...register("newPassword")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
          {errors.newPassword ? (
            <p className="mt-1 text-xs text-rose-600">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-rose-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        disabled={loading}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
