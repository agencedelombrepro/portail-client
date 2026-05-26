import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

interface Props { profile: Profile | null; }

const roleLabel: Record<string, string> = {
  admin: "Administrateur",
  member: "Membre équipe",
};

export default function AdminHeader({ profile }: Props) {
  return (
    <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-brand-900">{profile?.full_name ?? "—"}</p>
          <p className="text-xs text-brand-400">{roleLabel[profile?.role ?? ""] ?? "—"}</p>
        </div>
        <Avatar name={profile?.full_name ?? "A"} src={profile?.avatar_url} size="sm" />
      </div>
    </header>
  );
}
