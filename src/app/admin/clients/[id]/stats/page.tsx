import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatsCharts, { SocialStats } from "@/app/client/statistiques/StatsCharts";
import StatsVisibilityForm from "./StatsVisibilityForm";
import { getGA4Stats } from "@/lib/analytics/ga4";
import { getSearchConsoleStats } from "@/lib/analytics/searchconsole";

export default async function AdminClientStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const [ga4Data, searchData] = await Promise.all([
    client.ga4_property_id ? getGA4Stats(client.ga4_property_id).catch(() => null) : null,
    client.search_console_url ? getSearchConsoleStats(client.search_console_url).catch(() => null) : null,
  ]);

  // Réseaux sociaux — placeholder jusqu'à intégration OAuth
  const socialData: SocialStats[] = [];

  const visibility = {
    stats_show_ga4:            client.stats_show_ga4 ?? true,
    stats_show_search_console: client.stats_show_search_console ?? true,
    stats_show_instagram:      client.stats_show_instagram ?? false,
    stats_show_facebook:       client.stats_show_facebook ?? false,
    stats_show_linkedin:       client.stats_show_linkedin ?? false,
  };

  const hasNoIntegration = !client.ga4_property_id && !client.search_console_url;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/clients/${id}`} className="text-brand-400 hover:text-brand-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Stats — {client.company_name}</h1>
          <p className="text-brand-500 text-sm">Vue admin · 30 derniers jours</p>
        </div>
      </div>

      {/* Visibility controls */}
      <StatsVisibilityForm clientId={id} initial={visibility} />

      {/* Preview */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-4">Aperçu — ce que voit le client</p>

        {hasNoIntegration && (
          <div className="card p-6 text-center">
            <p className="text-brand-500 text-sm">Aucune intégration analytics configurée pour ce client.</p>
            <Link href={`/admin/clients/${id}/edit`} className="text-accent text-sm hover:underline mt-1 block">
              Ajouter GA4 / Search Console →
            </Link>
          </div>
        )}

        <StatsCharts
          ga4={visibility.stats_show_ga4 ? ga4Data : null}
          search={visibility.stats_show_search_console ? searchData : null}
          social={socialData.filter((s) =>
            (s.platform === "instagram" && visibility.stats_show_instagram) ||
            (s.platform === "facebook"  && visibility.stats_show_facebook)  ||
            (s.platform === "linkedin"  && visibility.stats_show_linkedin)
          )}
        />
      </div>
    </div>
  );
}
