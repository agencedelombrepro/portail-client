import Image from "next/image";
import StatsCharts, { SocialStats } from "@/app/client/statistiques/StatsCharts";
import { LayoutDashboard, FolderKanban, Download, MessageSquare, BarChart3, LogOut } from "lucide-react";

const nav = [
  { label: "Tableau de bord", href: "/demo/client", icon: LayoutDashboard },
  { label: "Mes projets",     href: "#",             icon: FolderKanban },
  { label: "Livrables",       href: "#",             icon: Download },
  { label: "Messages",        href: "#",             icon: MessageSquare },
  { label: "Statistiques",    href: "#",             icon: BarChart3, active: true },
];

const mockGA4 = {
  sessions:           3842,
  pageviews:          9617,
  users:              2901,
  bounceRate:         38,
  avgSessionDuration: 142,
  sessionsOverTime: Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 3, 26 + i);
    return {
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      sessions: Math.floor(80 + Math.random() * 80 + Math.sin(i / 3) * 30),
    };
  }),
  topPages: [
    { page: "/",                     views: 2841 },
    { page: "/services",             views: 1203 },
    { page: "/portfolio",            views: 987 },
    { page: "/contact",              views: 754 },
    { page: "/blog/branding-2026",   views: 521 },
    { page: "/about",                views: 312 },
  ],
  topSources: [
    { source: "Organique",   sessions: 1620 },
    { source: "Direct",      sessions: 980 },
    { source: "Social",      sessions: 640 },
    { source: "Referral",    sessions: 380 },
    { source: "Email",       sessions: 222 },
  ],
};

const mockSearch = {
  clicks:      1247,
  impressions: 18430,
  ctr:         6.8,
  position:    14.2,
  clicksOverTime: Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 3, 26 + i);
    return {
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      clicks:      Math.floor(25 + Math.random() * 30 + Math.cos(i / 4) * 12),
      impressions: Math.floor(450 + Math.random() * 300 + Math.sin(i / 3) * 80),
    };
  }),
  topQueries: [
    { query: "agence communication paris",    clicks: 142, impressions: 1820, ctr: 7.8, position: 8.1 },
    { query: "création site web agence",      clicks: 118, impressions: 2140, ctr: 5.5, position: 11.3 },
    { query: "identité visuelle entreprise",  clicks: 97,  impressions: 1560, ctr: 6.2, position: 12.7 },
    { query: "agence branding",               clicks: 84,  impressions: 980,  ctr: 8.6, position: 6.4 },
    { query: "refonte site internet",         clicks: 76,  impressions: 1230, ctr: 6.2, position: 15.2 },
    { query: "community management prix",     clicks: 61,  impressions: 870,  ctr: 7.0, position: 9.8 },
  ],
};

const mockSocial: SocialStats[] = [
  {
    platform:   "instagram",
    followers:  4820,
    reach:      18640,
    impressions: 31200,
    engagement: 4.7,
    reachOverTime: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(2026, 3, 26 + i);
      return {
        date:        d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        reach:       Math.floor(400 + Math.random() * 300 + Math.sin(i / 3) * 120),
        impressions: Math.floor(800 + Math.random() * 500 + Math.cos(i / 4) * 150),
      };
    }),
    topPosts: [
      { label: "Nouvelle identité visuelle dévoilée 🎨", likes: 312, comments: 28, reach: 4200 },
      { label: "Behind the scenes — shooting produit",   likes: 247, comments: 19, reach: 3100 },
      { label: "Lancement de la collection printemps",   likes: 198, comments: 14, reach: 2800 },
      { label: "Témoignage client — 6 mois de résultats",likes: 176, comments: 32, reach: 2400 },
    ],
  },
  {
    platform:   "facebook",
    followers:  2310,
    reach:      9840,
    impressions: 14700,
    engagement: 2.9,
    reachOverTime: Array.from({ length: 30 }, (_, i) => {
      const d = new Date(2026, 3, 26 + i);
      return {
        date:        d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        reach:       Math.floor(200 + Math.random() * 150 + Math.sin(i / 4) * 60),
        impressions: Math.floor(380 + Math.random() * 250 + Math.cos(i / 3) * 80),
      };
    }),
    topPosts: [
      { label: "Offre spéciale printemps — -20% ce week-end", likes: 87, comments: 12, reach: 1840 },
      { label: "Notre nouveau service SEO en vidéo",           likes: 64, comments: 8,  reach: 1420 },
      { label: "Partenariat avec la ville de Paris",           likes: 58, comments: 21, reach: 1190 },
    ],
  },
];

export default function StatsDemo() {
  return (
    <div className="flex h-screen bg-brand-50 overflow-hidden">
      <aside className="w-60 bg-brand-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-brand-700">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={23} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-tight">Agence de l&apos;Ombre</p>
              <p className="text-xs text-brand-400">Espace client</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ label, href, icon: Icon, active }) => (
            <a key={label} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-brand-700 text-white" : "text-brand-400 hover:bg-brand-800"}`}>
              <Icon size={17} />{label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-brand-700">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-brand-800">
            <LogOut size={17} />Déconnexion
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-brand-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-semibold text-brand-600">Acme Corp</p>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-brand-900">Jean Dupont</p>
              <p className="text-xs text-brand-400">Client</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">JD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-900">Statistiques</h1>
            <p className="text-brand-500 text-sm mt-0.5">Performances de votre site web — 30 derniers jours</p>
          </div>
          <StatsCharts ga4={mockGA4} search={mockSearch} social={mockSocial} />
        </main>
      </div>
    </div>
  );
}
