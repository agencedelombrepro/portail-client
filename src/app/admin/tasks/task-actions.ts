"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function syncProjectProgress(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data: milestones } = await supabase
    .from("milestones")
    .select("status")
    .eq("project_id", projectId);

  if (!milestones || milestones.length === 0) return;
  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress = Math.round((completed / milestones.length) * 100);
  await supabase.from("projects").update({ progress }).eq("id", projectId);
}

export async function updateRowStatus(source: "task" | "milestone", id: string, status: string) {
  const supabase = await createClient();

  if (source === "milestone") {
    const msStatus = status === "done" ? "completed" : status === "in_progress" ? "in_progress" : "pending";
    const update: Record<string, string | null> = { status: msStatus };
    if (msStatus === "completed") update.completed_at = new Date().toISOString();
    else update.completed_at = null;

    await supabase.from("milestones").update(update).eq("id", id);

    // Recalculate project progress
    const { data: ms } = await supabase.from("milestones").select("project_id").eq("id", id).single();
    if (ms?.project_id) await syncProjectProgress(supabase, ms.project_id);
  } else {
    await supabase.from("tasks").update({ status }).eq("id", id);
  }

  revalidatePath("/admin/tasks");
  revalidatePath("/admin/projects");
}

export async function updateRowAssignee(source: "task" | "milestone", id: string, assigneeId: string | null) {
  const supabase = await createClient();
  const table = source === "milestone" ? "milestones" : "tasks";
  await supabase.from(table as any).update({ assignee_id: assigneeId || null }).eq("id", id);
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/projects");
}
