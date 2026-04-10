"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const reasons = [
  { value: "HORS_CIBLE", label: "Hors cible" },
  { value: "NUMERO_INJOIGNABLE", label: "Numero injoignable" },
  { value: "EMAIL_INVALIDE", label: "Email invalide" },
  { value: "DOUBLON", label: "Doublon" },
  { value: "BUDGET_INCOMPATIBLE", label: "Budget incompatible" },
  { value: "DELAI_DEPASSE", label: "Delai depasse" },
  { value: "AUTRE", label: "Autre" },
] as const;

export function LeadRejectForm({
  leadId,
  disabled,
}: {
  leadId: string;
  disabled?: boolean;
}) {
  const [reason, setReason] = useState<string>("HORS_CIBLE");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);

    const res = await fetch("/api/leads/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, reason, details }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error || "Rejet impossible");
      setLoading(false);
      return;
    }

    toast.success("Rejet soumis pour revue");
    setDetails("");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Rejet et remplacement
      </p>
      <select
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        disabled={loading || disabled}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
      >
        {reasons.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        rows={2}
        disabled={loading || disabled}
        placeholder="Details optionnels"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading || disabled}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Rejeter ce lead"}
      </button>
    </div>
  );
}
