"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Send } from "lucide-react";

type Message = { id: number; sender: string; role: "admin" | "client"; content: string; time: string };

const initial: Message[] = [
  { id: 1, sender: "Johanna G",   role: "admin",  content: "Bonjour Jean ! Je vous confirme que nous avons bien démarré la phase d'intégration CMS. Tout se passe bien 👌", time: "10:14" },
  { id: 2, sender: "Jean Dupont", role: "client", content: "Super ! Vous avez une idée du délai pour cette étape ?", time: "10:21" },
  { id: 3, sender: "Johanna G",   role: "admin",  content: "On est sur une dizaine de jours. On vise une mise en recette autour du 10 juin.", time: "10:23" },
  { id: 4, sender: "Jean Dupont", role: "client", content: "Parfait. Les maquettes étaient vraiment top au passage 🔥", time: "10:25" },
  { id: 5, sender: "Johanna G",   role: "admin",  content: "Merci ! On a hâte que vous voyiez le résultat final. Les maquettes sont disponibles dans la section Livrables si vous voulez les revoir.", time: "10:27" },
];

export default function DemoMessagesPage() {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: Date.now(), sender: "Jean Dupont", role: "client", content: input.trim(), time: now }]);
    setInput("");

    // Simulate agency reply after 1.2s
    const replies = [
      "Bien reçu ! Je transmets à l'équipe.",
      "Merci pour le retour, on en tient compte.",
      "Noté 👍 On vous tient au courant.",
      "Parfait, je reviens vers vous rapidement.",
    ];
    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, {
        id: Date.now() + 1,
        sender: "Johanna G",
        role: "admin",
        content: replies[Math.floor(Math.random() * replies.length)],
        time: now2,
      }]);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-900 mb-4">Messages</h1>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "client" ? "flex-row-reverse" : ""}`}>
              <Avatar name={m.sender} size="sm" />
              <div className={`max-w-xs ${m.role === "client" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  m.role === "client"
                    ? "bg-brand-900 text-white rounded-tr-sm"
                    : "bg-brand-100 text-brand-900 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
                <span className="text-xs text-brand-400 mt-1 px-1">{m.time}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-brand-100 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Écrire un message…"
            className="input flex-1 text-sm"
          />
          <button onClick={send} disabled={!input.trim()} className="btn-primary px-3 disabled:opacity-40">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
