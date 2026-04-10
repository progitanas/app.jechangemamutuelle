"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  id: string;
  value: string;
  endpoint: "/api/admin/request-status" | "/api/admin/lead-status";
  options: string[];
};

export function AdminStatusSelect({ id, value, endpoint, options }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={isPending}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      onChange={(e) => {
        const nextStatus = e.target.value;
        startTransition(async () => {
          const res = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: nextStatus }),
          });
          if (!res.ok) {
            toast.error("Mise à jour impossible");
            return;
          }
          toast.success("Statut mis à jour");
        });
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

