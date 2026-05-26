"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Download, MessageSquare, BarChart3, LogOut, Plug, Settings } from "lucide-react";
import { logout } from "@/app/login/actions";
import { useTransition } from "react";

const nav = [
  { label: "Tableau de bord", href: "/client",              icon: LayoutDashboard },
  { label: "Mes projets",     href: "/client/projets",      icon: FolderKanban },
  { label: "Livrables",       href: "/client/livrables",    icon: Download },
  { label: "Messages",        href: "/client/messages",     icon: MessageSquare },
  { label: "Statistiques",    href: "/client/statistiques", icon: BarChart3 },
  { label: "Connexions",      href: "/client/connexions",   icon: Plug },
  { label: "Paramètres",      href: "/client/parametres",   icon: Settings },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <aside className="w-60 bg-brand-900 text-white flex flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Agence de l'Ombre" width={36} height={26} className="flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold leading-tight">Agence de l&apos;Ombre</p>
            <p className="text-xs text-brand-400">Espace client</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/client" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active ? "bg-brand-700 text-white" : "text-brand-400 hover:bg-brand-800 hover:text-white"
            )}>
              <Icon size={17} />{label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-brand-700">
        <button
          onClick={() => startTransition(() => logout())}
          disabled={pending}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800 hover:text-white transition-colors disabled:opacity-50"
        >
          <LogOut size={17} /> {pending ? "Déconnexion…" : "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
