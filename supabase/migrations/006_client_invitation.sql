-- Migration 006 — Système d'invitation client + suivi de connexion
-- À exécuter dans l'éditeur SQL Supabase

-- 1. Champs d'invitation sur les clients
alter table public.clients
  add column if not exists invitation_sent_at    timestamptz,
  add column if not exists invitation_accepted_at timestamptz;

-- 2. Dernier accès sur les profils
alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- 3. Fonction : quand un user s'inscrit via invitation, le lier au client correspondant
create or replace function public.handle_invited_user_client_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Lier le user au client dont l'email correspond
  update public.clients
  set
    user_id                 = new.id,
    invitation_accepted_at  = now()
  where email = new.email
    and user_id is null;

  -- S'assurer que le profil a le bon rôle client
  update public.profiles
  set role = 'client'
  where id = new.id
    and exists (
      select 1 from public.clients where user_id = new.id
    );

  return new;
end;
$$;

-- 4. Trigger sur auth.users (après insertion)
drop trigger if exists on_auth_user_client_link on auth.users;
create trigger on_auth_user_client_link
  after insert on auth.users
  for each row
  execute function public.handle_invited_user_client_link();
