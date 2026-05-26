"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

// Recalcule progress = % milestones completed et met à jour le projet
async function syncProjectProgress(supabase: SupabaseClient, projectId: string) {
  const { data: milestones } = await supabase
    .from("milestones")
    .select("status")
    .eq("project_id", projectId);

  if (!milestones || milestones.length === 0) return;

  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completed / milestones.length) * 100);

  await supabase.from("projects").update({ progress }).eq("id", projectId);
}

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient();
  const data = {
    client_id:   formData.get("client_id") as string,
    name:        formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status:      (formData.get("status") as string) || "active",
    start_date:  (formData.get("start_date") as string) || null,
    end_date:    (formData.get("end_date") as string) || null,
    progress:    Number(formData.get("progress") ?? 0),
  };
  const { data: project, error } = await supabase.from("projects").insert(data).select().single();
  if (error || !project) redirect("/admin/projects?error=create");
  redirect(`/admin/projects/${project!.id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const data = {
    client_id:   formData.get("client_id") as string,
    name:        formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status:      formData.get("status") as string,
    start_date:  (formData.get("start_date") as string) || null,
    end_date:    (formData.get("end_date") as string) || null,
    progress:    Number(formData.get("progress") ?? 0),
  };
  const { error } = await supabase.from("projects").update(data).eq("id", id);
  if (error) redirect(`/admin/projects/${id}?error=update`);
  revalidatePath(`/admin/projects/${id}`);
  redirect(`/admin/projects/${id}`);
}

export async function createMilestoneAction(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { count } = await supabase.from("milestones").select("*", { count: "exact", head: true }).eq("project_id", projectId);
  await supabase.from("milestones").insert({
    project_id:  projectId,
    title:       formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date:    (formData.get("due_date") as string) || null,
    status:      "pending",
    order:       (count ?? 0) + 1,
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function updateMilestoneStatusAction(milestoneId: string, status: string, projectId: string) {
  const supabase = await createClient();

  const update: Record<string, string | null> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();
  else update.completed_at = null;

  await supabase.from("milestones").update(update).eq("id", milestoneId);
  await syncProjectProgress(supabase, projectId);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function updateMilestoneAction(
  milestoneId: string,
  projectId: string,
  data: { title?: string; description?: string | null; due_date?: string | null; assignee_id?: string | null }
) {
  const supabase = await createClient();
  await supabase.from("milestones").update(data).eq("id", milestoneId);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/tasks");
}

export async function deleteMilestoneAction(milestoneId: string, projectId: string) {
  const supabase = await createClient();
  await supabase.from("milestones").delete().eq("id", milestoneId);
  await syncProjectProgress(supabase, projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/tasks");
}

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("client_id").eq("id", projectId).single();
  await supabase.from("milestones").delete().eq("project_id", projectId);
  await supabase.from("deliverables").delete().eq("project_id", projectId);
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/admin/projects");
  if (project?.client_id) revalidatePath(`/admin/clients/${project.client_id}`);
  redirect("/admin/projects");
}

// Exporté pour task-actions (même logique depuis la liste des tâches)
export { syncProjectProgress };
