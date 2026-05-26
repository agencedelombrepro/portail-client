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

export async function inviteClientAction(
  clientId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("email, company_name, contact_name, user_id")
    .eq("id", clientId)
    .single();

  if (!client) return { error: "Client introuvable." };
  if (client.user_id) return { error: "Ce client a déjà un compte actif." };

  const admin = getAdminClient();

  const { error } = await admin.auth.admin.inviteUserByEmail(client.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/client`,
    data: { role: "client", full_name: client.contact_name },
  });

  if (error) return { error: error.message };

  await supabase
    .from("clients")
    .update({ invitation_sent_at: new Date().toISOString() })
    .eq("id", clientId);

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
  return { success: true };
}

export async function revokeClientAccessAction(
  clientId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("user_id")
    .eq("id", clientId)
    .single();

  if (!client?.user_id) return { error: "Aucun compte associé." };

  const admin = getAdminClient();
  await admin.auth.admin.deleteUser(client.user_id);

  await supabase
    .from("clients")
    .update({ user_id: null, invitation_sent_at: null, invitation_accepted_at: null })
    .eq("id", clientId);

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
  return { success: true };
}
