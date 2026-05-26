import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  active: "success", paused: "warning", completed: "default", cancelled: "danger",
};
const statusLabel: Record<string, string> = {
  active: "En cours", paused: "Pause", completed: "Terminé", cancelled: "Annulé",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; client_id?: string; status?: string }>;
}) {
  const { q, client_id, status } = await searchParams;
  const supabase = await createClient();

  const [projectsRes, clientsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*, client:clients(id,company_name,logo_url,card_color)")
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id,company_name")
      .order("company_name"),
  ]);

  let projects = projectsRes.data ?? [];

  if (client_id) projects = projects.filter((p: any) => p.client?.id === client_id);
  if (status)    projects = projects.filter((p: any) => p.status === status);
  if (q)         projects = projects.filter((p: any) =>
    [p.name, p.description ?? "", p.client?.company_name ?? ""].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const clients = clientsRes.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Projets</h1>
          <p className="text-brand-500 text-sm">{projects.length} projet(s)</p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau projet
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
          <input name="q" defaultValue={q} placeholder="Rechercher un projet…" className="input pl-8 text-sm" />
        </div>
        <select name="client_id" defaultValue={client_id ?? ""} className="input text-sm w-auto">
          <option value="">Tous les clients</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="input text-sm w-auto">
          <option value="">Tous les statuts</option>
          <option value="active">En cours</option>
          <option value="paused">En pause</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
        <button type="submit" className="btn-primary text-sm py-2 px-4">Filtrer</button>
        {(q || client_id || status) && (
          <Link href="/admin/projects" className="text-sm text-brand-400 hover:text-brand-700">Réinitialiser</Link>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.length === 0 && (
          <div className="col-span-full card p-8 text-center">
            <p className="text-brand-400 text-sm">
              {q || client_id || status
                ? "Aucun résultat pour ces filtres."
                : <><Link href="/admin/projects/new" className="text-accent hover:underline">Créer le premier projet</Link></>
              }
            </p>
          </div>
        )}
        {projects.map((p: any) => {
          const color = p.client?.card_color;
          return (
          <Link key={p.id} href={`/admin/projects/${p.id}`}
            className="card hover:shadow-md transition-shadow block overflow-hidden"
            style={color && color !== "#f8fafc" ? { borderTop: `3px solid ${color}` } : undefined}
          >
            <div className="p-5">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                {p.client && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {p.client.logo_url && (
                      <img src={p.client.logo_url} alt="" className="w-4 h-4 object-contain rounded" />
                    )}
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide">{p.client.company_name}</p>
                  </div>
                )}
                <p className="font-semibold text-brand-900 truncate">{p.name}</p>
              </div>
              <Badge variant={statusVariant[p.status] ?? "default"}>{statusLabel[p.status] ?? p.status}</Badge>
            </div>
            {p.description && <p className="text-sm text-brand-500 line-clamp-2 mb-3">{p.description}</p>}
            <ProgressBar value={p.progress} showLabel className="mb-2" />
            <div className="flex items-center justify-between text-xs text-brand-400 mt-1">
              {p.start_date && <span>Début : {formatDate(p.start_date)}</span>}
              {p.end_date && <span className="font-medium">Fin : {formatDate(p.end_date)}</span>}
            </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
