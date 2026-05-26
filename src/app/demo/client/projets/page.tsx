import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const projects = [
  {
    id: "1",
    name: "Refonte site web",
    description: "Nouveau site vitrine avec CMS headless et animations modernes",
    status: "active",
    progress: 65,
    start_date: "1 avr. 2026",
    end_date: "20 juin 2026",
    milestones: [
      { title: "Brief & maquettes",       status: "completed" },
      { title: "Développement front-end", status: "completed" },
      { title: "Intégration CMS",         status: "in_progress" },
      { title: "Tests & recette",         status: "pending" },
      { title: "Mise en ligne",           status: "pending" },
    ],
  },
  {
    id: "2",
    name: "Campagne Google Ads",
    description: "Campagne Search & Display pour le lancement produit printemps",
    status: "completed",
    progress: 100,
    start_date: "1 fév. 2026",
    end_date: "31 mars 2026",
    milestones: [
      { title: "Stratégie & ciblage",  status: "completed" },
      { title: "Création des visuels", status: "completed" },
      { title: "Mise en ligne",        status: "completed" },
      { title: "Rapport final",        status: "completed" },
    ],
  },
];

const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  active: "success", paused: "warning", completed: "default", cancelled: "danger",
};
const statusLabel: Record<string, string> = {
  active: "En cours", paused: "En pause", completed: "Terminé", cancelled: "Annulé",
};

export default function DemoProjectsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Mes projets</h1>

      <div className="space-y-4">
        {projects.map((p) => {
          const done = p.milestones.filter((m) => m.status === "completed").length;
          return (
            <Link key={p.id} href={`/demo/client/projets/${p.id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-lg text-brand-900">{p.name}</p>
                  <p className="text-sm text-brand-500 mt-0.5">{p.description}</p>
                </div>
                <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
              </div>
              <ProgressBar value={p.progress} showLabel color="accent" className="mb-2" />
              <div className="flex gap-4 text-xs text-brand-400">
                <span>Démarré le {p.start_date}</span>
                <span>Fin prévue : {p.end_date}</span>
                <span>{done}/{p.milestones.length} étapes</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
