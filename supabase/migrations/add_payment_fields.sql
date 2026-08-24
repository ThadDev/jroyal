-- ============================================================
-- Migration: Add payment fields to orders table
-- Jroyal Grills – Paystack Integration
-- Run this in the Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status    TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paystack_txn_id   TEXT,
  ADD COLUMN IF NOT EXISTS payment_verified  BOOLEAN NOT NULL DEFAULT false;

-- Index for fast reference lookups (used on every webhook)
CREATE INDEX IF NOT EXISTS orders_payment_reference_idx ON public.orders(payment_reference);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx    ON public.orders(payment_status);

-- Allow service role to update orders (webhook handler uses createAdminClient)
-- The existing "Admins can update orders" policy covers admin role.
-- Webhook runs with service role key — bypasses RLS automatically.

-- Force schema cache refresh so PostgREST picks up new columns immediately
NOTIFY pgrst, 'reload schema';
