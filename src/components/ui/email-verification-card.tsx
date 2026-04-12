"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const sendVerification = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/verify-email/request", {
      method: "POST",
    });

    const data = (await res.json().catch(() => ({}))) as {
      verifyLink?: string;
      error?: string;
    };

    if (!res.ok) {
      toast.error(data.error || "Impossible d'envoyer la verification");
      setLoading(false);
      return;
    }

    toast.success("Email de verification envoye");
    setDevLink(data.verifyLink || null);
    setLoading(false);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Verification email</h2>
      <p className="mt-2 text-sm text-slate-600">
        Verifiez votre email pour renforcer la securite du compte.
      </p>
      <button
        type="button"
        onClick={sendVerification}
        disabled={loading}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer un lien de verification"}
      </button>

      {devLink ? (
        <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
          Lien dev: <Link className="font-semibold underline" href={devLink}>{devLink}</Link>
        </p>
      ) : null}
    </article>
  );
}
