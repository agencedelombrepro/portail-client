"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PRESTATION_TEMPLATES } from "@/lib/prestation-templates";

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function createProjectsFromTemplates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
  prestations: string[],
  startDate: Date
) {
  const validPrestations = prestations.filter((p) => PRESTATION_TEMPLATES[p]?.length);

  for (const prestation of validPrestations) {
    const templates = PRESTATION_TEMPLATES[prestation];
    if (!templates?.length) continue;

    for (const tpl of templates) {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          client_id:   clientId,
          name:        tpl.name,
          description: tpl.description,
          status:      "active",
          progress:    0,
          start_date:  addDays(startDate, tpl.start_offset_days),
          end_date:    addDays(startDate, tpl.end_offset_days),
        })
        .select("id")
        .single();

      if (error || !project) continue;

      await supabase.from("milestones").insert(
        tpl.milestones.map((m, i) => ({
          project_id: project.id,
          title:      m.title,
          status:     "pending",
          order:      i + 1,
          due_date:   addDays(startDate, m.due_offset_days),
        }))
      );
    }
  }
}

export async function initProjectsFromPrestationsAction(clientId: string, prestations: string[]) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("presta_start_date")
    .eq("id", clientId)
    .single();

  const startDate = client?.presta_start_date ? new Date(client.presta_start_date) : new Date();

  await createProjectsFromTemplates(supabase, clientId, prestations, startDate);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/projects");
}

export async function reinitProjectsAction(clientId: string, prestations: string[]) {
  const supabase = await createClient();

  // Supprime tous les projets existants (milestones + deliverables en cascade)
  const { data: existingProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("client_id", clientId);

  if (existingProjects?.length) {
    const ids = existingProjects.map((p) => p.id);
    await supabase.from("milestones").delete().in("project_id", ids);
    await supabase.from("deliverables").delete().in("project_id", ids);
    await supabase.from("projects").delete().eq("client_id", clientId);
  }

  const { data: client } = await supabase
    .from("clients")
    .select("presta_start_date")
    .eq("id", clientId)
    .single();

  const startDate = client?.presta_start_date ? new Date(client.presta_start_date) : new Date();

  await createProjectsFromTemplates(supabase, clientId, prestations, startDate);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/projects");
}
