import { createClient } from "@/lib/supabase/server";
import { Users, FolderKanban, CheckSquare, MessageSquare, AlertCircle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

function workloadLevel(score: number): { label: string; color: string; bg: string; bar: string; width: string } {
  if (score === 0)  return { label: "Libre",        color: "text-green-700",  bg: "bg-green-50",   bar: "bg-green-400",  width: "w-0" };
  if (score <= 4)   return { label: "Chargé",       color: "text-blue-700",   bg: "bg-blue-50",    bar: "bg-blue-400",   width: "w-1/4" };
  if (score <= 9)   return { label: "Très chargé",  color: "text-orange-700", bg: "bg-orange-50",  bar: "bg-orange-400", width: "w-2/4" };
  if (score <= 16)  return { label: "Surchargé",    color: "text-red-700",    bg: "bg-red-50",     bar: "bg-red-500",    width: "w-3/4" };
  return              { label: "Critique",       color: "text-red-800",    bg: "bg-red-100",    bar: "bg-red-600",    width: "w-full" };
}

function pressureScore(tasks: { due_date: string | null; status: string }[]): number {
  const now = Date.now();
  const week = 7 * 86400000;
  const month = 30 * 86400000;
  return tasks.reduce((acc, t) => {
    if (t.status === "done" || t.status === "completed") return acc;
    if (!t.due_date) return acc + 0.5;
    const diff = new Date(t.due_date).getTime() - now;
    if (diff < 0)      return acc + 4;   // overdue
    if (diff < week)   return acc + 3;   // this week
    if (diff < month)  return acc + 1.5; // this month
    return acc + 0.5;                    // later
  }, 0);
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: clientCount },
    { count: projectCount },
    { count: taskCount },
    { count: unreadCount },
    { data: recentProjects },
    { data: urgentTasks },
    { data: teamProfiles },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("projects").select("id,name,status,progress,end_date,client:clients(company_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id,title,priority,due_date,client:clients(company_name)").eq("priority", "urgent").neq("status", "done").limit(5),
    supabase.from("profiles").select("id,full_name").in("role", ["admin", "member"]).order("full_name"),
  ]);

  // Workload per team member
  const teamWorkload = teamProfiles
    ? await Promise.all(teamProfiles.map(async (p) => {
        const [{ data: myTasks }, { data: myMilestones }] = await Promise.all([
          supabase.from("tasks").select("due_date,status").eq("assignee_id", p.id).neq("status", "done"),
          supabase.from("milestones").select("due_date,status").eq("assignee_id", p.id).neq("status", "completed"),
        ]);
        const all = [...(myTasks ?? []), ...(myMilestones ?? [])];
        const score = pressureScore(all);
        return { ...p, taskCount: all.length, score };
      }))
    : [];

  const { data: allClients } = await supabase
    .from("clients")
    .select("id,company_name,prestation,presta_end_date")
    .not("presta_end_date", "is", null);

  const today = Date.now();
  const expiringSoon = (allClients ?? []).filter((c) => {
    const d = Math.ceil((new Date(c.presta_end_date!).getTime() - today) / 86400000);
    return d >= 0 && d <= 30;
  }).map((c) => ({
    ...c,
    daysLeft: Math.ceil((new Date(c.presta_end_date!).getTime() - today) / 86400000),
  }));

  const stats = [
    { label: "Clients actifs",   value: clientCount ?? 0,  icon: Users,          color: "text-blue-600",  bg: "bg-blue-50" },
    { label: "Projets en cours", value: projectCount ?? 0, icon: FolderKanban,   color: "text-green-600", bg: "bg-green-50" },
    { label: "Tâches ouvertes",  value: taskCount ?? 0,    icon: CheckSquare,    color: "text-orange-600",bg: "bg-orange-50" },
    { label: "Messages non lus", value: unreadCount ?? 0,  icon: MessageSquare,  color: "text-purple-600",bg: "bg-purple-50" },
  ];

  const projectStatusBadge: Record<string, { label: string; variant: "success" | "warning" | "default" | "danger" }> = {
    active:    { label: "En cours",   variant: "success" },
    paused:    { label: "Pause",      variant: "warning" },
    completed: { label: "Terminé",    variant: "default" },
    cancelled: { label: "Annulé",     variant: "danger" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
        <p className="text-brand-500 text-sm mt-0.5">Vue d&apos;ensemble de l&apos;agence</p>
      </div>

      {/* Expiring prestations alert */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                {expiringSoon.length} prestation{expiringSoon.length > 1 ? "s" : ""} à renouveler dans moins de 30 jours
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                {expiringSoon.map((c) => (
                  <Link key={c.id} href={`/admin/clients/${c.id}`} className="text-sm text-orange-700 hover:underline">
                    {c.company_name} · {c.daysLeft === 0 ? "aujourd'hui" : `${c.daysLeft}j`}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-brand-500">{label}</p>
                <p className="text-3xl font-bold text-brand-900 mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Projets récents</h2>
            <Link href="/admin/projects" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {recentProjects?.length === 0 && (
              <p className="text-sm text-brand-400 text-center py-4">Aucun projet pour l&apos;instant</p>
            )}
            {recentProjects?.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/admin/projects/${p.id}`} className="text-sm font-medium text-brand-900 hover:text-accent truncate">
                      {p.name}
                    </Link>
                    <Badge variant={projectStatusBadge[p.status]?.variant ?? "default"}>
                      {projectStatusBadge[p.status]?.label ?? p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-400">{(p.client as any)?.company_name}</p>
                  <ProgressBar value={p.progress} showLabel className="mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Tâches urgentes</h2>
            <Link href="/admin/tasks" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {urgentTasks?.length === 0 && (
              <p className="text-sm text-brand-400 text-center py-4">Aucune tâche urgente</p>
            )}
            {urgentTasks?.map((t: any) => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-brand-50">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-900 truncate">{t.title}</p>
                  <p className="text-xs text-brand-400">{(t.client as any)?.company_name ?? "—"}{t.due_date ? ` · ${formatDate(t.due_date)}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team workload */}
      {teamWorkload.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Charge de l&apos;équipe</h2>
            <Link href="/admin/equipe" className="text-xs text-accent hover:underline">Voir l'équipe</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {teamWorkload.map((m) => {
              const lvl = workloadLevel(m.score);
              const initials = m.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <Link key={m.id} href={`/admin/tasks?assignee_id=${m.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-brand-100 hover:border-accent/30 hover:bg-brand-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${lvl.bg} ${lvl.color}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-900 truncate">{m.full_name.split(" ")[0]}</p>
                    <p className={`text-xs font-medium ${lvl.color}`}>{lvl.label}</p>
                    <div className="mt-1.5 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${lvl.bar} ${lvl.width}`} />
                    </div>
                    <p className="text-xs text-brand-400 mt-1">{m.taskCount} tâche{m.taskCount !== 1 ? "s" : ""} ouvertes</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
