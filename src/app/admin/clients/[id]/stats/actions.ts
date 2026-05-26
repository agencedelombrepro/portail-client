"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStatsVisibilityAction(
  clientId: string,
  visibility: {
    stats_show_ga4: boolean;
    stats_show_search_console: boolean;
    stats_show_instagram: boolean;
    stats_show_facebook: boolean;
    stats_show_linkedin: boolean;
  }
) {
  const supabase = await createClient();
  await supabase.from("clients").update(visibility).eq("id", clientId);
  revalidatePath(`/admin/clients/${clientId}/stats`);
}
