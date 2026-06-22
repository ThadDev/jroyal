-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means broadcast/admin
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL, -- 'order', 'reservation', 'signup', 'payment', 'cancellation', 'system'
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own notifications or broadcast notifications (where user_id is null)
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all notifications (optional, if you use service role it bypasses RLS anyway)


-- ==========================================
-- PUSH TOKENS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast token lookups
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);

-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can insert their own tokens
CREATE POLICY "Users can insert own push tokens" 
ON public.push_tokens FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own tokens
CREATE POLICY "Users can view own push tokens" 
ON public.push_tokens FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update/delete their own tokens
CREATE POLICY "Users can delete own push tokens" 
ON public.push_tokens FOR DELETE 
USING (auth.uid() = user_id);
