"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PartnerOption = {
  id: string;
  name: string;
  email: string;
};

export function LeadSendForm({
  leadId,
  partners,
}: {
  leadId: string;
  partners: PartnerOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [partnerId, setPartnerId] = useState(partners[0]?.id || "");
  const [channel, setChannel] = useState("EMAIL");

  if (!partners.length) {
    return (
      <span className="text-xs font-semibold text-amber-700">
        Aucun partenaire actif
      </span>
    );
  }

  function sendLead() {
    startTransition(async () => {
      const res = await fetch("/api/admin/lead-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          partnerId,
          channel,
          notes: "Envoi depuis l'interface admin",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur" }));
        toast.error(data.error || "Envoi impossible");
        return;
      }

      toast.success("Lead envoye au partenaire");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={partnerId}
        onChange={(event) => setPartnerId(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      >
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.name} ({partner.email})
          </option>
        ))}
      </select>
      <select
        value={channel}
        onChange={(event) => setChannel(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      >
        <option value="EMAIL">EMAIL</option>
        <option value="CSV_EXPORT">CSV_EXPORT</option>
        <option value="API">API</option>
        <option value="MANUAL">MANUAL</option>
      </select>
      <button
        disabled={isPending}
        onClick={sendLead}
        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        Envoyer
      </button>
    </div>
  );
}
