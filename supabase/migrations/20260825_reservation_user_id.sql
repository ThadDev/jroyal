-- Add optional user_id to reservations table.
-- This allows us to send targeted push + realtime notifications to the
-- customer when admin confirms or cancels their reservation.
-- Nullable because reservations can be made by guests (no account).

ALTER TABLE public.reservations
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for fast lookups per user
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);

-- RLS: users can read their own reservations (if they have an account)
-- (Admins already have full access via service role)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations"
    ON public.reservations FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin full access reservations" ON public.reservations;
CREATE POLICY "Admin full access reservations"
    ON public.reservations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow public insert (guest reservations — no auth required)
DROP POLICY IF EXISTS "Anyone can insert reservation" ON public.reservations;
CREATE POLICY "Anyone can insert reservation"
    ON public.reservations FOR INSERT
    WITH CHECK (true);
