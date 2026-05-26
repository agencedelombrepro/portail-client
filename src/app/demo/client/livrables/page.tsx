import { Download, FileText } from "lucide-react";

const deliverables = [
  { name: "Maquettes_v2_finale.fig",    size: "4.2 MB",  date: "15 mai 2026",  project: "Refonte site web" },
  { name: "Charte_graphique.pdf",       size: "2.1 MB",  date: "3 mai 2026",   project: "Refonte site web" },
  { name: "Contenu_pages.docx",         size: "890 KB",  date: "28 avr. 2026", project: "Refonte site web" },
  { name: "Rapport_campagne_Q1.pdf",    size: "1.8 MB",  date: "5 avr. 2026",  project: "Campagne Google Ads" },
  { name: "Visuels_Display.zip",        size: "12.4 MB", date: "12 fév. 2026", project: "Campagne Google Ads" },
];

export default function DemoDeliverablesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Livrables</h1>
        <p className="text-brand-500 text-sm mt-0.5">{deliverables.length} fichiers disponibles</p>
      </div>

      <div className="card divide-y divide-brand-50">
        {deliverables.map((d) => (
          <div key={d.name} className="flex items-center gap-4 p-4 hover:bg-brand-50 transition-colors">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brand-900 truncate">{d.name}</p>
              <p className="text-xs text-brand-400">{d.project} · {d.size} · {d.date}</p>
            </div>
            <button className="btn-primary flex items-center gap-2 flex-shrink-0">
              <Download size={14} /> Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
