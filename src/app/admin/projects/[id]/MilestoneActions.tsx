"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { createMilestoneAction, updateMilestoneStatusAction } from "../actions";

interface AddProps { projectId: string; mode: "add"; }
interface ToggleProps { milestoneId: string; projectId: string; status: string; mode: "toggle"; }
type Props = AddProps | ToggleProps;

export default function MilestoneActions(props: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (props.mode === "toggle") {
    const { milestoneId, projectId, status } = props;
    const next = status === "completed" ? "pending" : status === "pending" ? "in_progress" : "completed";
    return (
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await updateMilestoneStatusAction(milestoneId, next, projectId);
          setLoading(false);
        }}
        className="mt-0.5 text-brand-300 hover:text-accent transition-colors flex-shrink-0"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : status === "completed" ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
      </button>
    );
  }

  const { projectId } = props;

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-accent hover:underline flex items-center gap-1">
        <Plus size={14} /> Ajouter une étape
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-brand-900 mb-4">Nouvelle étape</h3>
            <form
              action={async (fd) => {
                setLoading(true);
                await createMilestoneAction(projectId, fd);
                setOpen(false);
                setLoading(false);
              }}
              className="space-y-3"
            >
              <input name="title" required placeholder="Titre de l'étape *" className="input" />
              <textarea name="description" rows={2} placeholder="Description (optionnel)" className="input resize-none" />
              <input name="due_date" type="date" className="input" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />} Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
