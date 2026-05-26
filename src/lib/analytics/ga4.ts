export interface GA4Stats {
  sessions:       number;
  pageviews:      number;
  users:          number;
  bounceRate:     number;
  avgSessionDuration: number;
  sessionsOverTime: { date: string; sessions: number }[];
  topPages:       { page: string; views: number }[];
  topSources:     { source: string; sessions: number }[];
}

export async function getGA4Stats(propertyId: string): Promise<GA4Stats | null> {
  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        private_key:  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      },
    });

    const [summaryResponse, timeseriesResponse, pagesResponse, sourcesResponse] = await Promise.all([
      // Summary metrics
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      // Sessions over time
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      // Top pages
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      // Traffic sources
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      }),
    ]);

    const row = summaryResponse[0]?.rows?.[0];
    const metrics = row?.metricValues ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionsOverTime = (timeseriesResponse[0]?.rows ?? []).map((r: any) => ({
      date: formatGA4Date(r.dimensionValues?.[0]?.value ?? ""),
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topPages = (pagesResponse[0]?.rows ?? []).map((r: any) => ({
      page:  r.dimensionValues?.[0]?.value ?? "",
      views: Number(r.metricValues?.[0]?.value ?? 0),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topSources = (sourcesResponse[0]?.rows ?? []).map((r: any) => ({
      source:   r.dimensionValues?.[0]?.value ?? "",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    }));

    return {
      sessions:            Number(metrics[0]?.value ?? 0),
      pageviews:           Number(metrics[1]?.value ?? 0),
      users:               Number(metrics[2]?.value ?? 0),
      bounceRate:          Math.round(Number(metrics[3]?.value ?? 0) * 100),
      avgSessionDuration:  Math.round(Number(metrics[4]?.value ?? 0)),
      sessionsOverTime,
      topPages,
      topSources,
    };
  } catch (e) {
    console.error("GA4 error:", e);
    return null;
  }
}

function formatGA4Date(raw: string): string {
  // raw = "20241115" → "15/11"
  if (raw.length !== 8) return raw;
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}`;
}
