import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { TaskRow } from "./TaskRow";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; client_id?: string; priority?: string; status?: string; show_done?: string; source?: string; assignee_id?: string }>;
}) {
  const { q, client_id, priority, status, show_done, source, assignee_id } = await searchParams;
  const supabase = await createClient();

  const [tasksRes, milestonesRes, clientsRes, profilesRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, project:projects(id,name), client:clients(id,company_name), assignee:profiles(id,full_name)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("milestones")
      .select("*, project:projects(id, name, client:clients(id, company_name), assignee_id)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id,company_name").order("company_name"),
    supabase.from("profiles").select("id,full_name").in("role", ["admin", "member"]).order("full_name"),
  ]);

  type Row = {
    id: string; title: string; priority: string | null; status: string;
    due_date: string | null; description: string | null;
    client: { id: string; company_name: string } | null;
    project: { id: string; name: string } | null;
    assignee: { id: string; full_name: string } | null;
    _source: "task" | "milestone";
  };

  const tasks: Row[] = (tasksRes.data ?? []).map((t: any) => ({
    id: t.id, title: t.title, priority: t.priority, status: t.status,
    due_date: t.due_date, description: t.description,
    client: t.client, project: t.project, assignee: t.assignee,
    _source: "task",
  }));

  // Build profiles map for milestone project-assignee fallback
  const profilesMap = Object.fromEntries((profilesRes.data ?? []).map((p: any) => [p.id, p]));

  const milestones: Row[] = (milestonesRes.data ?? []).map((m: any) => ({
    id: m.id, title: m.title, priority: null,
    status: m.status === "completed" ? "done" : m.status === "in_progress" ? "in_progress" : "todo",
    due_date: m.due_date, description: null,
    client: m.project?.client ?? null,
    project: m.project ? { id: m.project.id, name: m.project.name } : null,
    // use milestone's own assignee_id or fall back to project assignee_id, both resolved via profilesMap
    assignee: (m.assignee_id ? profilesMap[m.assignee_id] : null)
           ?? (m.project?.assignee_id ? profilesMap[m.project.assignee_id] : null)
           ?? null,
    _source: "milestone",
  }));

  let all: Row[] = [...tasks, ...milestones];

  // Filters
  if (!show_done)   all = all.filter((t) => t.status !== "done" && t.status !== "completed");
  if (source === "task")      all = all.filter((t) => t._source === "task");
  if (source === "milestone") all = all.filter((t) => t._source === "milestone");
  if (client_id)   all = all.filter((t) => t.client?.id === client_id);
  if (priority)    all = all.filter((t) => t.priority === priority);
  if (status)      all = all.filter((t) => t.status === status || (status === "todo" && t.status === "pending"));
  if (assignee_id) all = all.filter((t) => t.assignee?.id === assignee_id);
  if (q)           all = all.filter((t) =>
    [t.title, t.description ?? "", t.client?.company_name ?? "", t.project?.name ?? ""].join(" ")
      .toLowerCase().includes(q.toLowerCase())
  );

  all.sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const clients  = clientsRes.data  ?? [];
  const profiles = profilesRes.data ?? [];
  const urgentCount  = all.filter((t) => t.priority === "urgent").length;
  const overdueCount = all.filter((t) => t.due_date && new Date(t.due_date) < new Date()).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Tâches</h1>
          <p className="text-brand-500 text-sm">
            {all.length} tâche{all.length !== 1 ? "s" : ""}
            {urgentCount > 0 && <span className="ml-2 text-red-500 font-semibold">· {urgentCount} urgente{urgentCount > 1 ? "s" : ""}</span>}
            {overdueCount > 0 && <span className="ml-2 text-orange-500 font-semibold">· {overdueCount} en retard</span>}
          </p>
        </div>
        <Link href="/admin/tasks/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouvelle tâche
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
          <input name="q" defaultValue={q} placeholder="Rechercher…" className="input pl-8 text-sm" />
        </div>
        <select name="client_id" defaultValue={client_id ?? ""} className="input text-sm w-auto">
          <option value="">Tous les clients</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
        <select name="source" defaultValue={source ?? ""} className="input text-sm w-auto">
          <option value="">Toutes origines</option>
          <option value="milestone">Tâches projets</option>
          <option value="task">Tâches libres</option>
        </select>
        <select name="priority" defaultValue={priority ?? ""} className="input text-sm w-auto">
          <option value="">Toutes priorités</option>
          <option value="urgent">Urgent</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
        {profiles.length > 0 && (
          <select name="assignee_id" defaultValue={assignee_id ?? ""} className="input text-sm w-auto">
            <option value="">Tous les membres</option>
            {profiles.map((p: any) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-sm text-brand-600 cursor-pointer">
          <input type="checkbox" name="show_done" value="1" defaultChecked={!!show_done} className="rounded" />
          Terminées
        </label>
        <button type="submit" className="btn-primary text-sm py-2 px-4">Filtrer</button>
        {(q || client_id || priority || status || source || assignee_id) && (
          <Link href="/admin/tasks" className="text-sm text-brand-400 hover:text-brand-700">Réinitialiser</Link>
        )}
      </form>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-50 text-xs text-brand-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Tâche</th>
              <th className="px-4 py-3 text-left">Client / Projet</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Statut</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Échéance</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Assigné</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {all.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-400 text-sm">
                {q || client_id || priority || status ? "Aucun résultat pour ces filtres." : "Aucune tâche ouverte 🎉"}
              </td></tr>
            )}
            {all.map((t) => (
              <TaskRow key={`${t._source}-${t.id}`} row={t} profiles={profiles} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
