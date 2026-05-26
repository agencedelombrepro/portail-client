"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { GA4Stats } from "@/lib/analytics/ga4";
import type { SearchConsoleStats } from "@/lib/analytics/searchconsole";

export interface SocialStats {
  platform:    "instagram" | "facebook" | "linkedin" | "gmb";
  followers?:  number;
  reach?:      number;
  impressions?: number;
  engagement?: number;
  // GMB specific
  views?:      number;
  clicks?:     number;
  calls?:      number;
  directions?: number;
  reachOverTime: { date: string; reach?: number; impressions?: number; views?: number; clicks?: number }[];
  topPosts?: { label: string; likes: number; comments: number; reach: number }[];
}

interface Props {
  ga4?:    GA4Stats | null;
  search?: SearchConsoleStats | null;
  social?: SocialStats[] | null;
}

// ─── shared helpers ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-brand-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-brand-900">{value}</p>
      {sub && <p className="text-xs text-brand-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

// ─── tab sections ─────────────────────────────────────────────────────────────

function GA4Section({ ga4 }: { ga4: GA4Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Sessions"       value={ga4.sessions.toLocaleString("fr-FR")} />
        <KpiCard label="Pages vues"     value={ga4.pageviews.toLocaleString("fr-FR")} />
        <KpiCard label="Utilisateurs"   value={ga4.users.toLocaleString("fr-FR")} />
        <KpiCard label="Taux de rebond" value={`${ga4.bounceRate}%`} sub={`Durée moy. ${formatDuration(ga4.avgSessionDuration)}`} />
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-brand-700 mb-4">Sessions par jour</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={ga4.sessionsOverTime}>
            <defs>
              <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F57C1F" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F57C1F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="sessions" stroke="#F57C1F" strokeWidth={2} fill="url(#sessGrad)" name="Sessions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-brand-700 mb-3">Pages les plus visitées</p>
          <div className="space-y-2">
            {ga4.topPages.slice(0, 8).map((p) => (
              <div key={p.page} className="flex items-center gap-2">
                <p className="text-xs text-brand-600 truncate flex-1">{p.page || "/"}</p>
                <span className="text-xs font-medium text-brand-900">{p.views.toLocaleString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-brand-700 mb-3">Sources de trafic</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ga4.topSources} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="source" type="category" width={80} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="sessions" fill="#F57C1F" radius={[0, 4, 4, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SearchSection({ search }: { search: SearchConsoleStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Clics"          value={search.clicks.toLocaleString("fr-FR")} />
        <KpiCard label="Impressions"    value={search.impressions.toLocaleString("fr-FR")} />
        <KpiCard label="CTR"            value={`${search.ctr}%`} />
        <KpiCard label="Position moy."  value={search.position} sub="Plus bas = meilleur" />
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-brand-700 mb-4">Clics & Impressions par jour</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={search.clicksOverTime}>
            <defs>
              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="impressions" stroke="#d1d5db" strokeWidth={1.5} fill="none" name="Impressions" />
            <Area type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} fill="url(#clickGrad)" name="Clics" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-brand-700 mb-3">Requêtes les plus performantes</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-brand-400 border-b border-brand-100">
                <th className="text-left py-2 font-medium">Requête</th>
                <th className="text-right py-2 font-medium">Clics</th>
                <th className="text-right py-2 font-medium">Impressions</th>
                <th className="text-right py-2 font-medium">CTR</th>
                <th className="text-right py-2 font-medium">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {search.topQueries.map((q) => (
                <tr key={q.query} className="hover:bg-brand-50">
                  <td className="py-2 text-brand-900 max-w-[200px] truncate">{q.query}</td>
                  <td className="py-2 text-right text-brand-600">{q.clicks}</td>
                  <td className="py-2 text-right text-brand-600">{q.impressions}</td>
                  <td className="py-2 text-right text-brand-600">{q.ctr}%</td>
                  <td className="py-2 text-right text-brand-600">{q.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GmbSection({ data }: { data: SocialStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Vues fiche"     value={(data.views ?? 0).toLocaleString("fr-FR")} sub="30 derniers jours" />
        <KpiCard label="Clics site web" value={(data.clicks ?? 0).toLocaleString("fr-FR")} />
        <KpiCard label="Appels"         value={(data.calls ?? 0).toLocaleString("fr-FR")} />
        <KpiCard label="Itinéraires"    value={(data.directions ?? 0).toLocaleString("fr-FR")} />
      </div>
      <div className="card p-5">
        <p className="text-sm font-medium text-brand-700 mb-4">Vues & Clics par jour</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.reachOverTime}>
            <defs>
              <linearGradient id="gmbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4285F4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="clicks" stroke="#d1d5db" strokeWidth={1.5} fill="none" name="Clics" />
            <Area type="monotone" dataKey="views" stroke="#4285F4" strokeWidth={2} fill="url(#gmbGrad)" name="Vues" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SocialSection({ data }: { data: SocialStats }) {
  const META: Record<string, { color: string; icon: string }> = {
    instagram: { color: "#E1306C", icon: "📸" },
    facebook:  { color: "#1877F2", icon: "👥" },
    linkedin:  { color: "#0A66C2", icon: "💼" },
    gmb:       { color: "#4285F4", icon: "📍" },
  };
  const meta = META[data.platform];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.followers  != null && <KpiCard label="Abonnés"     value={data.followers.toLocaleString("fr-FR")} />}
        {data.reach      != null && <KpiCard label="Portée"      value={data.reach.toLocaleString("fr-FR")} sub="personnes touchées" />}
        {data.impressions!= null && <KpiCard label="Impressions" value={data.impressions.toLocaleString("fr-FR")} />}
        {data.engagement != null && <KpiCard label="Engagement"  value={`${data.engagement}%`} sub="likes + comments / reach" />}
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-brand-700 mb-4">Portée & Impressions par jour</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.reachOverTime}>
            <defs>
              <linearGradient id={`grad-${data.platform}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={meta.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="impressions" stroke="#d1d5db" strokeWidth={1.5} fill="none" name="Impressions" />
            <Area type="monotone" dataKey="reach" stroke={meta.color} strokeWidth={2} fill={`url(#grad-${data.platform})`} name="Portée" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {data.topPosts && data.topPosts.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-medium text-brand-700 mb-3">Meilleures publications</p>
          <div className="space-y-2">
            {data.topPosts.map((post, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-brand-50">
                <span className="text-xs font-bold text-brand-400 w-4">#{i + 1}</span>
                <p className="text-sm text-brand-800 flex-1 truncate">{post.label}</p>
                <div className="flex items-center gap-3 text-xs text-brand-500 flex-shrink-0">
                  <span>❤️ {post.likes.toLocaleString("fr-FR")}</span>
                  <span>💬 {post.comments}</span>
                  <span className="hidden sm:inline text-brand-400">👁 {post.reach.toLocaleString("fr-FR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── tab definitions ──────────────────────────────────────────────────────────

const TAB_META: Record<string, { label: string; icon: string }> = {
  ga4:       { label: "Site web",        icon: "🌐" },
  search:    { label: "Référencement",   icon: "🔍" },
  gmb:       { label: "Google My Business", icon: "📍" },
  instagram: { label: "Instagram",       icon: "📸" },
  facebook:  { label: "Facebook",        icon: "👥" },
  linkedin:  { label: "LinkedIn",        icon: "💼" },
};

// ─── main export ──────────────────────────────────────────────────────────────

export default function StatsCharts({ ga4, search, social }: Props) {
  const tabs: string[] = [
    ...(ga4    ? ["ga4"]    : []),
    ...(search ? ["search"] : []),
    ...((social ?? []).map((s) => s.platform)),
  ];

  const [active, setActive] = useState(tabs[0] ?? "");

  if (tabs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-brand-500 text-sm">Aucune statistique disponible pour le moment.</p>
        <p className="text-brand-400 text-xs mt-1">Contactez l&apos;agence pour activer le suivi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap bg-brand-50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const meta = TAB_META[tab] ?? { label: tab, icon: "📊" };
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active === tab
                  ? "bg-white text-brand-900 shadow-sm"
                  : "text-brand-500 hover:text-brand-700"
              }`}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Active section */}
      <div>
        {active === "ga4"    && ga4    && <GA4Section    ga4={ga4} />}
        {active === "search" && search && <SearchSection search={search} />}
        {(social ?? []).map((s) =>
          active === s.platform && (
            s.platform === "gmb"
              ? <GmbSection key={s.platform} data={s} />
              : <SocialSection key={s.platform} data={s} />
          )
        )}
      </div>
    </div>
  );
}
