"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Mail, Globe, ChevronRight } from "lucide-react";
import { updateClientStatusAction } from "../actions";

const COLUMNS = [
  { status: "prospect", label: "Prospects",  color: "border-t-blue-400",   bg: "bg-blue-50",   dot: "bg-blue-400"   },
  { status: "actif",    label: "Actifs",     color: "border-t-green-400",  bg: "bg-green-50",  dot: "bg-green-400"  },
  { status: "pause",    label: "En pause",   color: "border-t-orange-400", bg: "bg-orange-50", dot: "bg-orange-400" },
  { status: "terminé",  label: "Terminés",   color: "border-t-brand-300",  bg: "bg-brand-50",  dot: "bg-brand-300"  },
] as const;

type Client = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  website: string | null;
  prestation: string | null;
  prestations: string[] | null;
  client_status: string;
  presta_end_date: string | null;
};

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function ClientCard({ client, allStatuses, onMove }: {
  client: Client;
  allStatuses: readonly { status: string; label: string }[];
  onMove: (id: string, status: string) => void;
}) {
  const endDays = daysUntil(client.presta_end_date);
  const endSoon = endDays !== null && endDays >= 0 && endDays <= 30;
  const ended = endDays !== null && endDays < 0;
  const otherStatuses = allStatuses.filter((c) => c.status !== client.client_status);
  const prestationList = client.prestations?.length ? client.prestations : client.prestation ? [client.prestation] : [];

  return (
    <div className="bg-white rounded-lg border border-brand-100 shadow-sm p-3 group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/clients/${client.id}`} className="font-medium text-sm text-brand-900 hover:text-accent leading-tight flex-1 min-w-0 truncate">
          {client.company_name}
        </Link>
      </div>
      <p className="text-xs text-brand-400 mt-0.5">{client.contact_name}</p>
      {prestationList.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {prestationList.map((p) => (
            <span key={p} className="text-xs text-accent font-medium bg-accent/5 px-1.5 py-0.5 rounded truncate max-w-full">{p}</span>
          ))}
        </div>
      )}
      {client.presta_end_date && (
        <p className={`text-xs mt-1 font-medium ${ended ? "text-red-500" : endSoon ? "text-orange-500" : "text-brand-400"}`}>
          Fin : {new Date(client.presta_end_date).toLocaleDateString("fr-FR")}
          {endSoon && ` (${endDays}j)`}
          {ended && " · expiré"}
        </p>
      )}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-brand-50">
        <a href={`mailto:${client.email}`} className="text-brand-300 hover:text-accent transition-colors">
          <Mail size={12} />
        </a>
        {client.website && (
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:text-accent transition-colors">
            <Globe size={12} />
          </a>
        )}
        <div className="ml-auto flex gap-1">
          {otherStatuses.map((col) => (
            <button
              key={col.status}
              onClick={() => onMove(client.id, col.status)}
              title={`Déplacer vers ${col.label}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-400 hover:text-accent flex items-center gap-0.5"
            >
              → {col.label.substring(0, 3)}
            </button>
          ))}
        </div>
        <Link href={`/admin/clients/${client.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-300 hover:text-accent ml-1">
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialClients }: { initialClients: Client[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticClients, addOptimistic] = useOptimistic(
    initialClients,
    (state, { id, status }: { id: string; status: string }) =>
      state.map((c) => c.id === id ? { ...c, client_status: status } : c)
  );

  function moveClient(id: string, newStatus: string) {
    startTransition(async () => {
      addOptimistic({ id, status: newStatus });
      await updateClientStatusAction(id, newStatus);
    });
  }

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 min-h-[400px] ${isPending ? "opacity-90" : ""}`}>
      {COLUMNS.map((col) => {
        const colClients = optimisticClients.filter((c) => c.client_status === col.status);
        return (
          <div key={col.status} className={`rounded-xl border-t-4 ${col.color} bg-white shadow-sm flex flex-col`}>
            <div className={`px-4 py-3 border-b border-brand-100 ${col.bg} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="font-semibold text-brand-800 text-sm">{col.label}</span>
                </div>
                <span className="text-xs text-brand-400 font-medium bg-white/80 px-2 py-0.5 rounded-full">{colClients.length}</span>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {colClients.length === 0 && (
                <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-brand-100">
                  <p className="text-xs text-brand-300">Aucun client</p>
                </div>
              )}
              {colClients.map((c) => (
                <ClientCard key={c.id} client={c} allStatuses={COLUMNS} onMove={moveClient} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
