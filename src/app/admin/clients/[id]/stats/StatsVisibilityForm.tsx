"use client";

import { useState } from "react";
import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import { updateStatsVisibilityAction } from "./actions";

const BLOCKS = [
  { key: "stats_show_ga4",            label: "Google Analytics (GA4)",    icon: "📊", desc: "Sessions, pages vues, utilisateurs, sources de trafic" },
  { key: "stats_show_search_console", label: "Google Search Console",     icon: "🔍", desc: "Clics, impressions, CTR, requêtes SEO" },
  { key: "stats_show_instagram",      label: "Instagram",                 icon: "📸", desc: "Followers, portée, engagement, top publications" },
  { key: "stats_show_facebook",       label: "Facebook",                  icon: "👥", desc: "Portée, impressions, engagement de la page" },
  { key: "stats_show_linkedin",       label: "LinkedIn",                  icon: "💼", desc: "Followers, impressions, engagement professionnel" },
] as const;

type Visibility = {
  stats_show_ga4: boolean;
  stats_show_search_console: boolean;
  stats_show_instagram: boolean;
  stats_show_facebook: boolean;
  stats_show_linkedin: boolean;
};

export default function StatsVisibilityForm({ clientId, initial }: { clientId: string; initial: Visibility }) {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    await updateStatsVisibilityAction(clientId, values);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-brand-900">Blocs visibles par le client</h2>
          <p className="text-xs text-brand-400 mt-0.5">Choisissez quelles statistiques ce client peut voir dans son espace</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? "Sauvegardé" : "Enregistrer"}
        </button>
      </div>

      <div className="space-y-2">
        {BLOCKS.map(({ key, label, icon, desc }) => {
          const active = values[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setValues((v) => ({ ...v, [key]: !v[key] }))}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                active
                  ? "border-accent bg-accent/5"
                  : "border-brand-100 bg-brand-50 opacity-60 hover:opacity-80"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${active ? "text-brand-900" : "text-brand-500"}`}>{label}</p>
                <p className="text-xs text-brand-400 mt-0.5">{desc}</p>
              </div>
              <div className={`flex-shrink-0 ${active ? "text-accent" : "text-brand-300"}`}>
                {active ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
