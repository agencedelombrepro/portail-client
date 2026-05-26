import { createClientAction } from "../actions";
import ClientForm from "../ClientForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="text-brand-400 hover:text-brand-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-brand-900">Nouveau client</h1>
      </div>
      <ClientForm
        action={createClientAction}
        cancelHref="/admin/clients"
        submitLabel="Créer le client"
      />
    </div>
  );
}
