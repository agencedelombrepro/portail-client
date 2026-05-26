import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, AlertCircle, LayoutGrid, Search, Download, FileUp, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const clientStatusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  actif: "success", prospect: "default", pause: "warning", "terminé": "danger",
};
const clientStatusLabel: Record<string, string> = {
  actif: "Actif", prospect: "Prospect", pause: "En pause", "terminé": "Terminé",
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; prestation?: string }>;
}) {
  const { q, status, prestation } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clients").select("*").order("company_name");
  if (status) query = query.eq("client_status", status);
  if (prestation) query = query.eq("prestation", prestation);

  const { data: allClients } = await query;

  const clients = q
    ? allClients?.filter((c) =>
        [c.company_name, c.contact_name, c.email, c.prestation ?? ""]
          .join(" ").toLowerCase().includes(q.toLowerCase())
      )
    : allClients;

  const expiringSoon = (allClients ?? []).filter((c) => {
    const d = daysUntil(c.presta_end_date);
    return d !== null && d >= 0 && d <= 30;
  });

  const uniquePrestations = [...new Set((allClients ?? []).map((c) => c.prestation).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Clients</h1>
          <p className="text-brand-500 text-sm">{clients?.length ?? 0} client(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/clients/import" className="btn-secondary flex items-center gap-2 text-sm">
            <FileUp size={15} /> Importer un contrat
          </Link>
          <a href="/admin/clients/export" className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15} /> Export CSV
          </a>
          <Link href="/admin/clients/kanban" className="btn-secondary flex items-center gap-2 text-sm">
            <LayoutGrid size={15} /> Kanban
          </Link>
          <Link href="/admin/clients/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nouveau client
          </Link>
        </div>
      </div>

      {/* Expiring alert */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                {expiringSoon.length} prestation{expiringSoon.length > 1 ? "s" : ""} expire{expiringSoon.length > 1 ? "nt" : ""} dans moins de 30 jours
              </p>
              <div className="mt-1 space-y-0.5">
                {expiringSoon.map((c) => {
                  const d = daysUntil(c.presta_end_date)!;
                  return (
                    <Link key={c.id} href={`/admin/clients/${c.id}`} className="block text-sm text-orange-700 hover:underline">
                      {c.company_name} — {c.prestation} · {d === 0 ? "aujourd'hui" : `${d}j`}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un client…"
            className="input pl-8 text-sm"
          />
        </div>
        <select name="status" defaultValue={status ?? ""} className="input text-sm w-auto">
          <option value="">Tous les statuts</option>
          <option value="prospect">Prospect</option>
          <option value="actif">Actif</option>
          <option value="pause">En pause</option>
          <option value="terminé">Terminé</option>
        </select>
        {uniquePrestations.length > 0 && (
          <select name="prestation" defaultValue={prestation ?? ""} className="input text-sm w-auto">
            <option value="">Toutes les prestations</option>
            {uniquePrestations.map((p) => (
              <option key={p} value={p!}>{p}</option>
            ))}
          </select>
        )}
        <button type="submit" className="btn-primary text-sm py-2 px-4">Filtrer</button>
        {(q || status || prestation) && (
          <Link href="/admin/clients" className="text-sm text-brand-400 hover:text-brand-700">Réinitialiser</Link>
        )}
      </form>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-50 text-xs text-brand-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Entreprise</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Statut</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Prestation</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Fin de presta</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {clients?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-400 text-sm">
                  {q || status || prestation ? "Aucun résultat pour ces filtres." : <>Aucun client — <Link href="/admin/clients/new" className="text-accent hover:underline">Ajouter le premier</Link></>}
                </td>
              </tr>
            )}
            {clients?.map((c) => {
              const endDays = daysUntil(c.presta_end_date);
              const endSoon = endDays !== null && endDays >= 0 && endDays <= 30;
              const ended = endDays !== null && endDays < 0;
              return (
                <tr key={c.id} className="hover:bg-brand-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {(c as any).logo_url ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-brand-100 flex-shrink-0">
                          <Image src={(c as any).logo_url} alt="" width={32} height={32} className="object-contain w-full h-full p-0.5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-brand-100"
                          style={{ backgroundColor: (c as any).card_color ?? "#f8fafc" }} />
                      )}
                      <div>
                        <Link href={`/admin/clients/${c.id}`} className="font-medium text-brand-900 hover:text-accent block">
                          {c.company_name}
                        </Link>
                        <p className="text-xs text-brand-400">{c.contact_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant={clientStatusVariant[c.client_status] ?? "default"}>
                      {clientStatusLabel[c.client_status] ?? c.client_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {(c.prestations?.length ? c.prestations : c.prestation ? [c.prestation] : []).length > 0
                      ? <div className="flex flex-wrap gap-1">
                          {(c.prestations?.length ? c.prestations : [c.prestation]).map((p: string) => (
                            <span key={p} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{p}</span>
                          ))}
                        </div>
                      : <span className="text-brand-300 text-sm">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${c.email}`} className="text-sm text-brand-600 hover:text-accent flex items-center gap-1">
                      <Mail size={13} /> {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.presta_end_date ? (
                      <span className={`text-sm font-medium ${ended ? "text-red-600" : endSoon ? "text-orange-600" : "text-brand-600"}`}>
                        {new Date(c.presta_end_date).toLocaleDateString("fr-FR")}
                        {endSoon && <span className="ml-1 text-xs">({endDays}j)</span>}
                        {ended && <span className="ml-1 text-xs">(expiré)</span>}
                      </span>
                    ) : (
                      <span className="text-brand-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/clients/${c.id}`} className="text-xs text-accent hover:underline">Voir →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
