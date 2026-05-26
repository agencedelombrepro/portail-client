import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientDeliverablesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("id").eq("user_id", user.id).single();
  if (!clientData) redirect("/client");

  const { data: projects } = await supabase.from("projects").select("id,name").eq("client_id", clientData.id);
  const projectIds = projects?.map((p) => p.id) ?? [];
  const projectMap = Object.fromEntries(projects?.map((p) => [p.id, p.name]) ?? []);

  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("*")
    .in("project_id", projectIds.length ? projectIds : ["__none__"])
    .order("uploaded_at", { ascending: false });

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Livrables</h1>

      {deliverables?.length === 0 ? (
        <div className="card p-8 text-center text-brand-400 text-sm">
          Aucun livrable disponible pour le moment.
        </div>
      ) : (
        <div className="card divide-y divide-brand-50">
          {deliverables?.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-brand-50 transition-colors">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-900 truncate">{d.name}</p>
                <p className="text-xs text-brand-400">
                  {projectMap[d.project_id] ?? "—"} · {formatSize(d.file_size ?? 0)}{d.file_size ? " · " : ""}{formatDate(d.uploaded_at)}
                </p>
              </div>
              {d.file_url && (
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-primary flex items-center gap-2 flex-shrink-0"
                >
                  <Download size={14} /> Télécharger
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
