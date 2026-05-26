"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const full_name = formData.get("full_name") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: "Nom mis à jour." };
}

export async function updateEmailAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: error.message };

  return { success: "Un email de confirmation a été envoyé à votre nouvelle adresse." };
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const current  = formData.get("current_password") as string;
  const next     = formData.get("new_password") as string;
  const confirm  = formData.get("confirm_password") as string;

  if (next !== confirm) return { error: "Les mots de passe ne correspondent pas." };
  if (next.length < 8)  return { error: "Le mot de passe doit contenir au moins 8 caractères." };

  // Verify current password by re-signing in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Impossible de récupérer l'utilisateur." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyError) return { error: "Mot de passe actuel incorrect." };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { success: "Mot de passe mis à jour avec succès." };
}
