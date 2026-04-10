"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PartnerCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      city: String(formData.get("city") || ""),
      deliveryWebhookUrl: String(formData.get("deliveryWebhookUrl") || ""),
      apiEndpoint: String(formData.get("apiEndpoint") || ""),
      apiKey: String(formData.get("apiKey") || ""),
      csvEmail: String(formData.get("csvEmail") || ""),
      crmWebhookUrl: String(formData.get("crmWebhookUrl") || ""),
    };

    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Erreur" }));
      toast.error(data.error || "Création impossible");
      setLoading(false);
      return;
    }

    toast.success("Partenaire ajoute");
    router.refresh();
    setLoading(false);
  }

  return (
    <form action={onSubmit} className="grid gap-3 md:grid-cols-2">
      <input
        name="name"
        placeholder="Nom du partenaire"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="contact@partenaire.fr"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
        required
      />
      <input
        name="phone"
        placeholder="Téléphone"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="city"
        placeholder="Ville"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="deliveryWebhookUrl"
        placeholder="Webhook livraison (https://...)"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="apiEndpoint"
        placeholder="API endpoint partenaire (https://...)"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="apiKey"
        placeholder="API key partenaire (optionnel)"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="csvEmail"
        placeholder="Email export CSV"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <input
        name="crmWebhookUrl"
        placeholder="Webhook CRM (https://...)"
        className="rounded-xl border border-slate-200 px-4 py-2.5"
      />
      <div className="md:col-span-2">
        <button
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Ajout..." : "Ajouter le partenaire"}
        </button>
      </div>
    </form>
  );
}
