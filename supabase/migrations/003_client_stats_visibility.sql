-- Migration 003 — visibilité des blocs stats par client
-- À exécuter dans l'éditeur SQL Supabase

alter table public.clients
  add column if not exists stats_show_ga4           boolean not null default true,
  add column if not exists stats_show_search_console boolean not null default true,
  add column if not exists stats_show_instagram      boolean not null default false,
  add column if not exists stats_show_facebook       boolean not null default false,
  add column if not exists stats_show_linkedin       boolean not null default false,
  add column if not exists instagram_account_id      text,
  add column if not exists facebook_page_id          text,
  add column if not exists linkedin_page_id          text;
