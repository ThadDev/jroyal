-- ============================================================
-- Mama Onyinye LandMark – Migration: New Feature Support
-- Run this AFTER the base schema.sql
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / IF EXISTS
-- ============================================================

-- -------------------------------------------------------
-- 1. Profiles: ensure phone column exists
--    (useful for future profile update forms)
-- -------------------------------------------------------
alter table profiles
  add column if not exists phone text;

-- -------------------------------------------------------
-- 2. Profiles: update trigger to also persist role from
--    user_metadata (admin signups via API set this)
-- -------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        role      = excluded.role;
  return new;
end;
$$;

-- Recreate trigger to pick up new function body
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------
-- 3. Orders table (for future cart → checkout flow)
-- -------------------------------------------------------
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete set null,
  user_email   text not null,
  user_name    text not null,
  items        jsonb not null default '[]',   -- [{id, name, price, priceValue, quantity}]
  total_price  int  not null default 0,       -- in kobo (₦ × 100)
  status       text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_ref  text,                          -- Paystack reference
  payment_method text default 'paystack',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists orders_user_id_idx   on orders(user_id);
create index if not exists orders_status_idx    on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- -------------------------------------------------------
-- 4. Orders RLS
-- -------------------------------------------------------
alter table orders enable row level security;

drop policy if exists "Users can view their own orders"  on orders;
drop policy if exists "Users can create orders"          on orders;
drop policy if exists "Admins can view all orders"       on orders;
drop policy if exists "Admins can update orders"         on orders;

create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins can update orders"
  on orders for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );

-- -------------------------------------------------------
-- 5. Reservations: link to authenticated users (optional)
--    Add user_id FK so logged-in users can see their bookings
-- -------------------------------------------------------
alter table reservations
  add column if not exists user_id uuid references auth.users on delete set null;

create index if not exists reservations_user_id_idx on reservations(user_id);

-- Allow logged-in users to see their own reservations
drop policy if exists "Users can view their own reservations" on reservations;
create policy "Users can view their own reservations"
  on reservations for select
  using (auth.uid() = user_id);

-- -------------------------------------------------------
-- 6. Admin helper function: get role for a user
--    Used to avoid repeated subquery boilerplate
-- -------------------------------------------------------
create or replace function public.get_user_role(uid uuid)
returns text language sql stable security definer as $$
  select role from public.profiles where id = uid limit 1;
$$;

-- -------------------------------------------------------
-- 7. Profiles: additional RLS – users can insert their own
--    profile (needed for OAuth users on first login)
-- -------------------------------------------------------
drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- -------------------------------------------------------
-- 8. Updated_at auto-update trigger (shared)
-- -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on orders;
create trigger set_orders_updated_at
  before update on orders
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_reservations_updated_at on reservations;
create trigger set_reservations_updated_at
  before update on reservations
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------
-- 9. Supabase Auth: configure redirect URLs
--    (informational comment — must be done in dashboard)
-- -------------------------------------------------------
-- Required redirect URLs to add in:
--   Supabase Dashboard → Authentication → URL Configuration
--
--   Site URL:           https://mamaonyinye.com
--   Redirect URLs:      https://mamaonyinye.com/auth/callback
--                       http://localhost:3000/auth/callback
--
-- Google OAuth redirect:
--   Authorized redirect URI in Google Cloud Console:
--   https://[your-project-ref].supabase.co/auth/v1/callback
