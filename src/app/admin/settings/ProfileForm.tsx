"use client";

import { useState } from "react";
import { updateProfileAction } from "./actions";
import { Loader2, Check } from "lucide-react";

export default function ProfileForm({ currentName }: { currentName: string }) {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus(null);
    const result = await updateProfileAction(formData);
    setStatus(result ?? null);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Nom complet</label>
        <input
          name="full_name"
          defaultValue={currentName}
          required
          className="input"
          placeholder="Johanna Goncalves"
        />
      </div>
      <Feedback status={status} />
      <div className="flex justify-end">
        <SubmitButton loading={loading} label="Enregistrer" />
      </div>
    </form>
  );
}

export function Feedback({ status }: { status: { error?: string; success?: string } | null }) {
  if (!status) return null;
  if (status.error)
    return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{status.error}</p>;
  return (
    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
      <Check size={14} /> {status.success}
    </p>
  );
}

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
      {loading && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  );
}
