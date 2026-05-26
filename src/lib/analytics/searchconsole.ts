import { getGoogleAccessToken } from "./google-auth";

export interface SearchConsoleStats {
  clicks:         number;
  impressions:    number;
  ctr:            number;
  position:       number;
  topQueries:     { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  clicksOverTime: { date: string; clicks: number; impressions: number }[];
}

async function scQuery(siteUrl: string, token: string, body: object) {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  return res.json() as Promise<{ rows?: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[] }>;
}

export async function getSearchConsoleStats(siteUrl: string): Promise<SearchConsoleStats | null> {
  try {
    const token = await getGoogleAccessToken("https://www.googleapis.com/auth/webmasters.readonly");
    const end   = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const base  = { startDate: start, endDate: end };

    const [summary, queries, dates] = await Promise.all([
      scQuery(siteUrl, token, { ...base, dimensions: [] }),
      scQuery(siteUrl, token, { ...base, dimensions: ["query"], rowLimit: 10 }),
      scQuery(siteUrl, token, { ...base, dimensions: ["date"] }),
    ]);

    const s = summary.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    return {
      clicks:      Math.round(s.clicks),
      impressions: Math.round(s.impressions),
      ctr:         Math.round(s.ctr * 1000) / 10,
      position:    Math.round(s.position * 10) / 10,
      topQueries:  (queries.rows ?? []).map((r) => ({ query: r.keys?.[0] ?? "", clicks: r.clicks, impressions: r.impressions, ctr: Math.round(r.ctr * 1000) / 10, position: Math.round(r.position * 10) / 10 })),
      clicksOverTime: (dates.rows ?? []).map((r) => ({ date: r.keys?.[0] ?? "", clicks: r.clicks, impressions: r.impressions })),
    };
  } catch (e) {
    console.error("Search Console error:", e);
    return null;
  }
}
