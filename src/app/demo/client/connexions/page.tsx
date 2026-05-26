"use client";

import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { GALogo, SearchConsoleLogo, GMBLogo, MetaLogo, LinkedInLogo } from "@/components/PlatformLogos";

const PLATFORMS = [
  {
    id: "ga4", label: "Google Analytics", Logo: GALogo,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    desc: "Trafic, sessions, pages vues — 30 derniers jours",
    connected: true, accountName: "Acme Corp - Analytics",
  },
  {
    id: "search", label: "Search Console", Logo: SearchConsoleLogo,
    color: "text-green-600 bg-green-50 border-green-200",
    desc: "Clics, impressions, positions SEO",
    connected: true, accountName: "https://acmecorp.fr",
  },
  {
    id: "gmb", label: "Google My Business", Logo: GMBLogo,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    desc: "Vues fiche, appels, itinéraires",
    connected: false, accountName: null,
  },
  {
    id: "meta", label: "Instagram & Facebook", Logo: MetaLogo,
    color: "text-pink-600 bg-pink-50 border-pink-200",
    desc: "Followers, portée, engagement, top publications",
    connected: true, accountName: "acmecorp_official",
    expiresAt: "2026-07-15",
  },
  {
    id: "linkedin", label: "LinkedIn", Logo: LinkedInLogo,
    color: "text-blue-700 bg-blue-50 border-blue-200",
    desc: "Impressions, engagement, statistiques page entreprise",
    connected: false, accountName: null,
  },
];

function StatusBadge({ connected }: { connected: boolean }) {
  return connected
    ? <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Connecté</span>
    : <span className="flex items-center gap-1 text-xs font-medium text-brand-400 bg-brand-100 px-2 py-0.5 rounded-full"><XCircle size={11} /> Non connecté</span>;
}

export default function DemoConnexionsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Mes connexions</h1>
        <p className="text-brand-500 text-sm mt-0.5">
          Connectez vos comptes pour afficher vos statistiques dans cet espace.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-600">
        Ceci est une démonstration. Dans la version réelle, vos connexions OAuth sont sécurisées et gérées par votre agence.
      </div>

      <div className="space-y-3">
        {PLATFORMS.map((p) => (
          <div key={p.id} className={`card p-4 border ${p.connected ? "border-l-4 " + p.color.split(" ")[2] : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 flex-shrink-0 ${p.color.split(" ")[1]}`}>
                <p.Logo />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-brand-900 text-sm">{p.label}</p>
                  <StatusBadge connected={p.connected} />
                </div>
                <p className="text-xs text-brand-400 mt-0.5">{p.desc}</p>
                {p.connected && p.accountName && (
                  <p className="text-xs text-brand-600 mt-1">
                    Compte : <span className="font-medium">{p.accountName}</span>
                    {p.expiresAt && (
                      <span className="ml-2 text-brand-400">
                        · Expire le {new Date(p.expiresAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {p.connected ? (
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs py-1.5 px-3 opacity-60 cursor-not-allowed">Reconnecter</button>
                    <button className="btn-secondary text-xs py-1.5 px-3 text-red-600 opacity-60 cursor-not-allowed">Déconnecter</button>
                  </div>
                ) : (
                  <button className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 opacity-60 cursor-not-allowed">
                    <ExternalLink size={12} /> Connecter
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
