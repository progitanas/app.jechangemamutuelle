"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: string;
};

export function PaymentStatusSync({ requestId }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "confirmed" | "pending">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      const res = await fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
        cache: "no-store",
      }).catch(() => null);

      if (!res || !res.ok) {
        if (attempts >= 10 && !cancelled) setState("pending");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { status?: string };
      if (data.status === "PAID") {
        if (!cancelled) {
          setState("confirmed");
          router.replace("/dashboard/demandes");
          router.refresh();
        }
      } else if (attempts >= 10 && !cancelled) {
        setState("pending");
      }
    };

    const interval = setInterval(() => {
      void tick();
    }, 2000);

    void tick();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId, router]);

  if (state === "confirmed") {
    return (
      <p className="mt-2 text-xs text-emerald-700">
        Paiement confirme. Mise a jour de la liste en cours...
      </p>
    );
  }

  if (state === "pending") {
    return (
      <p className="mt-2 text-xs text-amber-700">
        Paiement en cours de confirmation. La mise a jour arrivera automatiquement.
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-slate-600">
      Verification du paiement en cours...
    </p>
  );
}