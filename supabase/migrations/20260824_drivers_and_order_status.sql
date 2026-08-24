-- ============================================================
-- Migration: Driver Management + Extended Order Status
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Extend the order status CHECK constraint to support new statuses
--    (If you used a CHECK constraint rather than an enum type)
--    If status is a varchar with a CHECK, we need to drop and recreate.
--    If status is a plain text/varchar without constraint, this step is skipped.
ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'processing', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'));

-- 2. Create the drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name         text NOT NULL,
    phone        text NOT NULL,
    avatar_url   text,
    vehicle_type text CHECK (vehicle_type IN ('motorcycle', 'car', 'bicycle', 'on_foot', 'van')),
    vehicle_plate text,
    status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes        text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. Add driver_id foreign key to orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL;

-- 4. Enable RLS on drivers table
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for drivers
-- Admin: full CRUD access
CREATE POLICY "Admins can manage drivers" ON drivers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Customers: can only read driver info for their own orders (via join, no direct access needed)
-- We'll expose driver info through the API, not direct table access by customers.

-- 6. Update function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
