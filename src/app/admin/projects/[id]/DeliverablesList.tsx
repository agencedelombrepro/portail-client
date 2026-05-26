"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, Download, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Deliverable } from "@/types";

interface Props {
  projectId: string;
  deliverables: Deliverable[];
}

export default function DeliverablesList({ projectId, deliverables: initial }: Props) {
  const [deliverables, setDeliverables] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const path = `deliverables/${projectId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage.from("deliverables").upload(path, file);
    if (uploadError) { alert("Erreur lors de l'upload"); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("deliverables").getPublicUrl(path);

    const { data: newD } = await supabase.from("deliverables").insert({
      project_id:  projectId,
      name:        file.name,
      file_url:    publicUrl,
      file_size:   file.size,
      file_type:   file.type,
      uploaded_by: user!.id,
    }).select().single();

    if (newD) setDeliverables([newD as Deliverable, ...deliverables]);
    setUploading(false);
    e.target.value = "";
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-900">Livrables ({deliverables.length})</h2>
        <label className={`btn-secondary flex items-center gap-2 cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Uploader
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <div className="space-y-2">
        {deliverables.length === 0 && <p className="text-sm text-brand-400 text-center py-4">Aucun livrable</p>}
        {deliverables.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-brand-50 hover:bg-brand-100">
            <FileText size={18} className="text-brand-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-900 truncate">{d.name}</p>
              <p className="text-xs text-brand-400">
                {d.file_size ? formatSize(d.file_size) : ""} · {formatDateTime(d.uploaded_at)}
              </p>
            </div>
            {d.file_url && (
              <a href={d.file_url} target="_blank" rel="noopener noreferrer" download className="text-brand-400 hover:text-accent">
                <Download size={16} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
