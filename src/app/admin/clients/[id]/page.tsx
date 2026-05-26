import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Phone, Mail, Pencil, Briefcase, CalendarRange, EuroIcon, BarChart2, Plug } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";
import DeleteClientButton from "./DeleteClientButton";
import ActivityLog from "./ActivityLog";
import InitProjectsButton from "./InitProjectsButton";
import InvitationCard from "./InvitationCard";
import { PRESTATION_TEMPLATES, getPaymentOffsets } from "@/lib/prestation-templates";
import { Wand2 } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "default" | "danger"> = {
  active: "success", paused: "warning", completed: "default", cancelled: "danger", lead: "default",
};
const statusLabel: Record<string, string> = {
  active: "En cours", paused: "Pause", completed: "Terminé", cancelled: "Annulé", lead: "Lead",
};

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

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: projects }, { data: tasks }, { data: activities }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("client_id", id).neq("status", "done").order("due_date"),
    supabase.from("client_activities").select("*").eq("client_id", id).order("activity_date", { ascending: false }),
  ]);

  if (!client) notFound();

  const { data: clientProfile } = client.user_id
    ? await supabase.from("profiles").select("last_seen_at").eq("id", client.user_id).maybeSingle()
    : { data: null };

  const clientPrestations = client.prestations?.length
    ? client.prestations
    : client.prestation ? [client.prestation] : [];

  const hasTemplates = clientPrestations.some((p: string) => PRESTATION_TEMPLATES[p]);
  const hasNoProjects = !projects || projects.length === 0;
  const showInitBanner = hasTemplates && hasNoProjects;

  const endDays = daysUntil(client.presta_end_date);
  const endSoon = endDays !== null && endDays <= 30 && endDays >= 0;
  const ended = endDays !== null && endDays < 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/clients" className="text-brand-400 hover:text-brand-700"><ArrowLeft size={20} /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-900">{client.company_name}</h1>
              <Badge variant={clientStatusVariant[client.client_status] ?? "default"}>
                {clientStatusLabel[client.client_status] ?? client.client_status}
              </Badge>
            </div>
            <p className="text-brand-500 text-sm">{client.contact_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DeleteClientButton id={id} companyName={client.company_name} />
          <InitProjectsButton
            clientId={id}
            prestations={client.prestations?.length ? client.prestations : client.prestation ? [client.prestation] : []}
            hasExistingProjects={!hasNoProjects}
          />
          <Link href={`/admin/clients/${id}/connexions`} className="btn-secondary flex items-center gap-2">
            <Plug size={14} /> Connexions
          </Link>
          <Link href={`/admin/clients/${id}/stats`} className="btn-secondary flex items-center gap-2">
            <BarChart2 size={14} /> Stats
          </Link>
          <Link href={`/admin/clients/${id}/edit`} className="btn-primary flex items-center gap-2">
            <Pencil size={14} /> Modifier
          </Link>
        </div>
      </div>

      {/* Init projects banner */}
      {showInitBanner && (
        <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Wand2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-900 text-sm">Aucun projet créé pour ce client</p>
              <p className="text-xs text-brand-500 mt-0.5">
                Des templates sont disponibles pour {clientPrestations.filter((p: string) => PRESTATION_TEMPLATES[p]).join(", ")}.
                Initialisez les projets et tâches en un clic.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <InitProjectsButton clientId={id} prestations={clientPrestations} />
          </div>
        </div>
      )}

      {/* Prestation banner */}
      {(client.prestations?.length || client.prestation) && (
        <div className={`rounded-xl border p-4 flex flex-wrap items-center gap-4 ${ended ? "bg-red-50 border-red-200" : endSoon ? "bg-orange-50 border-orange-200" : "bg-brand-50 border-brand-200"}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
            <Briefcase size={16} className={`flex-shrink-0 ${ended ? "text-red-500" : endSoon ? "text-orange-500" : "text-accent"}`} />
            {(client.prestations?.length ? client.prestations : client.prestation ? [client.prestation] : []).map((p: string) => (
              <span key={p} className="font-semibold text-brand-900 text-sm bg-white/70 px-2 py-0.5 rounded-lg">{p}</span>
            ))}
          </div>
          {client.presta_start_date && (
            <div className="flex items-center gap-1.5 text-sm text-brand-600">
              <CalendarRange size={14} />
              <span>Début : {formatDate(client.presta_start_date)}</span>
            </div>
          )}
          {client.presta_end_date && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${ended ? "text-red-600" : endSoon ? "text-orange-600" : "text-brand-600"}`}>
              <CalendarRange size={14} />
              <span>Fin : {formatDate(client.presta_end_date)}</span>
              {endSoon && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{endDays}j restants</span>}
              {ended && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Expiré</span>}
            </div>
          )}
          {client.budget && (
            <div className="flex items-center gap-1.5 text-sm text-brand-600">
              <EuroIcon size={14} />
              <span>{client.budget.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
          )}
        </div>
      )}

      {/* Payment schedule */}
      {client.budget && client.presta_start_date && (
        (() => {
          const payCount = (client as any).payment_count ?? 1;
          const offsets = getPaymentOffsets(payCount);
          const perPayment = Math.round((client.budget / payCount) * 100) / 100;
          const startDate = new Date(client.presta_start_date);
          const today = new Date();

          return (
            <div className="card p-5">
              <h2 className="font-semibold text-brand-900 mb-3 flex items-center gap-2">
                <EuroIcon size={16} className="text-accent" />
                Planning paiements — {payCount} versement{payCount > 1 ? "s" : ""} de {perPayment.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </h2>
              <div className="flex flex-wrap gap-3">
                {offsets.map((offset, i) => {
                  const d = new Date(startDate);
                  d.setDate(d.getDate() + offset);
                  const isPast = d < today;
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <div key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                        isToday ? "border-accent bg-accent/5 text-accent font-semibold" :
                        isPast  ? "border-green-200 bg-green-50 text-green-700" :
                                  "border-brand-200 bg-brand-50 text-brand-600"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPast ? "bg-green-400" : "bg-brand-300"}`} />
                      <span className="font-semibold">#{i + 1}</span>
                      <span>{d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="font-medium">{perPayment.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {/* Contact cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href={`mailto:${client.email}`} className="card p-4 flex items-center gap-3 hover:bg-brand-50">
          <Mail size={18} className="text-brand-400" />
          <div><p className="text-xs text-brand-400">Email</p><p className="text-sm font-medium">{client.email}</p></div>
        </a>
        {client.phone && (
          <a href={`tel:${client.phone}`} className="card p-4 flex items-center gap-3 hover:bg-brand-50">
            <Phone size={18} className="text-brand-400" />
            <div><p className="text-xs text-brand-400">Téléphone</p><p className="text-sm font-medium">{client.phone}</p></div>
          </a>
        )}
        {client.website && (
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="card p-4 flex items-center gap-3 hover:bg-brand-50">
            <Globe size={18} className="text-brand-400" />
            <div><p className="text-xs text-brand-400">Site</p><p className="text-sm font-medium">{client.website.replace(/^https?:\/\//, "")}</p></div>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Projets ({projects?.length ?? 0})</h2>
            <Link href={`/admin/projects/new?client=${id}`} className="text-xs text-accent hover:underline">+ Nouveau</Link>
          </div>
          <div className="space-y-3">
            {projects?.length === 0 && <p className="text-sm text-brand-400 text-center py-4">Aucun projet</p>}
            {projects?.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-brand-50">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/admin/projects/${p.id}`} className="text-sm font-medium hover:text-accent">{p.name}</Link>
                  <Badge variant={statusVariant[p.status] ?? "default"}>{statusLabel[p.status] ?? p.status}</Badge>
                </div>
                <ProgressBar value={p.progress} showLabel />
                {p.end_date && <p className="text-xs text-brand-400 mt-1">Fin : {formatDate(p.end_date)}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-900">Tâches ouvertes ({tasks?.length ?? 0})</h2>
            <Link href={`/admin/tasks/new?client=${id}`} className="text-xs text-accent hover:underline">+ Nouvelle</Link>
          </div>
          <div className="space-y-2">
            {tasks?.length === 0 && <p className="text-sm text-brand-400 text-center py-4">Aucune tâche</p>}
            {tasks?.map((t) => (
              <div key={t.id} className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-brand-50">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${t.priority === "urgent" ? "bg-red-500" : t.priority === "high" ? "bg-orange-400" : "bg-brand-300"}`} />
                <div>
                  <p className="text-sm font-medium text-brand-900">{t.title}</p>
                  {t.due_date && <p className="text-xs text-brand-400">{formatDate(t.due_date)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvitationCard
          clientId={id}
          email={client.email}
          userId={client.user_id ?? null}
          invitedAt={client.invitation_sent_at ?? null}
          acceptedAt={client.invitation_accepted_at ?? null}
          lastSeen={clientProfile?.last_seen_at ?? null}
        />

        {client.notes && (
          <div className="card p-5">
            <h2 className="font-semibold text-brand-900 mb-2">Notes internes</h2>
            <p className="text-sm text-brand-600 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>

      <ActivityLog clientId={id} activities={activities ?? []} />
    </div>
  );
}
