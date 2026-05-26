import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientForm from "../../ClientForm";
import { updateClientAction } from "../../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateClientAction(id, formData);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/clients/${id}`} className="text-brand-400 hover:text-brand-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Modifier le client</h1>
          <p className="text-brand-500 text-sm">{client.company_name}</p>
        </div>
      </div>
      <ClientForm
        action={action}
        defaultValues={client}
        cancelHref={`/admin/clients/${id}`}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
