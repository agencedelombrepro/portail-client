import { createClient } from "@/lib/supabase/server";
import { MemberCard } from "./MemberCard";
import { AddMemberForm } from "./AddMemberForm";

const TEAM_SPECIALTIES: Record<string, { specialty: string; color: string; prestations: string[] }> = {
  "hello@agencedelombre.fr": {
    specialty: "Site web & Tech",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    prestations: ["Site web", "Refonte de site web", "Application mobile", "Pack maintenance"],
  },
  "marjorie@agencedelombre.fr": {
    specialty: "Communication & Identité Visuelle",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    prestations: ["Identité visuelle / Branding", "Community Management", "Campagne Meta Ads", "Email marketing"],
  },
  "cindy@agencedelombre.fr": {
    specialty: "SEO & Fiche Google",
    color: "bg-green-100 text-green-700 border-green-200",
    prestations: ["SEO / Référencement", "Audit & conseil"],
  },
  "kathleen@agencedelombre.fr": {
    specialty: "Media Buying",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    prestations: ["Campagne Google Ads", "Campagne Meta Ads"],
  },
};

const HARDCODED_MEMBERS = [
  { name: "Johanna Goncalves",  email: "hello@agencedelombre.fr",    initials: "JG" },
  { name: "Marjorie Capron",    email: "marjorie@agencedelombre.fr", initials: "MC" },
  { name: "Cindy Gallot",       email: "cindy@agencedelombre.fr",    initials: "CG" },
  { name: "Kathleen Weatherly", email: "kathleen@agencedelombre.fr", initials: "KW" },
];

export default async function EquipePage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: currentUser }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,email,role,specialty").in("role", ["admin", "member"]),
    supabase.auth.getUser(),
  ]);

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.user?.id ?? "")
    .single();

  const isAdmin = currentProfile?.role === "admin";
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.email, p]));

  // Build full member list: hardcoded first, then extra DB members not in hardcoded list
  const hardcodedEmails = new Set(HARDCODED_MEMBERS.map((m) => m.email));
  const extraMembers = (profiles ?? [])
    .filter((p) => !hardcodedEmails.has(p.email))
    .map((p) => ({
      name: p.full_name ?? p.email,
      email: p.email ?? "",
      initials: (p.full_name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase(),
    }));

  const allMembers = [...HARDCODED_MEMBERS, ...extraMembers];

  const statsPerMember = await Promise.all(
    allMembers.map(async (m) => {
      const profile = profileMap[m.email];
      if (!profile) return { ...m, projectCount: 0, taskCount: 0, profileId: null };

      const [{ count: projectCount }, { count: taskCount }] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("assignee_id", profile.id),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("assignee_id", profile.id).neq("status", "done"),
      ]);

      return { ...m, projectCount: projectCount ?? 0, taskCount: taskCount ?? 0, profileId: profile.id };
    })
  );

  const registeredCount = statsPerMember.filter((m) => m.profileId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Équipe</h1>
          <p className="text-brand-500 text-sm">
            Agence de l&apos;Ombre · {statsPerMember.length} membres
            <span className="ml-2 text-brand-400">· {registeredCount} connectés</span>
          </p>
        </div>
        {isAdmin && <AddMemberForm />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {statsPerMember.map((m) => {
          const info = TEAM_SPECIALTIES[m.email] ?? (
            profileMap[m.email]?.specialty
              ? { specialty: profileMap[m.email].specialty, color: "bg-brand-100 text-brand-600 border-brand-200", prestations: [] }
              : undefined
          );
          return (
            <MemberCard key={m.email} member={m} info={info} isAdmin={isAdmin} />
          );
        })}
      </div>
    </div>
  );
}
