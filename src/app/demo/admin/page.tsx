import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Users, FolderKanban, CheckSquare, MessageSquare, Settings, LogOut, BarChart3 } from "lucide-react";

const nav = [
  { label: "Dashboard",  href: "#", icon: LayoutDashboard, active: true },
  { label: "Clients",    href: "#", icon: Users },
  { label: "Projets",    href: "#", icon: FolderKanban },
  { label: "Tâches",     href: "#", icon: CheckSquare },
  { label: "Messages",   href: "#", icon: MessageSquare },
];

const kpis = [
  { label: "Clients actifs",   value: 12, color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "Projets en cours", value: 7,  color: "text-green-600",  bg: "bg-green-50" },
  { label: "Tâches ouvertes",  value: 23, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Messages non lus", value: 3,  color: "text-purple-600", bg: "bg-purple-50" },
];

const projects = [
  { name: "Refonte site web", client: "Acme Corp",      status: "active",    progress: 65 },
  { name: "Campagne SEO",     client: "Studio Lumière", status: "active",    progress: 40 },
  { name: "App mobile",       client: "TechStart",      status: "paused",    progress: 20 },
  { name: "Identité visuelle",client: "Café Néon",      status: "completed", progress: 100 },
];

const tasks = [
  { title: "Livraison maquettes v2",    client: "Acme Corp",      due: "28 mai" },
  { title: "Rapport analytics juin",    client: "Studio Lumière", due: "1 juin" },
  { title: "Révision contenu page accueil", client: "TechStart",  due: "3 juin" },
];

export default function AdminDemo() {
  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-brand-700">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={23} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-tight">Agence de l&apos;Ombre</p>
              <p className="text-xs text-brand-400">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ label, href, icon: Icon, active }) => (
            <a key={label} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-brand-700 text-white" : "text-brand-400 hover:bg-brand-800"}`}>
              <Icon size={17} />{label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-brand-700 space-y-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800"><Settings size={17} />Paramètres</a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800"><LogOut size={17} />Déconnexion</a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-brand-900">Johanna Goncalves</p>
              <p className="text-xs text-brand-400">Administrateur</p>
            </div>
            <Avatar name="Johanna Goncalves" size="sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
            <p className="text-brand-500 text-sm mt-0.5">Vue d&apos;ensemble de l&apos;agence</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {kpis.map(({ label, value, color, bg }) => (
              <div key={label} className="card p-5 flex items-start justify-between">
                <div>
                  <p className="text-sm text-brand-500">{label}</p>
                  <p className="text-3xl font-bold text-brand-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <BarChart3 size={20} className={color} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Projects */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-brand-900">Projets récents</h2>
                <span className="text-xs text-accent">Voir tout</span>
              </div>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-brand-900">{p.name}</span>
                        <Badge variant={p.status === "active" ? "success" : p.status === "paused" ? "warning" : "default"}>
                          {p.status === "active" ? "En cours" : p.status === "paused" ? "Pause" : "Terminé"}
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-400">{p.client}</p>
                      <ProgressBar value={p.progress} showLabel className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-brand-900">Tâches urgentes</h2>
                <span className="text-xs text-accent">Voir tout</span>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.title} className="flex items-start gap-3 p-3 rounded-lg bg-brand-50">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-brand-900">{t.title}</p>
                      <p className="text-xs text-brand-400">{t.client} · {t.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
