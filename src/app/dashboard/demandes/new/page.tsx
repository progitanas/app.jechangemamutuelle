import { RequestForm } from "@/components/forms/request-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Creer une campagne de leads
        </h1>
        <p className="text-sm text-slate-500">
          Definissez volume, ciblage, livraison, budget et quota pour lancer
          votre brief d&apos;achat.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}
