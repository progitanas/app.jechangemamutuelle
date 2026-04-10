"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/schemas";

type Props = {
  defaultValues: ProfileInput;
  email: string;
};

export function ProfileForm({ defaultValues, email }: Props) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = async (values: ProfileInput) => {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error("Erreur de mise à jour");
      setLoading(false);
      return;
    }

    toast.success("Profil mis à jour");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Prénom</label>
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
          <label className="mb-1 block text-sm font-medium">Nom</label>
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
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          value={email}
          readOnly
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Téléphone</label>
          <input
            {...register("phone")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ville</label>
          <input
            {...register("city")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          />
        </div>
      </div>
      <button
        disabled={loading}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </form>
  );
}
