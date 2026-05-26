"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { GALogo, SearchConsoleLogo, GMBLogo, MetaLogo, LinkedInLogo } from "./PlatformLogos";

export interface OAuthConnection {
  provider:     string;
  account_name: string | null;
  account_id:   string | null;
  expires_at:   string | null;
  updated_at:   string;
}

export interface ServiceConfig {
  ga4_property_id:      string | null;
  search_console_url:   string | null;
  gmb_location_id:      string | null;
}

interface Platform {
  id:        string;
  label:     string;
  Logo:      () => React.JSX.Element;
  type:      "oauth" | "config";
  provider?: "meta" | "linkedin";
  field?:    keyof ServiceConfig;
  color:     string;
  desc:      string;
  placeholder?: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "ga4", label: "Google Analytics", Logo: GALogo, type: "config", field: "ga4_property_id",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    desc: "Trafic, sessions, pages vues — 30 derniers jours",
    placeholder: "properties/123456789",
  },
  {
    id: "search", label: "Search Console", Logo: SearchConsoleLogo, type: "config", field: "search_console_url",
    color: "text-green-600 bg-green-50 border-green-200",
    desc: "Clics, impressions, positions SEO",
    placeholder: "https://votresite.fr",
  },
  {
    id: "gmb", label: "Google My Business", Logo: GMBLogo, type: "config", field: "gmb_location_id",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    desc: "Vues fiche, appels, itinéraires",
    placeholder: "locations/123456789",
  },
  {
    id: "meta", label: "Instagram & Facebook", Logo: MetaLogo, type: "oauth", provider: "meta",
    color: "text-pink-600 bg-pink-50 border-pink-200",
    desc: "Followers, portée, engagement, top publications",
  },
  {
    id: "linkedin", label: "LinkedIn", Logo: LinkedInLogo, type: "oauth", provider: "linkedin",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    desc: "Impressions, engagement, statistiques page entreprise",
  },
];

interface Props {
  clientId:    string;
  connections: OAuthConnection[];
  config:      ServiceConfig;
  isAdmin?:    boolean;
  onSaveConfig?: (field: keyof ServiceConfig, value: string) => Promise<void>;
  successProvider?: string | null;
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected
    ? <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Connecté</span>
    : <span className="flex items-center gap-1 text-xs font-medium text-brand-400 bg-brand-100 px-2 py-0.5 rounded-full"><XCircle size={11} /> Non connecté</span>;
}

export default function ConnectionsManager({ clientId, connections, config, isAdmin, onSaveConfig, successProvider }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<ServiceConfig>({ ...config });
  const [saving, setSaving] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const connMap = Object.fromEntries(connections.map((c) => [c.provider, c]));

  async function handleSaveField(field: keyof ServiceConfig) {
    if (!onSaveConfig) return;
    setSaving(field);
    await onSaveConfig(field, fieldValues[field] ?? "");
    setSaving(null);
    setEditingField(null);
  }

  async function handleDisconnect(provider: string) {
    setDisconnecting(provider);
    await fetch("/api/auth/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, provider }),
    });
    setDisconnecting(null);
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {successProvider && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            {successProvider === "meta" ? "Instagram & Facebook" : "LinkedIn"} connecté avec succès !
          </p>
        </div>
      )}

      {PLATFORMS.map((p) => {
        const isConnected = p.type === "oauth"
          ? !!connMap[p.provider!]
          : !!(fieldValues[p.field!]);
        const conn = p.type === "oauth" ? connMap[p.provider!] : null;
        const isExpired = conn?.expires_at ? new Date(conn.expires_at) < new Date() : false;

        return (
          <div key={p.id} className={`card p-4 border ${isConnected ? "border-l-4 " + p.color.split(" ")[2] : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 flex-shrink-0 ${p.color.split(" ")[1]}`}>
                <p.Logo />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-brand-900 text-sm">{p.label}</p>
                  <StatusBadge connected={isConnected && !isExpired} />
                  {isExpired && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <AlertCircle size={11} /> Token expiré
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-400 mt-0.5">{p.desc}</p>

                {/* Connected info */}
                {conn && (
                  <p className="text-xs text-brand-600 mt-1">
                    Compte : <span className="font-medium">{conn.account_name}</span>
                    {conn.expires_at && (
                      <span className="ml-2 text-brand-400">
                        · Expire le {new Date(conn.expires_at).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </p>
                )}
                {p.type === "config" && isConnected && (
                  <p className="text-xs text-brand-500 mt-1 font-mono">{fieldValues[p.field!]}</p>
                )}

                {/* Config field (inline edit) */}
                {p.type === "config" && (isAdmin || true) && editingField === p.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={fieldValues[p.field!] ?? ""}
                      onChange={(e) => setFieldValues((v) => ({ ...v, [p.field!]: e.target.value }))}
                      placeholder={p.placeholder}
                      className="input text-xs flex-1"
                    />
                    <button
                      onClick={() => handleSaveField(p.field!)}
                      disabled={saving === p.field}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      {saving === p.field ? <Loader2 size={11} className="animate-spin" /> : null}
                      Enregistrer
                    </button>
                    <button onClick={() => setEditingField(null)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.type === "config" && editingField !== p.id && (
                  <button
                    onClick={() => setEditingField(p.id)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    {isConnected ? "Modifier" : "Configurer"}
                  </button>
                )}

                {p.type === "oauth" && !isConnected && (
                  <a
                    href={`/api/auth/${p.provider}/connect?client_id=${clientId}`}
                    className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
                  >
                    <ExternalLink size={12} /> Connecter
                  </a>
                )}

                {p.type === "oauth" && isConnected && (
                  <div className="flex gap-2">
                    <a
                      href={`/api/auth/${p.provider}/connect?client_id=${clientId}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Reconnecter
                    </a>
                    <button
                      onClick={() => handleDisconnect(p.provider!)}
                      disabled={disconnecting === p.provider}
                      className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      {disconnecting === p.provider ? <Loader2 size={12} className="animate-spin" /> : "Déconnecter"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
