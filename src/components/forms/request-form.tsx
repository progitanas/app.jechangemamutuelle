"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  requestSchema,
  type RequestFormInput,
  type RequestInput,
} from "@/lib/schemas";

export function RequestForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      campaignName: "",
      needType: "",
      requestedLeads: 100,
      age: 30,
      situation: "",
      coverageLevel: "",
      geoArea: "France",
      targetSegment: "Particuliers",
      qualityLevel: "Standard",
      isExclusive: false,
      startDate: "",
      campaignDurationDays: 30,
      budget: 2000,
      maxPricePerLead: 20,
      volumeCadence: "WEEK",
      volumePerCadence: 25,
      targetAgeMin: 25,
      targetAgeMax: 60,
      familySituation: "",
      professionalStatus: "",
      incomeLevel: "",
      currentContractType: "",
      contractExpiryDate: "",
      immediateNeed: false,
      preferredContactChannel: "telephone",
      phoneRequired: true,
      emailRequired: true,
      alreadyInsured: true,
      customerType: "particulier",
      deliveryCadence: "REAL_TIME",
      deliveryByEmail: true,
      deliveryByWebhook: false,
      deliveryByApi: false,
      deliveryByCsv: false,
      deliveryToCrm: false,
      instantNotifications: true,
      autoPauseOnQuota: true,
      deliveryHours: "09:00-18:00",
      quotaRequested: 100,
      dailyLimit: 10,
      monthlyLimit: 120,
      autoStopAtQuota: true,
      autoResumeOnRecharge: false,
      rolloverUnusedQuota: false,
      isTemplate: false,
      templateName: "",
      isRecurring: false,
      recurrenceCadence: "NONE",
      notes: "",
    },
  });

  const requestedLeads = Number(watch("requestedLeads") || 0);
  const maxPricePerLead = Number(watch("maxPricePerLead") || 0);
  const budget = Number(watch("budget") || 0);
  const isExclusive = watch("isExclusive") || false;
  const estimatedCost = requestedLeads * maxPricePerLead;
  const budgetGap = budget - estimatedCost;
  const feasibilityScore = Math.max(
    20,
    Math.min(98, Math.round((budget / Math.max(1, estimatedCost)) * 100)),
  );

  const onSubmit = async (values: RequestInput) => {
    setLoading(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Erreur de creation");
      setLoading(false);
      return;
    }

    toast.success("Campagne enregistree");
    router.push("/dashboard/demandes");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <section className="space-y-3 rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Bloc 1 - Volume
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom campagne
            </label>
            <input
              {...register("campaignName")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Campagne mutuelle seniors Q2"
            />
            {errors.campaignName ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.campaignName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nombre de leads
            </label>
            <input
              type="number"
              {...register("requestedLeads")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de debut
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Duree (jours)
            </label>
            <input
              type="number"
              {...register("campaignDurationDays")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Frequence volume
            </label>
            <select
              {...register("volumeCadence")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            >
              <option value="DAY">Par jour</option>
              <option value="WEEK">Par semaine</option>
              <option value="MONTH">Par mois</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Volume par periode
            </label>
            <input
              type="number"
              {...register("volumePerCadence")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Bloc 2 - Ciblage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Type de leads
            </label>
            <input
              {...register("needType")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Mutuelle sante"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Region / zone
            </label>
            <input
              {...register("geoArea")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Ile-de-France"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Segment cible
            </label>
            <input
              {...register("targetSegment")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Salaries / TNS / Seniors"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Qualite</label>
            <input
              {...register("qualityLevel")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Premium"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Age min</label>
            <input
              type="number"
              {...register("targetAgeMin")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Age max</label>
            <input
              type="number"
              {...register("targetAgeMax")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
            {errors.targetAgeMax ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.targetAgeMax.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Situation</label>
            <input
              {...register("situation")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Marie, celibataire..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Niveau couverture
            </label>
            <input
              {...register("coverageLevel")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="Intermediaire"
            />
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isExclusive")} /> Exclusif
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("phoneRequired")} /> Telephone
              joignable obligatoire
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("emailRequired")} /> Email
              valide obligatoire
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Bloc 3 - Livraison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Cadence de livraison
            </label>
            <select
              {...register("deliveryCadence")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            >
              <option value="REAL_TIME">Temps reel</option>
              <option value="DAILY_BATCH">Batch quotidien</option>
              <option value="WEEKLY_BATCH">Batch hebdo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Horaires</label>
            <input
              {...register("deliveryHours")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
              placeholder="09:00-18:00"
            />
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("deliveryByEmail")} /> Email
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("deliveryByWebhook")} />{" "}
              Webhook
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("deliveryByApi")} /> API
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("deliveryByCsv")} /> CSV
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("deliveryToCrm")} /> Vers CRM
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("instantNotifications")} />{" "}
              Notifications instantanees
            </label>
          </div>
          {errors.deliveryByEmail ? (
            <p className="sm:col-span-2 text-xs text-rose-600">
              {errors.deliveryByEmail.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Bloc 4 - Budget et quota
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Budget max (EUR)
            </label>
            <input
              type="number"
              {...register("budget")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Prix max / lead (EUR)
            </label>
            <input
              type="number"
              {...register("maxPricePerLead")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Quota demande
            </label>
            <input
              type="number"
              {...register("quotaRequested")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
            {errors.quotaRequested ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.quotaRequested.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Limite journaliere
            </label>
            <input
              type="number"
              {...register("dailyLimit")}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("autoPauseOnQuota")} /> Pause
              automatique quota atteint
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("autoStopAtQuota")} /> Arret
              automatique quota atteint
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("rolloverUnusedQuota")} />{" "}
              Report quota non consomme
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Bloc 5 - Validation
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-slate-500">Estimation cout</p>
            <p className="text-lg font-bold text-slate-900">
              {estimatedCost} EUR
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-slate-500">Ecart budget</p>
            <p
              className={`text-lg font-bold ${budgetGap >= 0 ? "text-emerald-700" : "text-rose-700"}`}
            >
              {budgetGap} EUR
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-slate-500">Faisabilite estimee</p>
            <p className="text-lg font-bold text-blue-700">
              {feasibilityScore}%
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          {isExclusive
            ? "Mode exclusif: prevoir un prix par lead plus eleve pour maintenir le volume."
            : "Mode mutualise: volume plus large avec cout generalement plus bas."}
        </p>
      </section>

      <div>
        <label className="mb-1 block text-sm font-medium">Commentaire</label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
          placeholder="Details utiles pour la campagne"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isTemplate")} /> Sauvegarder
          comme modele
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isRecurring")} /> Demande
          recurrente
        </label>
        <select
          {...register("recurrenceCadence")}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="NONE">Sans reconduction</option>
          <option value="WEEKLY">Renouvellement hebdo</option>
          <option value="MONTHLY">Renouvellement mensuel</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Age moyen prospect
          </label>
          <input
            type="number"
            {...register("age")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            placeholder="40"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Canal prefere
          </label>
          <input
            {...register("preferredContactChannel")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            placeholder="telephone"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Situation familiale
          </label>
          <input
            {...register("familySituation")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            placeholder="Couple avec enfants"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Statut pro</label>
          <input
            {...register("professionalStatus")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            placeholder="Salarie"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Niveau de revenu
          </label>
          <input
            {...register("incomeLevel")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            placeholder="2 000 - 3 500 EUR"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer la campagne"}
      </button>
    </form>
  );
}
