import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquarePlus } from "lucide-react";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const [{ data: threads }, { data: allClients }] = await Promise.all([
    supabase
      .from("messages")
      .select("*, client:clients(id,company_name), sender:profiles!messages_sender_id_fkey(full_name,role,avatar_url)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id,company_name").order("company_name"),
  ]);

  // Deduplicate: keep latest message per client
  const seen = new Set<string>();
  const latestPerClient = new Map<string, any>();
  for (const m of threads ?? []) {
    if (!seen.has(m.client_id)) {
      seen.add(m.client_id);
      latestPerClient.set(m.client_id, m);
    }
  }

  // Clients without any messages
  const clientsWithMessages = new Set(latestPerClient.keys());
  const clientsWithoutMessages = (allClients ?? []).filter((c) => !clientsWithMessages.has(c.id));

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">Messages</h1>
        <p className="text-xs text-brand-400">{allClients?.length ?? 0} client(s)</p>
      </div>

      <div className="card divide-y divide-brand-50">
        {/* Conversations existantes */}
        {latestPerClient.size === 0 && clientsWithoutMessages.length === 0 && (
          <p className="text-sm text-brand-400 text-center p-8">Aucun client</p>
        )}

        {[...latestPerClient.values()].map((m: any) => (
          <Link key={m.client_id} href={`/admin/messages/${m.client_id}`}
            className="flex items-start gap-3 p-4 hover:bg-brand-50 transition-colors block">
            <Avatar name={(m.client as any)?.company_name ?? "?"} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-brand-900">{(m.client as any)?.company_name}</p>
                <p className="text-xs text-brand-400 flex-shrink-0 ml-2">{formatDateTime(m.created_at)}</p>
              </div>
              <p className="text-sm text-brand-500 truncate mt-0.5">{m.content}</p>
            </div>
            {!m.is_read && m.sender?.role === "client" && (
              <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
            )}
          </Link>
        ))}

        {/* Clients sans message — démarrer une conversation */}
        {clientsWithoutMessages.map((c) => (
          <Link key={c.id} href={`/admin/messages/${c.id}`}
            className="flex items-start gap-3 p-4 hover:bg-brand-50 transition-colors block">
            <Avatar name={c.company_name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brand-900">{c.company_name}</p>
              <p className="text-sm text-brand-400 mt-0.5 flex items-center gap-1.5">
                <MessageSquarePlus size={13} /> Démarrer une conversation
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
