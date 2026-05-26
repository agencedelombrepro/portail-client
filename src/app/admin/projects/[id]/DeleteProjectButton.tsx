"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProjectAction } from "../actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Supprimer ce projet et toutes ses étapes ? Cette action est irréversible.")) return;
    startTransition(() => deleteProjectAction(projectId));
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="btn-secondary flex items-center gap-2 text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Supprimer
    </button>
  );
}
