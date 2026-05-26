import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";
import MilestoneActions from "./MilestoneActions";
import DeliverablesList from "./DeliverablesList";
import { MilestoneRow } from "./MilestoneRow";
import { DeleteProjectButton } from "./DeleteProjectButton";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const isAdmin = currentProfile?.role === "admin";

  const [{ data: project }, { data: milestones }, { data: deliverables }, { data: profiles }] = await Promise.all([
    supabase.from("projects").select("*, client:clients(id,company_name)").eq("id", id).single(),
    supabase.from("milestones").select("*").eq("project_id", id).order("order"),
    supabase.from("deliverables").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
    supabase.from("profiles").select("id,full_name").in("role", ["admin", "member"]).order("full_name"),
  ]);

  if (!project) notFound();

  const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
    active: "success", paused: "warning", completed: "default", cancelled: "danger", lead: "info" as never,
  };
  const statusLabel: Record<string, string> = {
    active: "En cours", paused: "Pause", completed: "Terminé", cancelled: "Annulé", lead: "Lead",
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-900">{project.name}</h1>
              <Badge variant={statusVariant[project.status] ?? "default"}>{statusLabel[project.status] ?? project.status}</Badge>
            </div>
            <Link href={`/admin/clients/${(project.client as any)?.id}`} className="text-brand-400 text-sm hover:text-accent">
              {(project.client as any)?.company_name}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/projects/${id}/edit`} className="btn-secondary flex items-center gap-2">
            <Pencil size={14} /> Modifier
          </Link>
          {isAdmin && <DeleteProjectButton projectId={id} />}
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-brand-900">Avancement</h2>
          <span className="text-2xl font-bold text-brand-900">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} color="accent" />
        <div className="flex gap-6 mt-3 text-xs text-brand-400">
          {project.start_date && <span>Début : {formatDate(project.start_date)}</span>}
          {project.end_date && <span>Fin : {formatDate(project.end_date)}</span>}
        </div>
      </div>

      {/* Milestones */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-900">Étapes</h2>
          <MilestoneActions projectId={id} mode="add" />
        </div>
        <div className="space-y-1">
          {milestones?.length === 0 && <p className="text-sm text-brand-400 text-center py-4">Aucune étape définie</p>}
          {milestones?.map((m) => (
            <MilestoneRow key={m.id} milestone={m} projectId={id} profiles={profiles ?? []} />
          ))}
        </div>
      </div>

      {/* Deliverables */}
      <DeliverablesList projectId={id} deliverables={deliverables ?? []} />
    </div>
  );
}
