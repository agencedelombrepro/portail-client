import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MessageThread from "@/components/MessageThread";

export default async function AdminConversationPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: messages }, { data: { user } }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase.from("messages").select("*, sender:profiles!messages_sender_id_fkey(id,full_name,role,avatar_url)").eq("client_id", clientId).order("created_at"),
    supabase.auth.getUser(),
  ]);

  if (!client) notFound();

  // Mark unread messages as read
  await supabase.from("messages").update({ is_read: true }).eq("client_id", clientId).eq("is_read", false).neq("sender_id", user!.id);

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/messages" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-brand-900">{client.company_name}</h1>
      </div>
      <MessageThread
        messages={messages ?? []}
        currentUserId={user!.id}
        clientId={clientId}
        projectId={null}
      />
    </div>
  );
}
