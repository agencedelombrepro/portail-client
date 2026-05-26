import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

export default async function ClientProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  if (!clientData) redirect("/client");

  const { data: projects } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("client_id", clientData.id)
    .order("created_at", { ascending: false });

  const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
    active: "success", paused: "warning", completed: "default", cancelled: "danger",
  };
  const statusLabel: Record<string, string> = {
    active: "En cours", paused: "En pause", completed: "Terminé", cancelled: "Annulé",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Mes projets</h1>

      <div className="space-y-4">
        {projects?.length === 0 && (
          <div className="card p-8 text-center text-brand-400 text-sm">Aucun projet pour le moment.</div>
        )}
        {projects?.map((p: any) => {
          const milestones = (p.milestones ?? []) as any[];
          const done = milestones.filter((m: any) => m.status === "completed").length;
          return (
            <Link key={p.id} href={`/client/projets/${p.id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-lg text-brand-900">{p.name}</p>
                  {p.description && <p className="text-sm text-brand-500 mt-0.5">{p.description}</p>}
                </div>
                <Badge variant={statusVariant[p.status] ?? "default"}>{statusLabel[p.status] ?? p.status}</Badge>
              </div>
              <ProgressBar value={p.progress} showLabel color="accent" className="mb-2" />
              <div className="flex gap-4 text-xs text-brand-400">
                {p.start_date && <span>Démarré le {formatDate(p.start_date)}</span>}
                {p.end_date && <span>Fin prévue : {formatDate(p.end_date)}</span>}
                {milestones.length > 0 && <span>{done}/{milestones.length} étapes</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
