"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function inviteMemberAction(
  email: string, fullName: string, specialty: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = getAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin`,
    data: { role: "member", full_name: fullName, specialty },
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/equipe");
  return { success: true };
}

export async function removeMemberAction(
  profileId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createServerClient();
  const { data: me } = await supabase.auth.getUser();

  if (profileId === me.user?.id) return { error: "Vous ne pouvez pas vous supprimer vous-même." };

  const admin = getAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return { error: error.message };

  // Unassign from projects and tasks
  await Promise.all([
    supabase.from("projects").update({ assignee_id: null }).eq("assignee_id", profileId),
    supabase.from("tasks").update({ assignee_id: null }).eq("assignee_id", profileId),
    supabase.from("milestones").update({ assignee_id: null }).eq("assignee_id", profileId),
  ]);

  revalidatePath("/admin/equipe");
  return { success: true };
}
