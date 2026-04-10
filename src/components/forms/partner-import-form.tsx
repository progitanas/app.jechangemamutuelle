"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PartnerImportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const rows = String(formData.get("rows") || "");

    const res = await fetch("/api/admin/partners/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Erreur" }));
      toast.error(data.error || "Import impossible");
      setLoading(false);
      return;
    }

    const data = await res.json();
    toast.success(`${data.imported} partenaires importes`);
    router.refresh();
    setLoading(false);
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <p className="text-xs text-slate-500">
        Format: nom,email,téléphone,ville (une ligne par partenaire)
      </p>
      <textarea
        name="rows"
        rows={6}
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
        placeholder={
          "Agence Alpha,alpha@partner.fr,0102030405,Paris\nCabinet Beta,beta@partner.fr,0601020304,Lyon"
        }
        required
      />
      <button
        disabled={loading}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        {loading ? "Import..." : "Importer en masse"}
      </button>
    </form>
  );
}
