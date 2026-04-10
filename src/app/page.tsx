import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dcfce7_0%,#f8fafc_45%,#f8fafc_100%)]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            JechangeMaMutuelle
          </p>
          <p className="text-sm font-medium text-slate-600">
            Leads mutuelle en flux simple
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              Plateforme SaaS
            </p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-slate-900">
              Déposez, payez, recevez vos leads mutuelle.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              JechangeMaMutuelle simplifie tout le process: une demande claire,
              paiement sécurisé, et accès rapide à vos résultats directement
              depuis le dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Accéder à mon espace
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-10 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Pourquoi ça marche</h2>
            <ul className="mt-6 space-y-4 text-sm text-emerald-50">
              <li>Formulaire guide pour exprimer le besoin de mutuelle</li>
              <li>Paiement Stripe immédiat et fiable</li>
              <li>Leads débloqués automatiquement après validation</li>
              <li>Espace admin central pour piloter demandes et statuts</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
