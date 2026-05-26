"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { updatePasswordAction } from "./actions";
import { Feedback, SubmitButton } from "./ProfileForm";

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required
        className="input pr-10"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function PasswordForm() {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus(null);
    const result = await updatePasswordAction(formData);
    setStatus(result ?? null);
    setLoading(false);
    if (result?.success) {
      // Reset the form
      (document.getElementById("password-form") as HTMLFormElement)?.reset();
    }
  }

  return (
    <form id="password-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Mot de passe actuel</label>
        <PasswordInput name="current_password" placeholder="••••••••" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Nouveau mot de passe</label>
        <PasswordInput name="new_password" placeholder="8 caractères minimum" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Confirmer le nouveau mot de passe</label>
        <PasswordInput name="confirm_password" placeholder="••••••••" />
      </div>
      <Feedback status={status} />
      <div className="flex justify-end">
        <SubmitButton loading={loading} label="Changer le mot de passe" />
      </div>
    </form>
  );
}
