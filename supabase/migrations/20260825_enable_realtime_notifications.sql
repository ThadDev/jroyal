-- ============================================================
-- ENABLE REALTIME ON NOTIFICATIONS TABLE & FIX REPLICA IDENTITY
-- ============================================================

-- 1. Ensure REPLICA IDENTITY is set to FULL for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 2. Add notifications table to Supabase Realtime Publication if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;

-- 3. Update RLS policy to ensure authenticated users and admin broadcast can SELECT
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (
    auth.uid() = user_id 
    OR user_id IS NULL
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
