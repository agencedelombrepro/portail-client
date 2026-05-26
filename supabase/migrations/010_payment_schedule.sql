-- Migration 010 — Gestion des paiements en plusieurs fois

-- Nombre de versements (1, 2, 3, 4 ou 6)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS payment_count integer DEFAULT 1
  CHECK (payment_count IN (1, 2, 3, 4, 6));

-- Table de suivi des paiements par client
CREATE TABLE IF NOT EXISTS public.payments (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  amount        numeric(10,2) NOT NULL,
  due_date      date NOT NULL,
  paid_at       timestamptz,
  payment_num   integer NOT NULL, -- numéro du versement (1, 2, 3...)
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'member')
    )
  );
