"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RequestDuplicateButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onDuplicate = async () => {
    setLoading(true);
    const res = await fetch(`/api/requests/${requestId}/duplicate`, {
      method: "POST",
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error || "Duplication impossible");
      setLoading(false);
      return;
    }

    toast.success("Campagne dupliquee");
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={onDuplicate}
      disabled={loading}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {loading ? "Duplication..." : "Dupliquer"}
    </button>
  );
}
