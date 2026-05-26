"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function extractClientData(formData: FormData) {
  return {
    company_name:       formData.get("company_name") as string,
    contact_name:       formData.get("contact_name") as string,
    email:              formData.get("email") as string,
    phone:              (formData.get("phone") as string) || null,
    website:            (formData.get("website") as string) || null,
    notes:              (formData.get("notes") as string) || null,
    ga4_property_id:    (formData.get("ga4_property_id") as string) || null,
    search_console_url: (formData.get("search_console_url") as string) || null,
    client_status:      (formData.get("client_status") as string) || "actif",
    prestation:         (formData.get("prestation") as string) || null,
    prestations:        formData.getAll("prestations").filter(Boolean) as string[],
    presta_start_date:  (formData.get("presta_start_date") as string) || null,
    presta_end_date:    (formData.get("presta_end_date") as string) || null,
    budget:             formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
    logo_url:           (formData.get("logo_url") as string) || null,
    card_color:         (formData.get("card_color") as string) || "#f8fafc",
    payment_count:      formData.get("payment_count") ? parseInt(formData.get("payment_count") as string) : 1,
  };
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .insert(extractClientData(formData))
    .select()
    .single();
  if (error || !client) redirect("/admin/clients?error=create");
  redirect(`/admin/clients/${client!.id}`);
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update(extractClientData(formData))
    .eq("id", id);
  if (error) redirect(`/admin/clients/${id}/edit?error=update`);
  redirect(`/admin/clients/${id}`);
}

export async function updateClientStatusAction(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("clients").update({ client_status: status }).eq("id", id);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/clients/kanban");
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", id);
  redirect("/admin/clients");
}
