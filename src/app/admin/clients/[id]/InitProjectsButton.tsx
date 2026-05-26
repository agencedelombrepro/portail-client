"use client";

import { useState, useTransition } from "react";
import { Wand2, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { PRESTATION_TEMPLATES, type ProjectTemplate } from "@/lib/prestation-templates";
import { initProjectsFromPrestationsAction, reinitProjectsAction } from "./init-projects-action";

interface Props {
  clientId: string;
  prestations: string[];
  hasExistingProjects?: boolean;
}

export default function InitProjectsButton({ clientId, prestations, hasExistingProjects = false }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const preview: { prestation: string; projects: ProjectTemplate[] }[] = prestations
    .filter((p) => PRESTATION_TEMPLATES[p])
    .map((p) => ({ prestation: p, projects: PRESTATION_TEMPLATES[p] }));

  if (preview.length === 0) return null;

  const totalProjects   = preview.reduce((n, p) => n + p.projects.length, 0);
  const totalMilestones = preview.reduce((n, p) => n + p.projects.reduce((m, pr) => m + pr.milestones.length, 0), 0);

  function handleConfirm() {
    startTransition(async () => {
      if (hasExistingProjects) {
        await reinitProjectsAction(clientId, prestations);
      } else {
        await initProjectsFromPrestationsAction(clientId, prestations);
      }
      setDone(true);
      setOpen(false);
    });
  }

  if (done) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <CheckCircle2 size={15} /> Projets réinitialisés
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`btn-secondary flex items-center gap-2 text-sm ${hasExistingProjects ? "text-orange-600 hover:border-orange-300 hover:bg-orange-50" : ""}`}
      >
        {hasExistingProjects ? <RefreshCw size={14} /> : <Wand2 size={14} />}
        {hasExistingProjects ? "Réinitialiser projets" : "Initialiser projets"}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-brand-200 shadow-xl z-50 overflow-hidden">
          <div className={`px-4 py-3 border-b ${hasExistingProjects ? "bg-orange-50 border-orange-100" : "bg-brand-50 border-brand-100"}`}>
            <p className="font-semibold text-brand-900 text-sm">
              {hasExistingProjects ? "Réinitialiser les projets" : "Initialiser les projets"}
            </p>
            <p className="text-xs text-brand-500 mt-0.5">
              {totalProjects} projet{totalProjects > 1 ? "s" : ""} · {totalMilestones} étape{totalMilestones > 1 ? "s" : ""} avec deadlines calculées
            </p>
          </div>

          {hasExistingProjects && (
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-start gap-2">
              <AlertTriangle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                Tous les projets et étapes existants seront supprimés et recréés depuis les templates avec les bonnes deadlines.
              </p>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto divide-y divide-brand-50">
            {preview.map(({ prestation, projects }) => (
              <div key={prestation} className="px-4 py-3">
                <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-2">{prestation}</p>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.name}>
                      <p className="text-sm font-medium text-brand-800">📁 {proj.name}</p>
                      <ul className="mt-1 ml-4 space-y-0.5">
                        {proj.milestones.map((m, i) => (
                          <li key={i} className="text-xs text-brand-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-brand-300 flex-shrink-0" />
                            {m.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 bg-brand-50 border-t border-brand-100 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-secondary text-sm py-1.5 px-3">
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={pending}
              className={`text-sm py-1.5 px-3 flex items-center gap-1.5 rounded-lg font-medium transition-colors ${
                hasExistingProjects
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "btn-primary"
              }`}
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : hasExistingProjects ? <RefreshCw size={13} /> : <Wand2 size={13} />}
              {hasExistingProjects ? "Réinitialiser" : "Créer les projets"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
