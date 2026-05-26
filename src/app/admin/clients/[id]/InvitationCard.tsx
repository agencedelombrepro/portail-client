"use client";

import { useState, useTransition } from "react";
import { Mail, CheckCircle2, Clock, UserX, Loader2, AlertCircle, RefreshCw, ShieldOff } from "lucide-react";
import { inviteClientAction, revokeClientAccessAction } from "./invitation-action";

interface Props {
  clientId:   string;
  email:      string;
  userId:     string | null;
  invitedAt:  string | null;
  acceptedAt: string | null;
  lastSeen:   string | null;
}

export default function InvitationCard({ clientId, email, userId, invitedAt, acceptedAt, lastSeen }: Props) {
  const [feedback, setFeedback]   = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const status = userId && acceptedAt ? "active"
    : invitedAt ? "pending"
    : "none";

  function handleInvite() {
    setFeedback(null);
    startTransition(async () => {
      const res = await inviteClientAction(clientId);
      setFeedback(res.error
        ? { type: "error", msg: res.error }
        : { type: "success", msg: `Invitation envoyée à ${email}` }
      );
    });
  }

  function handleRevoke() {
    if (!confirm("Révoquer l'accès de ce client ? Son compte sera supprimé.")) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await revokeClientAccessAction(clientId);
      setFeedback(res.error
        ? { type: "error", msg: res.error }
        : { type: "success", msg: "Accès révoqué." }
      );
    });
  }

  function formatDate(d: string | null) {
    if (!d) return null;
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
  }

  function timeAgo(d: string | null) {
    if (!d) return null;
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "À l'instant";
    if (mins < 60)  return `il y a ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30)  return `il y a ${days}j`;
    return formatDate(d);
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-brand-400" />
          <h2 className="font-semibold text-brand-900 text-sm">Accès espace client</h2>
        </div>

        {status === "none" && (
          <span className="text-xs font-medium text-brand-400 bg-brand-100 px-2 py-0.5 rounded-full">Non invité</span>
        )}
        {status === "pending" && (
          <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Invitation envoyée
          </span>
        )}
        {status === "active" && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} /> Compte actif
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-brand-600">
          <span className="text-brand-400">Email</span>
          <span className="font-medium">{email}</span>
        </div>
        {invitedAt && (
          <div className="flex justify-between text-brand-600">
            <span className="text-brand-400">Invitation envoyée</span>
            <span>{formatDate(invitedAt)}</span>
          </div>
        )}
        {acceptedAt && (
          <div className="flex justify-between text-brand-600">
            <span className="text-brand-400">Compte activé</span>
            <span>{formatDate(acceptedAt)}</span>
          </div>
        )}
        {status === "active" && (
          <div className="flex justify-between text-brand-600">
            <span className="text-brand-400">Dernière connexion</span>
            <span className={lastSeen ? "font-medium" : "text-brand-300"}>
              {lastSeen ? timeAgo(lastSeen) : "Jamais connecté"}
            </span>
          </div>
        )}
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {feedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {feedback.msg}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {status === "none" && (
          <button onClick={handleInvite} disabled={pending} className="btn-primary flex items-center gap-1.5 text-sm flex-1 justify-center">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
            Inviter le client
          </button>
        )}
        {status === "pending" && (
          <button onClick={handleInvite} disabled={pending} className="btn-secondary flex items-center gap-1.5 text-sm flex-1 justify-center">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Renvoyer l&apos;invitation
          </button>
        )}
        {status === "active" && (
          <button onClick={handleRevoke} disabled={pending} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-1.5 text-sm">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <ShieldOff size={13} />}
            Révoquer l&apos;accès
          </button>
        )}
        {status !== "active" && invitedAt && (
          <button onClick={handleRevoke} disabled={pending} className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-1.5 text-sm">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
