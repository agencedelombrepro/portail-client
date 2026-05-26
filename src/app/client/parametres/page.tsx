"use client";

import { useState, useTransition } from "react";
import { updateEmailAction, updatePasswordAction, updateProfileAction } from "./actions";
import { CheckCircle2, AlertCircle, Loader2, User, Mail, Lock } from "lucide-react";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function FeedbackBanner({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;
  return success
    ? <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700"><CheckCircle2 size={15} className="flex-shrink-0" />{success}</div>
    : <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle size={15} className="flex-shrink-0" />{error}</div>;
}

export default function ParametresPage() {
  const [email, setEmail]           = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [fullName, setFullName]     = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileFeedback, setProfileFeedback] = useState<{ success?: string; error?: string }>({});
  const [emailFeedback,   setEmailFeedback]   = useState<{ success?: string; error?: string }>({});
  const [pwdFeedback,     setPwdFeedback]     = useState<{ success?: string; error?: string }>({});

  const [profilePending, startProfileTransition] = useTransition();
  const [emailPending,   startEmailTransition]   = useTransition();
  const [pwdPending,     startPwdTransition]     = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentEmail(user.email ?? "");
    });
    supabase.from("profiles").select("full_name").then(({ data }) => {
      if (data?.[0]) setFullName(data[0].full_name ?? "");
    });
  }, []);

  function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileFeedback({});
    startProfileTransition(async () => {
      const res = await updateProfileAction(fullName);
      setProfileFeedback(res.success ? { success: "Nom mis à jour." } : { error: res.error });
    });
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailFeedback({});
    if (!email) return setEmailFeedback({ error: "Renseigne un email." });
    startEmailTransition(async () => {
      const res = await updateEmailAction(email);
      setEmailFeedback(res.success
        ? { success: "Un email de confirmation a été envoyé à " + email + "." }
        : { error: res.error });
    });
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdFeedback({});
    if (newPassword !== confirmPassword) return setPwdFeedback({ error: "Les mots de passe ne correspondent pas." });
    startPwdTransition(async () => {
      const res = await updatePasswordAction(newPassword);
      if (res.success) { setNewPassword(""); setConfirmPassword(""); }
      setPwdFeedback(res.success ? { success: "Mot de passe mis à jour." } : { error: res.error });
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Paramètres</h1>
        <p className="text-brand-500 text-sm mt-0.5">Gérez votre compte et vos informations.</p>
      </div>

      {/* Profil */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-brand-400" />
          <h2 className="font-semibold text-brand-900 text-sm">Informations du profil</h2>
        </div>
        <form onSubmit={handleProfile} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Nom complet</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Email actuel</label>
            <input value={currentEmail} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <FeedbackBanner {...profileFeedback} />
          <div className="flex justify-end">
            <button type="submit" disabled={profilePending} className="btn-primary flex items-center gap-2 text-sm">
              {profilePending && <Loader2 size={13} className="animate-spin" />} Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Changer email */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-brand-400" />
          <h2 className="font-semibold text-brand-900 text-sm">Changer l&apos;email</h2>
        </div>
        <form onSubmit={handleEmail} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Nouvel email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="nouveau@email.fr"
            />
          </div>
          <p className="text-xs text-brand-400">Un lien de confirmation sera envoyé à la nouvelle adresse.</p>
          <FeedbackBanner {...emailFeedback} />
          <div className="flex justify-end">
            <button type="submit" disabled={emailPending} className="btn-primary flex items-center gap-2 text-sm">
              {emailPending && <Loader2 size={13} className="animate-spin" />} Mettre à jour
            </button>
          </div>
        </form>
      </div>

      {/* Changer mot de passe */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-brand-400" />
          <h2 className="font-semibold text-brand-900 text-sm">Changer le mot de passe</h2>
        </div>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="Minimum 8 caractères"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Répétez le mot de passe"
            />
          </div>
          <FeedbackBanner {...pwdFeedback} />
          <div className="flex justify-end">
            <button type="submit" disabled={pwdPending} className="btn-primary flex items-center gap-2 text-sm">
              {pwdPending && <Loader2 size={13} className="animate-spin" />} Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
