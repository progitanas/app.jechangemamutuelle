"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DisputeReviewActions({ disputeId }: { disputeId: string }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<"ACCEPT" | "REJECT" | null>(null);
  const router = useRouter();

  const review = async (decision: "ACCEPT" | "REJECT") => {
    setLoading(decision);

    const res = await fetch("/api/admin/lead-disputes/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disputeId,
        decision,
        resolutionComment: comment,
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error || "Traitement impossible");
      setLoading(null);
      return;
    }

    toast.success(
      decision === "ACCEPT"
        ? "Rejet accepte, remplacement cree"
        : "Rejet refuse",
    );
    setComment("");
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        placeholder="Commentaire de resolution"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => review("ACCEPT")}
          disabled={!!loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading === "ACCEPT" ? "Validation..." : "Accepter + remplacer"}
        </button>
        <button
          type="button"
          onClick={() => review("REJECT")}
          disabled={!!loading}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          {loading === "REJECT" ? "Traitement..." : "Refuser"}
        </button>
      </div>
    </div>
  );
}
