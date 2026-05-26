"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "es", label: "Español",  flag: "🇪🇸" },
];

const STORAGE_KEY = "portal_language";

export default function LanguageForm() {
  const [selected, setSelected] = useState("fr");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelected(stored);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setSelected(lang.code)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              selected === lang.code
                ? "border-accent bg-accent/5 text-accent"
                : "border-brand-200 text-brand-600 hover:border-brand-300 hover:bg-brand-50"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            {lang.label}
            {selected === lang.code && <Check size={14} className="ml-auto" />}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <><Check size={14} /> Sauvegardé</> : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
