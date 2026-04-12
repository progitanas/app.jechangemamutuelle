"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const resetSchema = z
  .object({
    newPassword: z.string().min(10, "Minimum 10 caracteres"),
    confirmPassword: z.string().min(10, "Confirmation requise"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "La confirmation ne correspond pas",
    path: ["confirmPassword"],
  });

type ResetInput = z.infer<typeof resetSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: ResetInput) => {
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, token }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      toast.error(data.error || "Reinitialisation impossible");
      setLoading(false);
      return;
    }

    toast.success("Mot de passe reinitialise");
    router.push("/login");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <p className="mt-1 text-xs text-rose-600">{errors.newPassword.message}</p>
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

      <button
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Validation..." : "Valider le nouveau mot de passe"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Retour a <Link href="/login" className="font-semibold text-emerald-600">la connexion</Link>
      </p>
    </form>
  );
}
