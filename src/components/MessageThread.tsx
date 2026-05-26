"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import type { Message } from "@/types";

interface Props {
  messages: (Message & { sender?: { id: string; full_name: string; role: string; avatar_url: string | null } | null })[];
  currentUserId: string;
  clientId: string;
  projectId: string | null;
}

export default function MessageThread({ messages: initial, currentUserId, clientId, projectId }: Props) {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:client:${clientId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `client_id=eq.${clientId}` }, async (payload) => {
        const { data } = await supabase.from("messages").select("*, sender:profiles!messages_sender_id_fkey(id,full_name,role,avatar_url)").eq("id", payload.new.id).single();
        if (data) setMessages((prev) => [...prev, data as any]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  async function handleSend() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    await supabase.from("messages").insert({
      client_id:  clientId,
      project_id: projectId,
      sender_id:  currentUserId,
      content,
      is_read:    false,
    });
    setSending(false);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden card">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-brand-400 text-center py-8">Démarrer la conversation...</p>
        )}
        {messages.map((m) => {
          const isOwn = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar name={m.sender?.full_name ?? "?"} src={m.sender?.avatar_url} size="sm" />
              <div className={`max-w-sm ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-brand-900 text-white rounded-tr-sm" : "bg-brand-100 text-brand-900 rounded-tl-sm"}`}>
                  {m.content}
                </div>
                <p className="text-xs text-brand-400 mt-1 px-1">{formatDateTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-brand-100 p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Écrire un message..."
          className="input flex-1"
        />
        <button onClick={handleSend} disabled={!text.trim() || sending} className="btn-primary px-3">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
