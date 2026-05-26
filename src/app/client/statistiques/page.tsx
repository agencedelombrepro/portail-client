import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsCharts from "./StatsCharts";
import { getGA4Stats } from "@/lib/analytics/ga4";
import { getSearchConsoleStats } from "@/lib/analytics/searchconsole";

export default async function ClientStatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase
    .from("clients")
    .select("id,ga4_property_id,search_console_url")
    .eq("user_id", user.id)
    .single();
  if (!clientData) redirect("/client");

  const [ga4Data, searchData] = await Promise.all([
    clientData.ga4_property_id ? getGA4Stats(clientData.ga4_property_id) : null,
    clientData.search_console_url ? getSearchConsoleStats(clientData.search_console_url) : null,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Statistiques</h1>
        <p className="text-brand-500 text-sm mt-0.5">Performances de votre site web — 30 derniers jours</p>
      </div>

      {!clientData.ga4_property_id && !clientData.search_console_url && (
        <div className="card p-8 text-center">
          <p className="text-brand-500 text-sm">Les intégrations analytics ne sont pas encore configurées.</p>
          <p className="text-brand-400 text-xs mt-1">Contactez l&apos;agence pour activer le suivi de vos statistiques.</p>
        </div>
      )}

      <StatsCharts ga4={ga4Data} search={searchData} />
    </div>
  );
}
