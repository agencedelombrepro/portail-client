"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import { updateMilestoneStatusAction, updateMilestoneAction, deleteMilestoneAction } from "../actions";
import { formatDate } from "@/lib/utils";

interface Profile { id: string; full_name: string; }
interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assignee_id?: string | null;
}

interface Props {
  milestone: Milestone;
  projectId: string;
  profiles: Profile[];
}

export function MilestoneRow({ milestone: m, projectId, profiles }: Props) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [title, setTitle]       = useState(m.title);
  const [desc, setDesc]         = useState(m.description ?? "");
  const [dueDate, setDueDate]   = useState(m.due_date ?? "");
  const [assigneeId, setAssigneeId] = useState(m.assignee_id ?? "");

  const handleToggle = async () => {
    const next = m.status === "completed" ? "pending" : m.status === "pending" ? "in_progress" : "completed";
    setLoading(true);
    await updateMilestoneStatusAction(m.id, next, projectId);
    setLoading(false);
  };

  const handleSave = () => {
    startTransition(() =>
      updateMilestoneAction(m.id, projectId, {
        title:       title.trim() || m.title,
        description: desc.trim() || null,
        due_date:    dueDate || null,
        assignee_id: assigneeId || null,
      })
    );
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("Supprimer cette étape ?")) return;
    startTransition(() => deleteMilestoneAction(m.id, projectId));
  };

  if (editing) {
    return (
      <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input text-sm font-medium"
          placeholder="Titre de l'étape"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input text-sm"
          />
          {profiles.length > 0 && (
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="input text-sm"
            >
              <option value="">Non assigné</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          )}
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="input text-sm resize-none"
          placeholder="Description (optionnel)"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(false)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-brand-200 text-brand-600 hover:bg-white">
            <X size={12} /> Annuler
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90">
            <Check size={12} /> Enregistrer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 group">
      <button
        disabled={loading}
        onClick={handleToggle}
        className="mt-0.5 text-brand-300 hover:text-accent transition-colors flex-shrink-0"
      >
        {loading
          ? <Loader2 size={18} className="animate-spin" />
          : m.status === "completed"
            ? <CheckCircle2 size={18} className="text-green-500" />
            : <Circle size={18} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${m.status === "completed" ? "line-through text-brand-400" : "text-brand-900"}`}>
          {m.title}
        </p>
        {m.description && <p className="text-xs text-brand-400 mt-0.5">{m.description}</p>}
        <div className="flex flex-wrap gap-3 mt-0.5">
          {m.due_date && (
            <p className="text-xs text-brand-400">Échéance : {formatDate(m.due_date)}</p>
          )}
          {m.assignee_id && profiles.find((p) => p.id === m.assignee_id) && (
            <p className="text-xs text-brand-400">
              → {profiles.find((p) => p.id === m.assignee_id)?.full_name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          m.status === "completed" ? "bg-green-100 text-green-700" :
          m.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
          "bg-brand-100 text-brand-600"
        }`}>
          {m.status === "completed" ? "Terminé" : m.status === "in_progress" ? "En cours" : "À faire"}
        </span>
        <button onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-brand-400 hover:text-accent hover:bg-accent/10 transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={handleDelete}
          className="p-1.5 rounded-lg text-brand-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
