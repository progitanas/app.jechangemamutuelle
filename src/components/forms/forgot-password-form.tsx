"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotInput) => {
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      resetLink?: string;
      error?: string;
    };

    if (!res.ok) {
      toast.error(data.error || "Impossible d'envoyer le lien");
      setLoading(false);
      return;
    }

    toast.success(
      data.message || "Si le compte existe, un email de reinitialisation est envoye.",
    );
    setDevLink(data.resetLink || null);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <button
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer le lien"}
      </button>

      {devLink ? (
        <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
          Lien dev: <Link className="font-semibold underline" href={devLink}>{devLink}</Link>
        </p>
      ) : null}
    </form>
  );
}
