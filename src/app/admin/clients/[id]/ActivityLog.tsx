"use client";

import { useState } from "react";
import { Phone, Mail, Users, FileText, MoreHorizontal, Plus, Trash2, Loader2 } from "lucide-react";
import { addActivityAction, deleteActivityAction } from "./activity-actions";

const TYPES = [
  { value: "note",     label: "Note",     icon: FileText, color: "text-brand-500 bg-brand-100" },
  { value: "appel",    label: "Appel",    icon: Phone,    color: "text-green-600 bg-green-100" },
  { value: "réunion",  label: "Réunion",  icon: Users,    color: "text-blue-600 bg-blue-100" },
  { value: "email",    label: "Email",    icon: Mail,     color: "text-purple-600 bg-purple-100" },
  { value: "autre",    label: "Autre",    icon: MoreHorizontal, color: "text-orange-600 bg-orange-100" },
] as const;

type Activity = {
  id: string;
  type: string;
  content: string;
  activity_date: string;
  created_at: string;
};

function formatActivityDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ActivityLog({ clientId, activities: initial }: { clientId: string; activities: Activity[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [type, setType] = useState<string>("note");

  async function handleAdd(formData: FormData) {
    setLoading(true);
    await addActivityAction(clientId, formData);
    setLoading(false);
    setOpen(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteActivityAction(id, clientId);
    setDeleting(null);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-900">Activité ({initial.length})</h2>
        <button onClick={() => setOpen(!open)} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Plus size={13} /> Ajouter
        </button>
      </div>

      {/* Add form */}
      {open && (
        <form action={handleAdd} className="mb-5 p-4 rounded-lg bg-brand-50 border border-brand-100 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  type === t.value ? "border-brand-900 bg-brand-900 text-white" : "border-brand-200 text-brand-600 bg-white hover:bg-brand-50"
                }`}
              >
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />
          <textarea
            name="content"
            required
            rows={2}
            className="input resize-none text-sm"
            placeholder={type === "appel" ? "Résumé de l'appel..." : type === "réunion" ? "Points abordés..." : type === "email" ? "Objet et résumé..." : "Note..."}
          />
          <div className="flex items-center gap-3">
            <input name="activity_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input text-sm w-auto" />
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-xs py-1.5 px-3">Annuler</button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                {loading && <Loader2 size={12} className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {initial.length === 0 && !open && (
          <p className="text-sm text-brand-400 text-center py-4">Aucune activité enregistrée</p>
        )}
        {initial.map((a, i) => {
          const meta = TYPES.find((t) => t.value === a.type) ?? TYPES[0];
          const Icon = meta.icon;
          return (
            <div key={a.id} className="flex gap-3 group">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.color}`}>
                  <Icon size={13} />
                </div>
                {i < initial.length - 1 && <div className="w-px flex-1 bg-brand-100 mt-1 mb-1" />}
              </div>
              <div className={`pb-4 flex-1 min-w-0 ${i < initial.length - 1 ? "" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{meta.label}</span>
                    <span className="text-xs text-brand-400 ml-2">{formatActivityDate(a.activity_date)}</span>
                    <p className="text-sm text-brand-800 mt-0.5 whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-300 hover:text-red-500 flex-shrink-0 mt-0.5"
                  >
                    {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
