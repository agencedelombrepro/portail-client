import { getGoogleAccessToken } from "./google-auth";

export interface GA4Stats {
  sessions:           number;
  pageviews:          number;
  users:              number;
  bounceRate:         number;
  avgSessionDuration: number;
  sessionsOverTime:   { date: string; sessions: number }[];
  topPages:           { page: string; views: number }[];
  topSources:         { source: string; sessions: number }[];
}

async function ga4Report(propertyId: string, token: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  return res.json() as Promise<{ rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] }>;
}

export async function getGA4Stats(propertyId: string): Promise<GA4Stats | null> {
  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/analytics.readonly");
    const range = { startDate: "30daysAgo", endDate: "today" };

    const [summary, timeseries, pages, sources] = await Promise.all([
      ga4Report(propertyId, token, { dateRanges: [range], metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "totalUsers" }, { name: "bounceRate" }, { name: "averageSessionDuration" }] }),
      ga4Report(propertyId, token, { dateRanges: [range], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" } }] }),
      ga4Report(propertyId, token, { dateRanges: [range], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10 }),
      ga4Report(propertyId, token, { dateRanges: [range], dimensions: [{ name: "sessionSource" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 5 }),
    ]);

    const m = summary.rows?.[0]?.metricValues ?? [];
    return {
      sessions:           Number(m[0]?.value ?? 0),
      pageviews:          Number(m[1]?.value ?? 0),
      users:              Number(m[2]?.value ?? 0),
      bounceRate:         Math.round(Number(m[3]?.value ?? 0) * 100),
      avgSessionDuration: Math.round(Number(m[4]?.value ?? 0)),
      sessionsOverTime:   (timeseries.rows ?? []).map((r) => ({ date: formatDate(r.dimensionValues?.[0]?.value ?? ""), sessions: Number(r.metricValues?.[0]?.value ?? 0) })),
      topPages:           (pages.rows ?? []).map((r) => ({ page: r.dimensionValues?.[0]?.value ?? "", views: Number(r.metricValues?.[0]?.value ?? 0) })),
      topSources:         (sources.rows ?? []).map((r) => ({ source: r.dimensionValues?.[0]?.value ?? "", sessions: Number(r.metricValues?.[0]?.value ?? 0) })),
    };
  } catch (e) {
    console.error("GA4 error:", e);
    return null;
  }
}

function formatDate(raw: string): string {
  if (raw.length !== 8) return raw;
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}`;
}
