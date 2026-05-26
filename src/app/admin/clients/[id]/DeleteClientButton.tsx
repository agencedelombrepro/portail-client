"use client";

import { Trash2 } from "lucide-react";
import { deleteClientAction } from "../actions";

export default function DeleteClientButton({ id, companyName }: { id: string; companyName: string }) {
  async function handleDelete() {
    if (!confirm(`Supprimer le client "${companyName}" ? Cette action est irréversible.`)) return;
    await deleteClientAction(id);
  }

  return (
    <button onClick={handleDelete} className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 hover:border-red-200">
      <Trash2 size={14} />
      Supprimer
    </button>
  );
}
