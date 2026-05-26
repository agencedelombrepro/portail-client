import StatsCharts, { SocialStats } from "@/app/client/statistiques/StatsCharts";

const mockGA4 = {
  sessions: 3842, pageviews: 9617, users: 2901, bounceRate: 38, avgSessionDuration: 142,
  sessionsOverTime: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 3, 26 + i).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    sessions: 80 + ((i * 37 + 13) % 80) + Math.round(Math.sin(i / 3) * 30),
  })),
  topPages: [
    { page: "/",                    views: 2841 },
    { page: "/services",            views: 1203 },
    { page: "/portfolio",           views: 987 },
    { page: "/contact",             views: 754 },
    { page: "/blog/branding-2026",  views: 521 },
    { page: "/about",               views: 312 },
  ],
  topSources: [
    { source: "Organique", sessions: 1620 },
    { source: "Direct",    sessions: 980 },
    { source: "Social",    sessions: 640 },
    { source: "Referral",  sessions: 380 },
    { source: "Email",     sessions: 222 },
  ],
};

const mockSearch = {
  clicks: 1247, impressions: 18430, ctr: 6.8, position: 14.2,
  clicksOverTime: Array.from({ length: 30 }, (_, i) => ({
    date:        new Date(2026, 3, 26 + i).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    clicks:      25 + ((i * 31 + 7) % 30),
    impressions: 450 + ((i * 113 + 41) % 300),
  })),
  topQueries: [
    { query: "agence communication paris",   clicks: 142, impressions: 1820, ctr: 7.8, position: 8.1 },
    { query: "création site web agence",     clicks: 118, impressions: 2140, ctr: 5.5, position: 11.3 },
    { query: "identité visuelle entreprise", clicks: 97,  impressions: 1560, ctr: 6.2, position: 12.7 },
    { query: "agence branding",              clicks: 84,  impressions: 980,  ctr: 8.6, position: 6.4 },
    { query: "refonte site internet",        clicks: 76,  impressions: 1230, ctr: 6.2, position: 15.2 },
    { query: "community management prix",    clicks: 61,  impressions: 870,  ctr: 7.0, position: 9.8 },
  ],
};

const mockSocial: SocialStats[] = [
  {
    platform: "gmb",
    views: 2841, clicks: 312, calls: 47, directions: 89,
    reachOverTime: Array.from({ length: 30 }, (_, i) => ({
      date:   new Date(2026, 3, 26 + i).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      views:  60 + ((i * 53 + 11) % 60),
      clicks: 6  + ((i * 17 + 3)  % 15),
    })),
  },
  {
    platform: "instagram", followers: 4820, reach: 18640, impressions: 31200, engagement: 4.7,
    reachOverTime: Array.from({ length: 30 }, (_, i) => ({
      date:        new Date(2026, 3, 26 + i).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      reach:       400 + ((i * 71 + 23) % 300),
      impressions: 800 + ((i * 97 + 53) % 500),
    })),
    topPosts: [
      { label: "Nouvelle identité visuelle dévoilée 🎨",  likes: 312, comments: 28, reach: 4200 },
      { label: "Behind the scenes — shooting produit",    likes: 247, comments: 19, reach: 3100 },
      { label: "Lancement de la collection printemps",    likes: 198, comments: 14, reach: 2800 },
      { label: "Témoignage client — 6 mois de résultats", likes: 176, comments: 32, reach: 2400 },
    ],
  },
  {
    platform: "facebook", followers: 2310, reach: 9840, impressions: 14700, engagement: 2.9,
    reachOverTime: Array.from({ length: 30 }, (_, i) => ({
      date:        new Date(2026, 3, 26 + i).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      reach:       200 + ((i * 43 + 17) % 150),
      impressions: 380 + ((i * 67 + 31) % 250),
    })),
    topPosts: [
      { label: "Offre spéciale printemps — -20% ce week-end", likes: 87, comments: 12, reach: 1840 },
      { label: "Notre nouveau service SEO en vidéo",           likes: 64, comments: 8,  reach: 1420 },
      { label: "Partenariat avec la ville de Paris",           likes: 58, comments: 21, reach: 1190 },
    ],
  },
];

export default function DemoClientStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Statistiques</h1>
        <p className="text-brand-500 text-sm mt-0.5">Performances de votre site web et réseaux sociaux — 30 derniers jours</p>
      </div>
      <StatsCharts ga4={mockGA4} search={mockSearch} social={mockSocial} />
    </div>
  );
}
