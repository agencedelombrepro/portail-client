import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessageThread from "@/components/MessageThread";

export default async function ClientMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  if (!clientData) redirect("/client");

  const { data: messages } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(id,full_name,role,avatar_url)")
    .eq("client_id", clientData.id)
    .order("created_at");

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("client_id", clientData.id)
    .eq("is_read", false)
    .neq("sender_id", user.id);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-900 mb-4">Messages</h1>
      <MessageThread
        messages={messages ?? []}
        currentUserId={user.id}
        clientId={clientData.id}
        projectId={null}
      />
    </div>
  );
}
