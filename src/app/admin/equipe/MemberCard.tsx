"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { FolderKanban, CheckSquare, Mail, Trash2, UserPlus } from "lucide-react";
import { inviteMemberAction, removeMemberAction } from "./member-actions";

interface Props {
  member: {
    name: string; email: string; initials: string;
    projectCount: number; taskCount: number; profileId: string | null;
  };
  info: { specialty: string; color: string; prestations: string[] } | undefined;
  isAdmin: boolean;
}

export function MemberCard({ member: m, info, isAdmin }: Props) {
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "inviting" | "removing" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleInvite = () => {
    setStatus("inviting");
    startTransition(async () => {
      const res = await inviteMemberAction(m.email, m.name, info?.specialty ?? "");
      if (res.error) { setStatus("error"); setMsg(res.error); }
      else { setStatus("done"); setMsg("Invitation envoyée !"); }
    });
  };

  const handleRemove = () => {
    if (!m.profileId) return;
    if (!confirm(`Supprimer l'accès de ${m.name} ? Cette action est irréversible.`)) return;
    setStatus("removing");
    startTransition(async () => {
      const res = await removeMemberAction(m.profileId!);
      if (res.error) { setStatus("error"); setMsg(res.error); }
      else setStatus("done");
    });
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${info?.color ?? "bg-brand-100 text-brand-600"}`}>
          {m.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brand-900">{m.name}</p>
          <p className="text-sm text-brand-500">{info?.specialty ?? "—"}</p>
          <a href={`mailto:${m.email}`} className="text-xs text-brand-400 hover:text-accent flex items-center gap-1 mt-0.5">
            <Mail size={11} /> {m.email}
          </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!m.profileId && (
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Non inscrit</span>
          )}
          {isAdmin && !m.profileId && status === "idle" && (
            <button onClick={handleInvite}
              className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors">
              <UserPlus size={12} /> Inviter
            </button>
          )}
          {isAdmin && m.profileId && (
            <button onClick={handleRemove}
              className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Supprimer
            </button>
          )}
        </div>
      </div>

      {msg && (
        <p className={`text-xs px-3 py-1.5 rounded-lg ${status === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {msg}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={m.profileId ? `/admin/projects?assignee_id=${m.profileId}` : "/admin/projects"}
          className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          <FolderKanban size={14} className="text-brand-400" />
          <div>
            <p className="text-lg font-bold text-brand-900 leading-none">{m.projectCount}</p>
            <p className="text-xs text-brand-400">projet{m.projectCount !== 1 ? "s" : ""}</p>
          </div>
        </Link>
        <Link
          href={m.profileId ? `/admin/tasks?assignee_id=${m.profileId}` : "/admin/tasks"}
          className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          <CheckSquare size={14} className="text-brand-400" />
          <div>
            <p className="text-lg font-bold text-brand-900 leading-none">{m.taskCount}</p>
            <p className="text-xs text-brand-400">tâche{m.taskCount !== 1 ? "s" : ""} ouvertes</p>
          </div>
        </Link>
      </div>

      {info?.prestations && (
        <div className="flex flex-wrap gap-1.5">
          {info.prestations.map((p) => (
            <span key={p} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${info.color}`}>{p}</span>
          ))}
        </div>
      )}
    </div>
  );
}
