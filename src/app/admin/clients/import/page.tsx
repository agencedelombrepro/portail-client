"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Wand2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClientFromContractAction, type ContractData } from "./actions";

const PRESTATIONS = [
  "Site web", "Refonte de site web", "SEO / Référencement",
  "Campagne Google Ads", "Campagne Meta Ads", "Identité visuelle / Branding",
  "Community Management", "Email marketing", "Application mobile",
  "Pack maintenance", "Audit & conseil",
];

type Step = "upload" | "analyzing" | "review" | "creating" | "done";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImportContractPage() {
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);
  const [step, setStep]           = useState<Step>("upload");
  const [file, setFile]           = useState<File | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [form, setForm]           = useState<ContractData | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(f: File) {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    if (!allowed.includes(f.type) && !f.name.endsWith(".txt") && !f.name.endsWith(".md")) {
      return setError("Format non supporté. Utilisez un PDF ou fichier texte.");
    }
    setFile(f);
    setError(null);
  }

  async function analyze() {
    if (!file) return;
    setStep("analyzing");
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const mediaType = file.type === "application/pdf" ? "application/pdf" : "text/plain";
      const res = await fetch("/api/contract-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setForm({
        company_name:      json.data.company_name ?? "",
        contact_name:      json.data.contact_name ?? "",
        email:             json.data.email ?? "",
        phone:             json.data.phone ?? null,
        website:           json.data.website ?? null,
        prestations:       json.data.prestations ?? [],
        presta_start_date: json.data.presta_start_date ?? null,
        presta_end_date:   json.data.presta_end_date ?? null,
        budget:            json.data.budget ?? null,
        payment_count:     json.data.payment_count ?? 1,
        client_status:     json.data.client_status ?? "actif",
        notes:             json.data.notes ?? null,
      });
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur d'analyse.");
      setStep("upload");
    }
  }

  function handleConfirm() {
    if (!form) return;
    setStep("creating");
    startTransition(async () => {
      const result = await createClientFromContractAction(form);
      if (result.error) { setError(result.error); setStep("review"); return; }
      setStep("done");
      setTimeout(() => router.push(`/admin/clients/${result.clientId}`), 1500);
    });
  }

  function set<K extends keyof ContractData>(key: K, value: ContractData[K]) {
    setForm((f) => f ? { ...f, [key]: value } : f);
  }

  function togglePrestation(p: string) {
    if (!form) return;
    set("prestations", form.prestations.includes(p)
      ? form.prestations.filter((x) => x !== p)
      : [...form.prestations, p]
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Importer un contrat</h1>
          <p className="text-brand-500 text-sm">Claude analyse le contrat et crée la fiche client + projets automatiquement.</p>
        </div>
      </div>

      {/* Step: Upload */}
      {(step === "upload" || step === "analyzing") && (
        <div className="space-y-4">
          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`card p-10 border-2 border-dashed flex flex-col items-center gap-4 cursor-pointer transition-colors
              ${dragging ? "border-accent bg-accent/5" : "border-brand-200 hover:border-accent/50"}`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {file
              ? <><FileText size={36} className="text-accent" /><p className="font-medium text-brand-900">{file.name}</p><p className="text-xs text-brand-400">{(file.size / 1024).toFixed(0)} Ko</p></>
              : <><Upload size={36} className="text-brand-300" /><p className="font-medium text-brand-600">Déposer le contrat ici</p><p className="text-xs text-brand-400">PDF, TXT ou Markdown — max 10 Mo</p></>
            }
            <input id="file-input" type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {file && (
            <button
              onClick={analyze}
              disabled={step === "analyzing"}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {step === "analyzing"
                ? <><Loader2 size={16} className="animate-spin" /> Analyse en cours…</>
                : <><Wand2 size={16} /> Analyser avec Claude</>
              }
            </button>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && form && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 size={15} /> Contrat analysé — vérifiez et corrigez si besoin avant de créer.
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Informations client</p>
            <div className="grid grid-cols-2 gap-3">
              {([ ["company_name","Entreprise *"], ["contact_name","Contact *"], ["email","Email *"], ["phone","Téléphone"], ["website","Site web"] ] as [keyof ContractData, string][]).map(([key, label]) => (
                <div key={key} className={key === "website" ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-brand-600 mb-1">{label}</label>
                  <input
                    value={(form[key] as string) ?? ""}
                    onChange={(e) => set(key, e.target.value || null as never)}
                    className="input text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Prestations</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESTATIONS.map((p) => {
                const checked = form.prestations.includes(p);
                return (
                  <label key={p} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                    ${checked ? "border-accent bg-accent/5 text-accent font-medium" : "border-brand-200 text-brand-600 hover:border-brand-300"}`}>
                    <input type="checkbox" checked={checked} onChange={() => togglePrestation(p)} className="sr-only" />
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-accent border-accent" : "border-brand-300"}`}>
                      {checked && <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    {p}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Dates, budget & paiement</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Début</label>
                <input type="date" value={form.presta_start_date ?? ""} onChange={(e) => set("presta_start_date", e.target.value || null)} className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Fin</label>
                <input type="date" value={form.presta_end_date ?? ""} onChange={(e) => set("presta_end_date", e.target.value || null)} className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Budget (€ HT)</label>
                <input type="number" value={form.budget ?? ""} onChange={(e) => set("budget", e.target.value ? parseFloat(e.target.value) : null)} className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Paiement en</label>
                <select value={(form as any).payment_count ?? 1} onChange={(e) => set("payment_count" as any, parseInt(e.target.value))} className="input text-sm">
                  <option value={1}>1 fois</option>
                  <option value={2}>2 fois</option>
                  <option value={3}>3 fois</option>
                  <option value={4}>4 fois</option>
                  <option value={6}>6 fois</option>
                </select>
              </div>
            </div>
          </div>

          {form.notes && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-2">Notes extraites</p>
              <textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} rows={3} className="input text-sm resize-none w-full" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setStep("upload"); setError(null); }} className="btn-secondary flex-1">
              ← Recommencer
            </button>
            <button onClick={handleConfirm} disabled={!form.company_name || !form.contact_name || !form.email} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Wand2 size={15} /> Créer le client + projets
            </button>
          </div>
        </div>
      )}

      {/* Step: Creating */}
      {step === "creating" && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-accent animate-spin" />
          <p className="font-medium text-brand-900">Création en cours…</p>
          <p className="text-sm text-brand-400">Fiche client, projets et tâches avec deadlines.</p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <CheckCircle2 size={36} className="text-green-500" />
          <p className="font-medium text-brand-900">Client créé avec succès !</p>
          <p className="text-sm text-brand-400">Redirection vers la fiche client…</p>
        </div>
      )}
    </div>
  );
}
