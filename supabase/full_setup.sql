-- ============================================================
-- Jroyal Grills – FULL DATABASE SETUP
-- Run this in the Supabase SQL Editor on a fresh project.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- -------------------------------------------------------
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  role        text not null default 'customer'
                check (role in ('admin', 'staff', 'customer')),
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: Profiles
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update their own profile"       on public.profiles;
drop policy if exists "Users can insert their own profile"       on public.profiles;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- -------------------------------------------------------
-- 2. RESERVATIONS
-- -------------------------------------------------------
create table if not exists public.reservations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users on delete set null,
  name               text not null,
  email              text not null,
  phone              text not null,
  date               date not null,
  time               text not null,
  guests             int  not null check (guests >= 1 and guests <= 500),
  service            text not null
    check (service in ('restaurant','events','catering','private_dining','outdoor_catering')),
  special_requests   text,
  status             text not null default 'pending'
    check (status in ('pending','confirmed','cancelled')),
  confirmation_sent  boolean default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists reservations_date_idx    on public.reservations(date);
create index if not exists reservations_status_idx  on public.reservations(status);
create index if not exists reservations_email_idx   on public.reservations(email);
create index if not exists reservations_user_id_idx on public.reservations(user_id);

-- RLS: Reservations
alter table public.reservations enable row level security;

drop policy if exists "Anyone can create a reservation"        on public.reservations;
drop policy if exists "Admins can view all reservations"       on public.reservations;
drop policy if exists "Admins can update reservations"         on public.reservations;
drop policy if exists "Users can view their own reservations"  on public.reservations;

create policy "Anyone can create a reservation"
  on public.reservations for insert with check (true);
create policy "Users can view their own reservations"
  on public.reservations for select using (auth.uid() = user_id);
create policy "Admins can view all reservations"
  on public.reservations for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));
create policy "Admins can update reservations"
  on public.reservations for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));

-- -------------------------------------------------------
-- 3. BLOG POSTS
-- -------------------------------------------------------
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text,
  cover_image  text,
  published    boolean not null default false,
  author_id    uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx      on public.blog_posts(slug);
create index if not exists blog_posts_published_idx on public.blog_posts(published);

-- RLS: Blog Posts
alter table public.blog_posts enable row level security;

drop policy if exists "Published posts are public"    on public.blog_posts;
drop policy if exists "Admins can manage blog posts"  on public.blog_posts;

create policy "Published posts are public"
  on public.blog_posts for select using (published = true);
create policy "Admins can manage blog posts"
  on public.blog_posts for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- -------------------------------------------------------
-- 4. GALLERY
-- -------------------------------------------------------
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  caption     text,
  category    text default 'general'
    check (category in ('general','food','events','ambiance','team')),
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

-- RLS: Gallery
alter table public.gallery enable row level security;

drop policy if exists "Gallery is public"         on public.gallery;
drop policy if exists "Admins can manage gallery" on public.gallery;

create policy "Gallery is public"
  on public.gallery for select using (true);
create policy "Admins can manage gallery"
  on public.gallery for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- -------------------------------------------------------
-- 5. ORDERS
-- -------------------------------------------------------
drop table if exists public.orders cascade;

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users on delete set null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  delivery_address text not null,
  items            jsonb not null default '[]',
  total_amount     int  not null default 0,
  status           text not null default 'pending'
    check (status in ('pending','processing','completed','cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_id_idx    on public.orders(user_id);
create index if not exists orders_status_idx     on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- RLS: Orders
alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can create orders"         on public.orders;
drop policy if exists "Admins can view all orders"      on public.orders;
drop policy if exists "Admins can update orders"        on public.orders;

create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));
create policy "Admins can update orders"
  on public.orders for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));

-- -------------------------------------------------------
-- 6. NOTIFICATIONS
-- -------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  type       text not null,
  is_read    boolean default false,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_notifications_user_id    on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- RLS: Notifications
alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications"   on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id or user_id is null);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Allow service role to insert notifications (used by API routes)
create policy "Service role can insert notifications"
  on public.notifications for insert with check (true);

-- -------------------------------------------------------
-- 7. PUSH TOKENS
-- -------------------------------------------------------
create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null unique,
  device     text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_push_tokens_user_id on public.push_tokens(user_id);

-- RLS: Push Tokens
alter table public.push_tokens enable row level security;

drop policy if exists "Users can insert own push tokens" on public.push_tokens;
drop policy if exists "Users can view own push tokens"   on public.push_tokens;
drop policy if exists "Users can delete own push tokens" on public.push_tokens;

create policy "Users can insert own push tokens"
  on public.push_tokens for insert with check (auth.uid() = user_id);
create policy "Users can view own push tokens"
  on public.push_tokens for select using (auth.uid() = user_id);
create policy "Users can delete own push tokens"
  on public.push_tokens for delete using (auth.uid() = user_id);

-- -------------------------------------------------------
-- 8. SHARED TRIGGER: updated_at auto-update
-- -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at       on public.orders;
drop trigger if exists set_profiles_updated_at     on public.profiles;
drop trigger if exists set_reservations_updated_at on public.reservations;

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_reservations_updated_at
  before update on public.reservations
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------
-- 9. STORAGE BUCKETS
-- -------------------------------------------------------
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('meal-images', 'meal-images', true)
  on conflict (id) do nothing;

-- Storage policies: Gallery
drop policy if exists "Gallery images are public"        on storage.objects;
drop policy if exists "Admins can upload gallery images" on storage.objects;
drop policy if exists "Admins can delete gallery images" on storage.objects;

create policy "Gallery images are public"
  on storage.objects for select using (bucket_id = 'gallery');
create policy "Admins can upload gallery images"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Admins can delete gallery images"
  on storage.objects for delete
  using (bucket_id = 'gallery' and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Storage policies: Meals
drop policy if exists "Meal images are public"        on storage.objects;
drop policy if exists "Admins can upload meal images" on storage.objects;
drop policy if exists "Admins can update meal images" on storage.objects;
drop policy if exists "Admins can delete meal images" on storage.objects;

create policy "Meal images are public"
  on storage.objects for select using (bucket_id = 'meal-images');
create policy "Admins can upload meal images"
  on storage.objects for insert
  with check (bucket_id = 'meal-images' and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Admins can update meal images"
  on storage.objects for update
  using (bucket_id = 'meal-images' and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Admins can delete meal images"
  on storage.objects for delete
  using (bucket_id = 'meal-images' and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- -------------------------------------------------------
-- 10. FORCE SCHEMA CACHE REFRESH
-- -------------------------------------------------------
NOTIFY pgrst, 'reload schema';
