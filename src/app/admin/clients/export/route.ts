import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: clients } = await supabase
    .from("clients")
    .select("company_name,contact_name,email,phone,website,client_status,prestation,presta_start_date,presta_end_date,budget,notes,created_at")
    .order("company_name");

  const headers = [
    "Entreprise", "Contact", "Email", "Téléphone", "Site web",
    "Statut", "Prestation", "Début prestation", "Fin prestation", "Budget (€)", "Notes", "Créé le",
  ];

  const escape = (v: string | null | undefined) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };

  const rows = (clients ?? []).map((c) => [
    escape(c.company_name),
    escape(c.contact_name),
    escape(c.email),
    escape(c.phone),
    escape(c.website),
    escape(c.client_status),
    escape(c.prestation),
    escape(c.presta_start_date),
    escape(c.presta_end_date),
    escape(c.budget != null ? String(c.budget) : null),
    escape(c.notes),
    escape(c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : null),
  ].join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const bom = "﻿"; // UTF-8 BOM so Excel opens accents correctly

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
