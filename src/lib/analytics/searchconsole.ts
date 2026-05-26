export interface SearchConsoleStats {
  clicks:       number;
  impressions:  number;
  ctr:          number;
  position:     number;
  topQueries:   { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  clicksOverTime: { date: string; clicks: number; impressions: number }[];
}

export async function getSearchConsoleStats(siteUrl: string): Promise<SearchConsoleStats | null> {
  try {
    const { google } = await import("googleapis");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key:  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const sc = google.searchconsole({ version: "v1", auth });
    const endDate   = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [summaryRes, queriesRes, dateRes] = await Promise.all([
      sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions: [] } }),
      sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 10 } }),
      sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions: ["date"] } }),
    ]);

    const summary = summaryRes.data.rows?.[0] ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topQueries = (queriesRes.data.rows ?? []).map((r: any) => ({
      query:       (r.keys?.[0] ?? ""),
      clicks:      r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr:         Math.round((r.ctr ?? 0) * 100 * 10) / 10,
      position:    Math.round((r.position ?? 0) * 10) / 10,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clicksOverTime = (dateRes.data.rows ?? []).map((r: any) => ({
      date:        r.keys?.[0] ?? "",
      clicks:      r.clicks ?? 0,
      impressions: r.impressions ?? 0,
    }));

    return {
      clicks:      Math.round(summary.clicks ?? 0),
      impressions: Math.round(summary.impressions ?? 0),
      ctr:         Math.round((summary.ctr ?? 0) * 100 * 10) / 10,
      position:    Math.round((summary.position ?? 0) * 10) / 10,
      topQueries,
      clicksOverTime,
    };
  } catch (e) {
    console.error("Search Console error:", e);
    return null;
  }
}
