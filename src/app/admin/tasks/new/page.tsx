import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createTaskAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const data = {
    client_id:   (formData.get("client_id") as string) || null,
    project_id:  (formData.get("project_id") as string) || null,
    title:       formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    priority:    (formData.get("priority") as string) || "medium",
    status:      "todo",
    due_date:    (formData.get("due_date") as string) || null,
  };
  await supabase.from("tasks").insert(data);
  redirect("/admin/tasks");
}

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client: clientId } = await searchParams;
  const supabase = await createClient();
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("id,company_name").order("company_name"),
    supabase.from("projects").select("id,name,client_id").eq("status", "active").order("name"),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tasks" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-brand-900">Nouvelle tâche</h1>
      </div>

      <form action={createTaskAction} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Titre *</label>
          <input name="title" required className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Description</label>
          <textarea name="description" rows={2} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Client</label>
            <select name="client_id" className="input" defaultValue={clientId ?? ""}>
              <option value="">— Aucun</option>
              {clients?.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Projet</label>
            <select name="project_id" className="input">
              <option value="">— Aucun</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Priorité</label>
            <select name="priority" className="input" defaultValue="medium">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Échéance</label>
            <input name="due_date" type="date" className="input" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/tasks" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">Créer</button>
        </div>
      </form>
    </div>
  );
}
