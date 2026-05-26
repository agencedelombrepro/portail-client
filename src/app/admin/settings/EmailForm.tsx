"use client";

import { useState } from "react";
import { updateEmailAction } from "./actions";
import { Feedback, SubmitButton } from "./ProfileForm";

export default function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    const newEmail = formData.get("email") as string;
    if (newEmail === currentEmail) {
      setStatus({ error: "C'est déjà votre adresse email actuelle." });
      return;
    }
    setLoading(true);
    setStatus(null);
    const result = await updateEmailAction(formData);
    setStatus(result ?? null);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Nouvelle adresse email</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={currentEmail}
          className="input"
          placeholder="nouvelle@adresse.fr"
        />
        <p className="text-xs text-brand-400 mt-1">
          Un email de confirmation sera envoyé à la nouvelle adresse.
        </p>
      </div>
      <Feedback status={status} />
      <div className="flex justify-end">
        <SubmitButton loading={loading} label="Mettre à jour l'email" />
      </div>
    </form>
  );
}
