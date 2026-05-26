"use client";

import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteMemberAction } from "./member-actions";

const SPECIALTIES = [
  "Site web & Tech",
  "Communication & Identité Visuelle",
  "SEO & Fiche Google",
  "Media Buying",
  "Rédaction & Contenu",
  "Autre",
];

export function AddMemberForm() {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const fullName = fd.get("full_name") as string;
    const specialty = fd.get("specialty") as string;
    if (!email || !fullName) return;
    setError("");
    startTransition(async () => {
      const res = await inviteMemberAction(email, fullName, specialty);
      if (res.error) setError(res.error);
      else { setDone(true); setTimeout(() => { setOpen(false); setDone(false); }, 2000); }
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 text-sm">
        <UserPlus size={15} /> Ajouter un membre
      </button>
    );
  }

  return (
    <div className="card p-5 border-2 border-accent/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-900">Inviter un nouveau membre</h3>
        <button onClick={() => setOpen(false)} className="text-brand-400 hover:text-brand-700"><X size={18} /></button>
      </div>
      {done ? (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 text-center">Invitation envoyée !</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="full_name" placeholder="Nom complet" required className="input text-sm" />
          <input name="email" type="email" placeholder="Email professionnel" required className="input text-sm" />
          <select name="specialty" className="input text-sm">
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm flex-1">Envoyer l'invitation</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm px-4">Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}
