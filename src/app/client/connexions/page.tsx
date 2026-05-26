import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConnectionsManager, { type ServiceConfig } from "@/components/ConnectionsManager";
import { revalidatePath } from "next/cache";

export default async function ClientConnexionsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, ga4_property_id, search_console_url, gmb_location_id")
    .eq("user_id", user.id)
    .single();
  if (!client) redirect("/client");

  const { data: connections } = await supabase
    .from("oauth_connections")
    .select("provider, account_name, account_id, expires_at, updated_at")
    .eq("client_id", client.id);

  async function saveConfig(field: keyof ServiceConfig, value: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("clients").update({ [field]: value || null }).eq("id", client!.id);
    revalidatePath("/client/connexions");
  }

  const config: ServiceConfig = {
    ga4_property_id:    client.ga4_property_id,
    search_console_url: client.search_console_url,
    gmb_location_id:    client.gmb_location_id,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Mes connexions</h1>
        <p className="text-brand-500 text-sm mt-0.5">
          Connectez vos comptes pour afficher vos statistiques dans cet espace.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">
            {{
              meta_denied:     "Connexion Meta annulée.",
              linkedin_denied: "Connexion LinkedIn annulée.",
              meta_token:      "Erreur lors de la connexion Meta. Réessayez.",
              linkedin_token:  "Erreur lors de la connexion LinkedIn. Réessayez.",
              state_mismatch:  "Erreur de sécurité. Réessayez.",
            }[error] ?? "Une erreur est survenue."}
          </p>
        </div>
      )}

      <ConnectionsManager
        clientId={client.id}
        connections={connections ?? []}
        config={config}
        onSaveConfig={saveConfig}
        successProvider={success ?? null}
      />
    </div>
  );
}
