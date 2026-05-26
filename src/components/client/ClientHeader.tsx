import { Avatar } from "@/components/ui/Avatar";
import type { Profile } from "@/types";

interface Props { profile: Profile | null; clientName: string; }

export default function ClientHeader({ profile, clientName }: Props) {
  return (
    <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <p className="text-sm font-semibold text-brand-600">{clientName}</p>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-brand-900">{profile?.full_name ?? "—"}</p>
          <p className="text-xs text-brand-400">Client</p>
        </div>
        <Avatar name={profile?.full_name ?? "C"} src={profile?.avatar_url} size="sm" />
      </div>
    </header>
  );
}
