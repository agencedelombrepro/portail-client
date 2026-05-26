"use server";

import { createClient } from "@/lib/supabase/server";
import { PRESTATION_TEMPLATES } from "@/lib/prestation-templates";

export interface ContractData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  prestations: string[];
  presta_start_date: string | null;
  presta_end_date: string | null;
  budget: number | null;
  payment_count: number;
  client_status: string;
  notes: string | null;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function createClientFromContractAction(
  data: ContractData
): Promise<{ clientId?: string; error?: string }> {
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      company_name:      data.company_name,
      contact_name:      data.contact_name,
      email:             data.email,
      phone:             data.phone,
      website:           data.website,
      notes:             data.notes,
      client_status:     data.client_status || "actif",
      prestations:       data.prestations,
      prestation:        data.prestations[0] ?? null,
      presta_start_date: data.presta_start_date,
      presta_end_date:   data.presta_end_date,
      budget:            data.budget,
      payment_count:     data.payment_count ?? 1,
    })
    .select("id")
    .single();

  if (error || !client) return { error: error?.message ?? "Erreur lors de la création du client." };

  const validPrestations = data.prestations.filter((p) => PRESTATION_TEMPLATES[p]?.length);
  if (validPrestations.length === 0) return { clientId: client.id };

  const startDate = data.presta_start_date ? new Date(data.presta_start_date) : new Date();

  for (const prestation of validPrestations) {
    const templates = PRESTATION_TEMPLATES[prestation];
    if (!templates?.length) continue;

    for (const tpl of templates) {
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          client_id:   client.id,
          name:        tpl.name,
          description: tpl.description,
          status:      "active",
          progress:    0,
          start_date:  addDays(startDate, tpl.start_offset_days),
          end_date:    addDays(startDate, tpl.end_offset_days),
        })
        .select("id")
        .single();

      if (pErr || !project) continue;

      await supabase.from("milestones").insert(
        tpl.milestones.map((m, i) => ({
          project_id: project.id,
          title:      m.title,
          status:     "pending",
          order:      i + 1,
          due_date:   addDays(startDate, m.due_offset_days),
        }))
      );
    }
  }

  return { clientId: client.id };
}
