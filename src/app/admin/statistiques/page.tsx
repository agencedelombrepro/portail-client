import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Users, Euro, CalendarClock, Target } from "lucide-react";
import { PrestationBarChart, StatusPieChart, ExpiryTimelineChart } from "./StatsCharts";

function kpi(label: string, value: string, sub: string, icon: React.ElementType, color: string, bg: string) {
  return { label, value, sub, icon, color, bg };
}

export default async function StatistiquesPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("client_status, prestation, budget, presta_end_date");

  const { data: projects } = await supabase
    .from("projects")
    .select("status");

  const all = clients ?? [];

  // KPIs
  const totalClients = all.length;
  const activeClients = all.filter((c) => c.client_status === "actif").length;
  const prospects = all.filter((c) => c.client_status === "prospect").length;
  const conversionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

  const totalBudget = all
    .filter((c) => c.client_status === "actif" && c.budget)
    .reduce((sum, c) => sum + (c.budget ?? 0), 0);

  const pipelineBudget = all
    .filter((c) => c.client_status === "prospect" && c.budget)
    .reduce((sum, c) => sum + (c.budget ?? 0), 0);

  const today = new Date();
  const in30 = all.filter((c) => {
    if (!c.presta_end_date) return false;
    const d = Math.ceil((new Date(c.presta_end_date).getTime() - today.getTime()) / 86400000);
    return d >= 0 && d <= 30;
  }).length;

  const formatEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  // Clients par statut (pie)
  const statusGroups = ["prospect", "actif", "pause", "terminé"].map((s) => ({
    name: { prospect: "Prospect", actif: "Actif", pause: "En pause", "terminé": "Terminé" }[s] ?? s,
    value: all.filter((c) => c.client_status === s).length,
  })).filter((d) => d.value > 0);

  // Clients par prestation (bar)
  const prestationMap: Record<string, { count: number; budget: number }> = {};
  for (const c of all) {
    const key = c.prestation ?? "Non défini";
    if (!prestationMap[key]) prestationMap[key] = { count: 0, budget: 0 };
    prestationMap[key].count++;
    prestationMap[key].budget += c.budget ?? 0;
  }
  const prestationData = Object.entries(prestationMap)
    .map(([name, v]) => ({ name: name.length > 20 ? name.substring(0, 18) + "…" : name, ...v }))
    .sort((a, b) => b.count - a.count);

  // Fins de prestation par mois (6 prochains mois)
  const expiryByMonth: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    expiryByMonth[key] = 0;
  }
  for (const c of all) {
    if (!c.presta_end_date) continue;
    const d = new Date(c.presta_end_date);
    const diff = (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth());
    if (diff < 0 || diff >= 6) continue;
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    expiryByMonth[key] = (expiryByMonth[key] ?? 0) + 1;
  }
  const expiryData = Object.entries(expiryByMonth).map(([month, count]) => ({ month, count }));

  const activeProjects = (projects ?? []).filter((p) => p.status === "active").length;

  const kpis = [
    kpi("CA actif (budgets)", formatEUR(totalBudget), `${activeClients} client${activeClients > 1 ? "s" : ""} actifs`, TrendingUp, "text-green-600", "bg-green-50"),
    kpi("Pipeline prospects", formatEUR(pipelineBudget), `${prospects} prospect${prospects > 1 ? "s" : ""}`, Target, "text-blue-600", "bg-blue-50"),
    kpi("Taux de conversion", `${conversionRate}%`, "prospect → actif", Users, "text-purple-600", "bg-purple-50"),
    kpi("Expirent < 30j", `${in30}`, `contrat${in30 > 1 ? "s" : ""} à renouveler`, CalendarClock, in30 > 0 ? "text-orange-600" : "text-brand-500", in30 > 0 ? "bg-orange-50" : "bg-brand-50"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Statistiques</h1>
        <p className="text-brand-500 text-sm mt-0.5">Vue commerciale de l&apos;agence</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs text-brand-500 leading-tight">{label}</p>
                <p className="text-2xl font-bold text-brand-900 mt-1 truncate">{value}</p>
                <p className="text-xs text-brand-400 mt-0.5">{sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 ml-2`}>
                <Icon size={18} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par prestation */}
        <div className="card p-5">
          <h2 className="font-semibold text-brand-900 mb-4">Clients par type de prestation</h2>
          {prestationData.length > 0 ? (
            <PrestationBarChart data={prestationData} />
          ) : (
            <p className="text-sm text-brand-400 text-center py-8">Aucune prestation renseignée</p>
          )}
        </div>

        {/* Répartition par statut */}
        <div className="card p-5">
          <h2 className="font-semibold text-brand-900 mb-4">Répartition par statut</h2>
          {statusGroups.length > 0 ? (
            <StatusPieChart data={statusGroups} />
          ) : (
            <p className="text-sm text-brand-400 text-center py-8">Aucun client</p>
          )}
        </div>
      </div>

      {/* Fins de prestation */}
      <div className="card p-5">
        <h2 className="font-semibold text-brand-900 mb-1">Fins de prestation — 6 prochains mois</h2>
        <p className="text-xs text-brand-400 mb-4">Contrats à anticiper pour les renouvellements</p>
        <ExpiryTimelineChart data={expiryData} />
      </div>

      {/* Résumé projets */}
      <div className="card p-5">
        <h2 className="font-semibold text-brand-900 mb-3">Projets en cours</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "En cours",  status: "active",    color: "text-green-600 bg-green-50" },
            { label: "Lead",      status: "lead",      color: "text-blue-600 bg-blue-50" },
            { label: "En pause",  status: "paused",    color: "text-orange-600 bg-orange-50" },
            { label: "Terminés",  status: "completed", color: "text-brand-500 bg-brand-50" },
          ].map(({ label, status, color }) => {
            const count = (projects ?? []).filter((p) => p.status === status).length;
            return (
              <div key={status} className={`rounded-lg p-4 ${color.split(" ")[1]}`}>
                <p className={`text-2xl font-bold ${color.split(" ")[0]}`}>{count}</p>
                <p className="text-xs text-brand-600 mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
