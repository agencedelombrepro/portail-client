"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Settings,
  LogOut,
  BarChart2,
  UsersRound,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { useTransition } from "react";

const navAll = [
  { label: "Dashboard",     href: "/admin",             icon: LayoutDashboard },
  { label: "Clients",       href: "/admin/clients",     icon: Users },
  { label: "Projets",       href: "/admin/projects",    icon: FolderKanban },
  { label: "Tâches",        href: "/admin/tasks",       icon: CheckSquare },
  { label: "Messages",      href: "/admin/messages",    icon: MessageSquare },
  { label: "Équipe",        href: "/admin/equipe",      icon: UsersRound },
  { label: "Statistiques",  href: "/admin/statistiques",icon: BarChart2 },
];

interface Props { role: string; }

export default function AdminSidebar({ role }: Props) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const isAdmin = role === "admin";

  const nav = navAll.filter((item) => isAdmin || item.href !== "/admin/equipe");

  return (
    <aside className="w-60 bg-brand-900 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Agence de l'Ombre" width={36} height={26} className="flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold leading-tight">Agence de l&apos;Ombre</p>
            <p className="text-xs text-brand-400">{isAdmin ? "Administration" : "Espace équipe"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-700 text-white"
                  : "text-brand-400 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-brand-700 space-y-0.5">
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800 hover:text-white transition-colors">
          <Settings size={17} />
          Paramètres
        </Link>
        <button
          onClick={() => startTransition(() => logout())}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
