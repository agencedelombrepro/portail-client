-- Migration 008 — Rôle membre d'équipe + assignee sur les milestones

-- 1. Autoriser le rôle 'member' dans profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'client', 'member'));

-- 2. Ajouter specialty aux profiles (pour les membres d'équipe)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty text;

-- 3. Ajouter assignee_id aux milestones pour affectation individuelle
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Hériter l'assignee du projet sur les milestones existants (nécessite migration 007)
UPDATE public.milestones m
SET assignee_id = p.assignee_id
FROM public.projects p
WHERE m.project_id = p.id
  AND p.assignee_id IS NOT NULL
  AND m.assignee_id IS NULL;
