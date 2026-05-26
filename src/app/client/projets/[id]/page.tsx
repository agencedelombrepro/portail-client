import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

export default async function ClientProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  if (!clientData) redirect("/client");

  const [{ data: project }, { data: milestones }, { data: deliverables }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("client_id", clientData.id).single(),
    supabase.from("milestones").select("*").eq("project_id", id).order("order"),
    supabase.from("deliverables").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
  ]);

  if (!project) notFound();

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 size={18} className="text-green-500" />;
    if (status === "in_progress") return <Clock size={18} className="text-yellow-500" />;
    return <Circle size={18} className="text-brand-300" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/client/projets" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-brand-900">{project.name}</h1>
      </div>

      {/* Progress card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-brand-900">Avancement global</h2>
          <span className="text-3xl font-bold text-accent">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} color="accent" />
        <div className="flex gap-6 mt-3 text-sm text-brand-400">
          {project.start_date && <span>Début : {formatDate(project.start_date)}</span>}
          {project.end_date && <span>Fin prévue : {formatDate(project.end_date)}</span>}
        </div>
      </div>

      {/* Timeline / Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-brand-900 mb-4">Étapes du projet</h2>
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-brand-100" />
            <div className="space-y-4">
              {milestones.map((m) => (
                <div key={m.id} className="relative flex gap-4">
                  <div className="absolute -left-6 top-0.5">{statusIcon(m.status)}</div>
                  <div className="flex-1 pb-2">
                    <p className={`font-medium text-sm ${m.status === "completed" ? "text-brand-400 line-through" : "text-brand-900"}`}>
                      {m.title}
                    </p>
                    {m.description && <p className="text-xs text-brand-400 mt-0.5">{m.description}</p>}
                    {m.due_date && (
                      <p className="text-xs text-brand-400 mt-0.5">
                        {m.status === "completed" && m.completed_at
                          ? `Complété le ${formatDate(m.completed_at)}`
                          : `Prévu le ${formatDate(m.due_date)}`}
                      </p>
                    )}
                  </div>
                  <Badge variant={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "default"} className="self-start">
                    {m.status === "completed" ? "✓ Fait" : m.status === "in_progress" ? "En cours" : "À venir"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deliverables */}
      {deliverables && deliverables.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-brand-900 mb-4">Livrables de ce projet</h2>
          <div className="space-y-2">
            {deliverables.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-50">
                <div>
                  <p className="text-sm font-medium text-brand-900">{d.name}</p>
                  <p className="text-xs text-brand-400">
                    {d.file_size ? formatSize(d.file_size) : ""} · {formatDate(d.uploaded_at)}
                  </p>
                </div>
                {d.file_url && (
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" download className="btn-secondary text-xs px-3 py-1.5">
                    Télécharger
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
