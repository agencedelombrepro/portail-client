-- Migration 005 — prestations multiples par client
-- À exécuter dans l'éditeur SQL Supabase

alter table public.clients
  add column if not exists prestations text[] default '{}';

-- Migrer les données existantes vers le nouveau champ
update public.clients
  set prestations = array[prestation]
  where prestation is not null and (prestations is null or prestations = '{}');
