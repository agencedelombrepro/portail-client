import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FolderKanban, MessageSquare, Download, BarChart3 } from "lucide-react";

export default async function ClientDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("*").eq("user_id", user.id).single();
  if (!clientData) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("client_id", clientData.id)
    .eq("status", "active");

  const projectIds = projects?.map((p) => p.id) ?? [];

  const [{ data: unreadMessages }, { data: deliverables }] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact" }).eq("client_id", clientData.id).eq("is_read", false).neq("sender_id", user.id),
    supabase.from("deliverables").select("*").in("project_id", projectIds.length ? projectIds : ["__none__"]).order("uploaded_at", { ascending: false }).limit(3),
  ]);

  const statusVariant: Record<string, "success" | "warning" | "default"> = {
    active: "success", paused: "warning", completed: "default",
  };
  const statusLabel: Record<string, string> = {
    active: "En cours", paused: "En pause", completed: "Terminé",
  };

  const shortcuts = [
    { label: "Mes projets",  href: "/client/projets",      icon: FolderKanban,  desc: `${projects?.length ?? 0} projet(s) actif(s)` },
    { label: "Messages",     href: "/client/messages",     icon: MessageSquare, desc: unreadMessages?.length ? `${unreadMessages.length} non lu(s)` : "Tout à jour" },
    { label: "Livrables",    href: "/client/livrables",    icon: Download,      desc: "Télécharger vos fichiers" },
    { label: "Statistiques", href: "/client/statistiques", icon: BarChart3,     desc: "Performances de votre site" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Bonjour 👋</h1>
        <p className="text-brand-500 text-sm mt-0.5">Voici l&apos;avancement de vos projets avec l&apos;Agence de l&apos;Ombre.</p>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href} className="card p-4 hover:shadow-md transition-shadow">
            <Icon size={22} className="text-accent mb-2" />
            <p className="font-medium text-brand-900 text-sm">{label}</p>
            <p className="text-xs text-brand-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Active projects */}
      <div>
        <h2 className="font-semibold text-brand-900 mb-3">Projets en cours</h2>
        <div className="space-y-4">
          {projects?.length === 0 && (
            <div className="card p-6 text-center text-brand-400 text-sm">Aucun projet actif pour le moment.</div>
          )}
          {projects?.map((p: any) => {
            const milestones = (p.milestones ?? []) as any[];
            const done = milestones.filter((m: any) => m.status === "completed").length;
            return (
              <Link key={p.id} href={`/client/projets/${p.id}`} className="card p-5 block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-brand-900">{p.name}</p>
                    {p.end_date && <p className="text-xs text-brand-400 mt-0.5">Fin prévue : {formatDate(p.end_date)}</p>}
                  </div>
                  <Badge variant={statusVariant[p.status] ?? "default"}>{statusLabel[p.status] ?? p.status}</Badge>
                </div>
                <ProgressBar value={p.progress} showLabel color="accent" />
                {milestones.length > 0 && (
                  <p className="text-xs text-brand-400 mt-2">{done}/{milestones.length} étape(s) complétée(s)</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent deliverables */}
      {(deliverables?.length ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-brand-900">Derniers livrables</h2>
            <Link href="/client/livrables" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="card divide-y divide-brand-50">
            {deliverables?.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-brand-900">{d.name}</p>
                  <p className="text-xs text-brand-400">{formatDate(d.uploaded_at)}</p>
                </div>
                {d.file_url && (
                  <a href={d.file_url} download target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5">
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
