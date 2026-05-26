import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, List } from "lucide-react";
import KanbanBoard from "./KanbanBoard";

export default async function ClientsKanbanPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id,company_name,contact_name,email,website,prestation,prestations,client_status,presta_end_date")
    .order("company_name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Clients</h1>
          <p className="text-brand-500 text-sm">{clients?.length ?? 0} client(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/clients" className="btn-secondary flex items-center gap-2 text-sm">
            <List size={15} /> Liste
          </Link>
          <Link href="/admin/clients/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nouveau client
          </Link>
        </div>
      </div>

      <KanbanBoard initialClients={clients ?? []} />
    </div>
  );
}
