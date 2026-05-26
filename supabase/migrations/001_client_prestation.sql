-- Migration 001 — champs prestation sur les clients
-- À exécuter dans l'éditeur SQL Supabase

alter table public.clients
  add column if not exists client_status text not null default 'actif'
    check (client_status in ('prospect', 'actif', 'pause', 'terminé')),
  add column if not exists prestation text
    check (prestation in (
      'Site web',
      'Refonte de site web',
      'SEO / Référencement',
      'Campagne Google Ads',
      'Campagne Meta Ads',
      'Identité visuelle / Branding',
      'Community Management',
      'Email marketing',
      'Application mobile',
      'Pack maintenance',
      'Audit & conseil'
    )),
  add column if not exists presta_start_date date,
  add column if not exists presta_end_date date,
  add column if not exists budget numeric(10,2);
