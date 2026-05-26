-- Migration 004 — connexions OAuth réseaux sociaux
-- À exécuter dans l'éditeur SQL Supabase

-- Champ Google My Business sur les clients
alter table public.clients
  add column if not exists gmb_location_id text;

-- Table des tokens OAuth par client
create table public.oauth_connections (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  provider      text not null check (provider in ('meta', 'linkedin')),
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  scopes        text,
  account_name  text,  -- nom affiché du compte connecté
  account_id    text,  -- ID interne du provider
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (client_id, provider)
);

alter table public.oauth_connections enable row level security;

create policy "Admins manage oauth_connections"
  on public.oauth_connections for all using (is_admin());

create policy "Client sees own oauth_connections"
  on public.oauth_connections for select
  using (client_id = my_client_id());
