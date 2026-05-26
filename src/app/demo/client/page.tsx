import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { FolderKanban, Download, MessageSquare, BarChart3, CheckCircle2, Clock, Circle } from "lucide-react";

const milestones = [
  { title: "Brief & maquettes",       status: "completed",  date: "Complété le 5 mai" },
  { title: "Développement front-end", status: "completed",  date: "Complété le 15 mai" },
  { title: "Intégration CMS",         status: "in_progress",date: "En cours" },
  { title: "Tests & recette",         status: "pending",    date: "Prévu le 10 juin" },
  { title: "Mise en ligne",           status: "pending",    date: "Prévu le 20 juin" },
];

const deliverables = [
  { name: "Maquettes_v2_finale.fig",  size: "4.2 MB", date: "15 mai" },
  { name: "Charte_graphique.pdf",     size: "2.1 MB", date: "3 mai" },
  { name: "Contenu_pages.docx",       size: "890 KB", date: "28 avr" },
];

const shortcuts = [
  { label: "Mes projets",  href: "/demo/client/projets",      icon: FolderKanban, desc: "1 projet actif" },
  { label: "Messages",     href: "/demo/client/messages",     icon: MessageSquare, desc: "2 non lus" },
  { label: "Livrables",    href: "/demo/client/livrables",    icon: Download, desc: "3 fichiers" },
  { label: "Statistiques", href: "/demo/client/statistiques", icon: BarChart3, desc: "Performances site" },
];

export default function DemoClientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Bonjour Jean 👋</h1>
        <p className="text-brand-500 text-sm mt-0.5">Voici l&apos;avancement de vos projets avec l&apos;Agence de l&apos;Ombre.</p>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shortcuts.map(({ label, href, icon: Icon, desc }) => (
          <Link key={label} href={href} className="card p-4 hover:shadow-md transition-shadow block">
            <Icon size={22} className="text-accent mb-2" />
            <p className="font-medium text-brand-900 text-sm">{label}</p>
            <p className="text-xs text-brand-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project progress */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-lg text-brand-900">Refonte site web</p>
              <p className="text-xs text-brand-400 mt-0.5">Fin prévue : 20 juin 2026</p>
            </div>
            <Badge variant="success">En cours</Badge>
          </div>
          <ProgressBar value={65} showLabel color="accent" className="mb-4" />

          <div className="relative pl-6">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-brand-100" />
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.title} className="relative flex gap-3 items-start">
                  <div className="absolute -left-6 top-0.5">
                    {m.status === "completed"  ? <CheckCircle2 size={17} className="text-green-500" /> :
                     m.status === "in_progress" ? <Clock size={17} className="text-yellow-500" /> :
                     <Circle size={17} className="text-brand-300" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${m.status === "completed" ? "text-brand-400 line-through" : "text-brand-900"}`}>{m.title}</p>
                    <p className="text-xs text-brand-400">{m.date}</p>
                  </div>
                  <Badge variant={m.status === "completed" ? "success" : m.status === "in_progress" ? "warning" : "default"}>
                    {m.status === "completed" ? "✓ Fait" : m.status === "in_progress" ? "En cours" : "À venir"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deliverables + messages */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Derniers livrables</h2>
            <Link href="/demo/client/livrables" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-2 mb-5">
            {deliverables.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-brand-50">
                <div>
                  <p className="text-sm font-medium text-brand-900">{d.name}</p>
                  <p className="text-xs text-brand-400">{d.size} · {d.date}</p>
                </div>
                <button className="btn-primary text-xs px-3 py-1.5">Télécharger</button>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-brand-900 text-sm">Messages récents</h3>
              <Link href="/demo/client/messages" className="text-xs text-accent hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2.5">
                <Avatar name="Johanna G" size="sm" />
                <div className="bg-brand-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-brand-900 max-w-xs">
                  Les maquettes de la v2 sont disponibles en livrables !
                </div>
              </div>
              <div className="flex gap-2.5 flex-row-reverse">
                <Avatar name="Jean Dupont" size="sm" />
                <div className="bg-brand-900 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-xs">
                  Super, merci ! Je les consulte ce soir.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
