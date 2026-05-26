import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientSidebar from "@/components/client/ClientSidebar";
import ClientHeader from "@/components/client/ClientHeader";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: clientData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("clients").select("*").eq("user_id", user.id).single(),
  ]);

  // Mise à jour silencieuse du dernier accès
  supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);

  if (!clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-center">
          <p className="text-brand-600">Votre compte n&apos;est pas encore lié à un client.</p>
          <p className="text-brand-400 text-sm mt-1">Contactez l&apos;agence pour activer votre accès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClientHeader profile={profile} clientName={clientData.company_name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
