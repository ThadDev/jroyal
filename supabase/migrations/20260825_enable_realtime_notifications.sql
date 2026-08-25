-- Enable Supabase Realtime for the notifications table.
-- Without this, postgres_changes subscriptions will never fire.
-- This adds the notifications table to the supabase_realtime publication.

-- Drop from publication first if it already exists (idempotent)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'notifications'
    ) THEN
        -- Already enabled, nothing to do
        RAISE NOTICE 'notifications table already in supabase_realtime publication';
    ELSE
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        RAISE NOTICE 'Added notifications table to supabase_realtime publication';
    END IF;
END;
$$;
