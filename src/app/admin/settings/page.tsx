import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import EmailForm from "./EmailForm";
import PasswordForm from "./PasswordForm";
import LanguageForm from "./LanguageForm";
import { User, Mail, Lock, Globe } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Paramètres</h1>
        <p className="text-brand-500 text-sm mt-0.5">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil */}
      <Section icon={User} title="Profil" description="Votre nom affiché dans l'interface">
        <ProfileForm currentName={profile?.full_name ?? ""} />
      </Section>

      {/* Langue */}
      <Section icon={Globe} title="Langue" description="Langue de l'interface">
        <LanguageForm />
      </Section>

      {/* Email */}
      <Section icon={Mail} title="Adresse email" description="Email utilisé pour la connexion">
        <EmailForm currentEmail={user.email ?? ""} />
      </Section>

      {/* Mot de passe */}
      <Section icon={Lock} title="Mot de passe" description="Modifiez votre mot de passe de connexion">
        <PasswordForm />
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-100 bg-brand-50/50">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold text-brand-900 text-sm">{title}</p>
          <p className="text-xs text-brand-400">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
