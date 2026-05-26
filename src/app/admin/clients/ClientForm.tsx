"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import Image from "next/image";
import { Client } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";

export const PRESTATIONS = [
  "Site web",
  "Refonte de site web",
  "SEO / Référencement",
  "Campagne Google Ads",
  "Campagne Meta Ads",
  "Identité visuelle / Branding",
  "Community Management",
  "Email marketing",
  "Application mobile",
  "Pack maintenance",
  "Audit & conseil",
] as const;

const CLIENT_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "actif",    label: "Actif" },
  { value: "pause",    label: "En pause" },
  { value: "terminé",  label: "Terminé" },
];

const CARD_COLORS = [
  { label: "Défaut",   value: "#f8fafc" },
  { label: "Violet",   value: "#f3e8ff" },
  { label: "Bleu",     value: "#dbeafe" },
  { label: "Cyan",     value: "#cffafe" },
  { label: "Vert",     value: "#dcfce7" },
  { label: "Jaune",    value: "#fef9c3" },
  { label: "Orange",   value: "#ffedd5" },
  { label: "Rose",     value: "#fce7f3" },
  { label: "Rouge",    value: "#fee2e2" },
  { label: "Ardoise",  value: "#f1f5f9" },
];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Client & { logo_url?: string; card_color?: string }>;
  cancelHref: string;
  submitLabel: string;
}

export default function ClientForm({ action, defaultValues: d = {}, cancelHref, submitLabel }: Props) {
  const initial = d.prestations?.length
    ? d.prestations
    : d.prestation
      ? [d.prestation]
      : [];

  const [selected, setSelected] = useState<string[]>(initial);
  const [cardColor, setCardColor] = useState<string>((d as any).card_color ?? "#f8fafc");
  const [logoUrl, setLogoUrl] = useState<string>((d as any).logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggle(p: string) {
    setSelected((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `logos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("logo clients").upload(path, file, { upsert: true });
      if (error) { alert("Erreur upload : " + error.message); return; }
      const { data } = supabase.storage.from("logo clients").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="card p-6 space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="logo_url" value={logoUrl} />
      <input type="hidden" name="card_color" value={cardColor} />

      {/* Identité visuelle */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Identité visuelle</p>
        <div className="flex flex-wrap gap-6 items-start">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">Logo client</label>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-100">
                  <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" />
                  <button type="button" onClick={() => setLogoUrl("")}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-900/70 rounded-full flex items-center justify-center hover:bg-red-500">
                    <X size={9} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-brand-200 flex items-center justify-center bg-brand-50 text-brand-300">
                  <Upload size={20} />
                </div>
              )}
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-sm py-1.5 px-3">
                  {uploading ? "Envoi…" : logoUrl ? "Changer" : "Uploader"}
                </button>
                <p className="text-xs text-brand-400 mt-1">PNG, JPG, SVG · max 2Mo</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>
          </div>

          {/* Couleur carte */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">Couleur de la carte</label>
            <div className="flex flex-wrap gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setCardColor(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${cardColor === c.value ? "border-brand-900 scale-110" : "border-brand-200 hover:border-brand-400"}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-brand-100" />

      {/* Infos générales */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Informations générales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Entreprise *</label>
            <input name="company_name" required defaultValue={d.company_name} className="input" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Contact *</label>
            <input name="contact_name" required defaultValue={d.contact_name} className="input" placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Email *</label>
            <input name="email" type="email" required defaultValue={d.email} className="input" placeholder="jean@acme.fr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Téléphone</label>
            <input name="phone" type="tel" defaultValue={d.phone ?? ""} className="input" placeholder="+33 6 12 34 56 78" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-1">Site web</label>
            <input name="website" type="url" defaultValue={d.website ?? ""} className="input" placeholder="https://acme.fr" />
          </div>
        </div>
      </div>

      <hr className="border-brand-100" />

      {/* Prestation */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Prestation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-1">Statut client</label>
            <select name="client_status" defaultValue={d.client_status ?? "actif"} className="input w-auto">
              {CLIENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-2">Prestations</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESTATIONS.map((p) => {
                const checked = selected.includes(p);
                return (
                  <label
                    key={p}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                      ${checked
                        ? "border-accent bg-accent/5 text-accent font-medium"
                        : "border-brand-200 text-brand-600 hover:border-brand-300 hover:bg-brand-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      name="prestations"
                      value={p}
                      checked={checked}
                      onChange={() => toggle(p)}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-accent border-accent" : "border-brand-300"}`}>
                      {checked && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {p}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Début de prestation</label>
            <input name="presta_start_date" type="date" defaultValue={d.presta_start_date ?? ""} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Fin de prestation</label>
            <input name="presta_end_date" type="date" defaultValue={d.presta_end_date ?? ""} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Budget total (€)</label>
            <input name="budget" type="number" min="0" step="0.01" defaultValue={d.budget ?? ""} className="input" placeholder="1440.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Paiement en</label>
            <select name="payment_count" defaultValue={(d as any).payment_count ?? 1} className="input w-auto">
              <option value={1}>1 fois (comptant)</option>
              <option value={2}>2 fois</option>
              <option value={3}>3 fois</option>
              <option value={4}>4 fois</option>
              <option value={6}>6 fois</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-brand-100" />

      {/* Analytics */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Intégrations analytics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">GA4 Property ID</label>
            <input name="ga4_property_id" defaultValue={d.ga4_property_id ?? ""} className="input" placeholder="properties/123456789" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Search Console URL</label>
            <input name="search_console_url" defaultValue={d.search_console_url ?? ""} className="input" placeholder="https://acme.fr" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-700 mb-1">Notes internes</label>
        <textarea name="notes" rows={3} defaultValue={d.notes ?? ""} className="input resize-none" placeholder="Notes visibles uniquement par l'équipe..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link href={cancelHref} className="btn-secondary">Annuler</Link>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
