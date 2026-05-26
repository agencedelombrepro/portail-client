import Image from "next/image";
import { LayoutDashboard, Users, FolderKanban, CheckSquare, MessageSquare, Settings, LogOut, User, Mail, Lock, Globe, Check } from "lucide-react";

const nav = [
  { label: "Dashboard",  href: "#", icon: LayoutDashboard },
  { label: "Clients",    href: "#", icon: Users },
  { label: "Projets",    href: "#", icon: FolderKanban },
  { label: "Tâches",     href: "#", icon: CheckSquare },
  { label: "Messages",   href: "#", icon: MessageSquare },
];

function Section({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-100 bg-brand-50/50">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold text-brand-900 text-sm">{title}</p>
          <p className="text-xs text-brand-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsDemo() {
  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      <aside className="w-60 bg-brand-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-brand-700">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={23} />
            <div>
              <p className="text-sm font-semibold">Agence de l&apos;Ombre</p>
              <p className="text-xs text-brand-400">Administration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800">
              <Icon size={17} />{label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-brand-700 space-y-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-brand-700 text-white">
            <Settings size={17} />Paramètres
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800">
            <LogOut size={17} />Déconnexion
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-brand-900">Johanna Goncalves</p>
              <p className="text-xs text-brand-400">Administrateur</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">JG</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">Paramètres</h1>
              <p className="text-brand-500 text-sm mt-0.5">Gérez votre compte et vos préférences</p>
            </div>

            {/* Profil */}
            <Section icon={User} title="Profil" description="Votre nom affiché dans l'interface">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Nom complet</label>
                  <input defaultValue="Johanna Goncalves" className="input" />
                </div>
                <div className="flex justify-end">
                  <button className="btn-primary">Enregistrer</button>
                </div>
              </div>
            </Section>

            {/* Langue */}
            <Section icon={Globe} title="Langue" description="Langue de l'interface">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "fr", label: "Français", flag: "🇫🇷", active: true },
                    { code: "en", label: "English",  flag: "🇬🇧" },
                    { code: "es", label: "Español",  flag: "🇪🇸" },
                  ].map((lang) => (
                    <div key={lang.code} className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer ${lang.active ? "border-accent bg-accent/5 text-accent" : "border-brand-200 text-brand-600"}`}>
                      <span className="text-lg">{lang.flag}</span>{lang.label}
                      {lang.active && <Check size={14} className="ml-auto" />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button className="btn-primary">Enregistrer</button>
                </div>
              </div>
            </Section>

            {/* Email */}
            <Section icon={Mail} title="Adresse email" description="Email utilisé pour la connexion">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Nouvelle adresse email</label>
                  <input type="email" defaultValue="hello@agencedelombre.fr" className="input" />
                  <p className="text-xs text-brand-400 mt-1">Un email de confirmation sera envoyé à la nouvelle adresse.</p>
                </div>
                <div className="flex justify-end">
                  <button className="btn-primary">Mettre à jour l&apos;email</button>
                </div>
              </div>
            </Section>

            {/* Mot de passe */}
            <Section icon={Lock} title="Mot de passe" description="Modifiez votre mot de passe de connexion">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Mot de passe actuel</label>
                  <input type="password" defaultValue="password" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Nouveau mot de passe</label>
                  <input type="password" placeholder="8 caractères minimum" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Confirmer le nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" className="input" />
                </div>
                <div className="flex justify-end">
                  <button className="btn-primary">Changer le mot de passe</button>
                </div>
              </div>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}
