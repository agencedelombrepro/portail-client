import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Circle, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const PROJECTS: Record<string, {
  name: string; description: string; status: string; progress: number;
  start_date: string; end_date: string;
  milestones: { title: string; status: string; date: string; description?: string }[];
  deliverables: { name: string; size: string; date: string }[];
}> = {
  "1": {
    name: "Refonte site web",
    description: "Nouveau site vitrine avec CMS headless et animations modernes",
    status: "active", progress: 65,
    start_date: "1 avr. 2026", end_date: "20 juin 2026",
    milestones: [
      { title: "Brief & maquettes",       status: "completed",  date: "Complété le 5 mai",    description: "Validation du brief créatif et des maquettes Figma" },
      { title: "Développement front-end", status: "completed",  date: "Complété le 15 mai",   description: "Intégration HTML/CSS et animations" },
      { title: "Intégration CMS",         status: "in_progress",date: "En cours",             description: "Connexion au CMS et configuration des contenus" },
      { title: "Tests & recette",         status: "pending",    date: "Prévu le 10 juin",     description: "Tests cross-browser, performances, accessibilité" },
      { title: "Mise en ligne",           status: "pending",    date: "Prévu le 20 juin",     description: "Déploiement et migration DNS" },
    ],
    deliverables: [
      { name: "Maquettes_v2_finale.fig", size: "4.2 MB", date: "15 mai" },
      { name: "Charte_graphique.pdf",    size: "2.1 MB", date: "3 mai" },
    ],
  },
  "2": {
    name: "Campagne Google Ads",
    description: "Campagne Search & Display pour le lancement produit printemps",
    status: "completed", progress: 100,
    start_date: "1 fév. 2026", end_date: "31 mars 2026",
    milestones: [
      { title: "Stratégie & ciblage",  status: "completed", date: "Complété le 5 fév.",  description: "Définition des audiences et mots-clés" },
      { title: "Création des visuels", status: "completed", date: "Complété le 12 fév.", description: "Visuels Display et annonces textuelles" },
      { title: "Mise en ligne",        status: "completed", date: "Complété le 1 mars",  description: "Activation de la campagne" },
      { title: "Rapport final",        status: "completed", date: "Complété le 5 avr.",  description: "Rapport de performance et recommandations" },
    ],
    deliverables: [
      { name: "Rapport_campagne_Q1.pdf", size: "1.8 MB", date: "5 avr." },
      { name: "Visuels_Display.zip",     size: "12.4 MB",date: "12 fév." },
    ],
  },
};

const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  active: "success", paused: "warning", completed: "default", cancelled: "danger",
};
const statusLabel: Record<string, string> = {
  active: "En cours", paused: "En pause", completed: "Terminé", cancelled: "Annulé",
};

export default function DemoProjectDetailPage({ params }: { params: { id: string } }) {
  const project = PROJECTS[params.id] ?? PROJECTS["1"];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/demo/client/projets" className="text-brand-400 hover:text-brand-700">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-900">{project.name}</h1>
            <Badge variant={statusVariant[project.status]}>{statusLabel[project.status]}</Badge>
          </div>
          <p className="text-brand-500 text-sm mt-0.5">{project.description}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex justify-between text-xs text-brand-400 mb-2">
          <span>Démarré le {project.start_date}</span>
          <span>Fin prévue : {project.end_date}</span>
        </div>
        <ProgressBar value={project.progress} showLabel color="accent" />
      </div>

      {/* Milestones */}
      <div className="card p-5">
        <h2 className="font-semibold text-brand-900 mb-4">Avancement</h2>
        <div className="relative pl-6">
          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-brand-100" />
          <div className="space-y-4">
            {project.milestones.map((m) => (
              <div key={m.title} className="relative">
                <div className="absolute -left-6 top-0.5">
                  {m.status === "completed"   ? <CheckCircle2 size={17} className="text-green-500" /> :
                   m.status === "in_progress" ? <Clock size={17} className="text-yellow-500" /> :
                   <Circle size={17} className="text-brand-300" />}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${m.status === "completed" ? "text-brand-400 line-through" : "text-brand-900"}`}>{m.title}</p>
                    {m.description && <p className="text-xs text-brand-400 mt-0.5">{m.description}</p>}
                    <p className="text-xs text-brand-400 mt-0.5">{m.date}</p>
                  </div>
                  <Badge variant={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "default"}>
                    {m.status === "completed" ? "✓ Fait" : m.status === "in_progress" ? "En cours" : "À venir"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliverables */}
      {project.deliverables.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-brand-900 mb-4">Livrables du projet</h2>
          <div className="space-y-2">
            {project.deliverables.map((d) => (
              <div key={d.name} className="flex items-center gap-4 p-3 rounded-lg bg-brand-50">
                <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-900 text-sm truncate">{d.name}</p>
                  <p className="text-xs text-brand-400">{d.size} · {d.date}</p>
                </div>
                <button className="btn-primary flex items-center gap-2 text-xs px-3 py-1.5">
                  <Download size={12} /> Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
