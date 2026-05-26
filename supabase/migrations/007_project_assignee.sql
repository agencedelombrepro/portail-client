-- Migration 007 — Assignation des membres d'équipe sur les projets
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Ajout de la colonne assignee_id sur les projets
alter table public.projects
  add column if not exists assignee_id uuid references auth.users(id) on delete set null;

-- 2. Auto-assignation des projets de Sandrine Nosbée selon les spécialités
-- Johanna GONCALVES → Site web, Tech
update public.projects p
set assignee_id = (select id from auth.users where email = 'hello@agencedelombre.fr' limit 1)
where p.client_id in (select id from public.clients where contact_name ilike '%Nosbée%' or contact_name ilike '%Nosbee%' or company_name ilike '%Nosbée%' or company_name ilike '%Nosbee%')
  and (
    p.name ilike '%site%'
    or p.name ilike '%maquette%'
    or p.name ilike '%application%'
    or p.name ilike '%maintenance%'
    or p.name ilike '%développement%'
    or p.name ilike '%deploiement%'
  );

-- Marjorie CAPRON → Identité Visuelle, Communication
update public.projects p
set assignee_id = (select id from auth.users where email = 'marjorie@agencedelombre.fr' limit 1)
where p.client_id in (select id from public.clients where contact_name ilike '%Nosbée%' or contact_name ilike '%Nosbee%' or company_name ilike '%Nosbée%' or company_name ilike '%Nosbee%')
  and (
    p.name ilike '%identité%'
    or p.name ilike '%identite%'
    or p.name ilike '%branding%'
    or p.name ilike '%visuelle%'
    or p.name ilike '%email marketing%'
    or p.name ilike '%community%'
    or p.name ilike '%réseaux sociaux%'
    or p.name ilike '%gestion des réseaux%'
  );

-- Cindy GALLOT → SEO, Fiche Google
update public.projects p
set assignee_id = (select id from auth.users where email = 'cindy@agencedelombre.fr' limit 1)
where p.client_id in (select id from public.clients where contact_name ilike '%Nosbée%' or contact_name ilike '%Nosbee%' or company_name ilike '%Nosbée%' or company_name ilike '%Nosbee%')
  and (
    p.name ilike '%seo%'
    or p.name ilike '%référencement%'
    or p.name ilike '%referencement%'
    or p.name ilike '%google%'
    or p.name ilike '%fiche%'
    or p.name ilike '%audit%'
    or p.name ilike '%on-page%'
    or p.name ilike '%reporting%'
  );

-- Kathleen WEATHERLY → Media Buying (Ads)
update public.projects p
set assignee_id = (select id from auth.users where email = 'kathleen@agencedelombre.fr' limit 1)
where p.client_id in (select id from public.clients where contact_name ilike '%Nosbée%' or contact_name ilike '%Nosbee%' or company_name ilike '%Nosbée%' or company_name ilike '%Nosbee%')
  and (
    p.name ilike '%ads%'
    or p.name ilike '%campagne%'
    or p.name ilike '%media%'
    or p.name ilike '%buying%'
  );
