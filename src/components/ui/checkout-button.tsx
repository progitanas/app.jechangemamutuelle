"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CheckoutButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    if (!res.ok) {
      toast.error("Impossible de lancer le paiement");
      setLoading(false);
      return;
    }

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }

    toast.error("Session Stripe indisponible");
    setLoading(false);
  };

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {loading ? "Ouverture..." : "Payér"}
    </button>
  );
}

