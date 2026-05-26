-- Migration 009 — Logo et couleur personnalisée par client

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS card_color text DEFAULT '#f8fafc';

-- Activer le stockage pour les logos (à configurer dans Supabase Storage)
-- Créer un bucket 'client-logos' avec accès public dans Supabase Storage
