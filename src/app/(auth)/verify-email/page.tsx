"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verification en cours...");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Token manquant.");
      return;
    }

    const run = async () => {
      const res = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => null);

      if (!res || !res.ok) {
        const data = (await res?.json().catch(() => ({}))) as { error?: string };
        setState("error");
        setMessage(data.error || "Lien invalide ou expire.");
        return;
      }

      setState("ok");
      setMessage("Email verifie avec succes.");
    };

    void run();
  }, [token]);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Verification email
      </h1>
      <p
        className={`mb-6 rounded-xl p-3 text-sm ${
          state === "ok"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : state === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {message}
      </p>
      <p className="text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-emerald-600">
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            Verification email
          </h1>
          <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Verification en cours...
          </p>
          <p className="text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-emerald-600">
              Retour a la connexion
            </Link>
          </p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
