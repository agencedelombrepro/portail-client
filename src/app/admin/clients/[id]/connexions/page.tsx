import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import ConnectionsManager, { type ServiceConfig } from "@/components/ConnectionsManager";

export default async function AdminClientConnexionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, company_name, ga4_property_id, search_console_url, gmb_location_id")
    .eq("id", id)
    .single();
  if (!client) notFound();

  const { data: connections } = await supabase
    .from("oauth_connections")
    .select("provider, account_name, account_id, expires_at, updated_at")
    .eq("client_id", id);

  async function saveConfig(field: keyof ServiceConfig, value: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("clients").update({ [field]: value || null }).eq("id", id);
    revalidatePath(`/admin/clients/${id}/connexions`);
  }

  const config: ServiceConfig = {
    ga4_property_id:    client.ga4_property_id,
    search_console_url: client.search_console_url,
    gmb_location_id:    client.gmb_location_id,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/clients/${id}`} className="text-brand-400 hover:text-brand-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Connexions — {client.company_name}</h1>
          <p className="text-brand-500 text-sm">Gérez les intégrations analytics de ce client</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">
            {{
              meta_denied:     "Connexion Meta annulée.",
              linkedin_denied: "Connexion LinkedIn annulée.",
              meta_token:      "Erreur lors de la connexion Meta.",
              linkedin_token:  "Erreur lors de la connexion LinkedIn.",
            }[error] ?? "Une erreur est survenue."}
          </p>
        </div>
      )}

      <ConnectionsManager
        clientId={id}
        connections={connections ?? []}
        config={config}
        isAdmin
        onSaveConfig={saveConfig}
        successProvider={success ?? null}
      />
    </div>
  );
}
