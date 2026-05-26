"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addActivityAction(clientId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("client_activities").insert({
    client_id:     clientId,
    user_id:       user.id,
    type:          formData.get("type") as string,
    content:       formData.get("content") as string,
    activity_date: (formData.get("activity_date") as string) || new Date().toISOString().split("T")[0],
  });

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function deleteActivityAction(activityId: string, clientId: string) {
  const supabase = await createClient();
  await supabase.from("client_activities").delete().eq("id", activityId);
  revalidatePath(`/admin/clients/${clientId}`);
}
