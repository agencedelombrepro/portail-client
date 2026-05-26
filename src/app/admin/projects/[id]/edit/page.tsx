import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProjectAction } from "../../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase.from("clients").select("id,company_name").order("company_name"),
  ]);

  if (!project) notFound();

  const action = updateProjectAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/projects/${id}`} className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-brand-900">Modifier le projet</h1>
      </div>

      <form action={action} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-1">Client *</label>
            <select name="client_id" required defaultValue={project.client_id} className="input">
              <option value="" disabled>Sélectionner un client</option>
              {clients?.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-1">Nom du projet *</label>
            <input name="name" required defaultValue={project.name} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-brand-700 mb-1">Description</label>
            <textarea name="description" rows={3} defaultValue={project.description ?? ""} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Statut</label>
            <select name="status" defaultValue={project.status} className="input">
              <option value="lead">Lead</option>
              <option value="active">En cours</option>
              <option value="paused">Pause</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Avancement (%)</label>
            <input name="progress" type="number" min="0" max="100" defaultValue={project.progress ?? 0} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Date de début</label>
            <input name="start_date" type="date" defaultValue={project.start_date ?? ""} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Date de fin</label>
            <input name="end_date" type="date" defaultValue={project.end_date ?? ""} className="input" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/admin/projects/${id}`} className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
