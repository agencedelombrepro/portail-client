-- Migration 002 — journal d'activité par client
-- À exécuter dans l'éditeur SQL Supabase

create table public.client_activities (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  user_id       uuid not null references auth.users(id),
  type          text not null check (type in ('note', 'appel', 'réunion', 'email', 'autre')),
  content       text not null,
  activity_date date not null default current_date,
  created_at    timestamptz not null default now()
);

alter table public.client_activities enable row level security;

create policy "Admins manage activities" on public.client_activities
  for all using (is_admin());
