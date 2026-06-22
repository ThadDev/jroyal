-- ============================================================
-- Mama Onyinye LandMark – Supabase Schema
-- Safe to re-run: drops existing policies before recreating
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- Profiles (extends auth.users)
-- -------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'customer'
    check (role in ('admin', 'staff', 'customer')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------
-- Reservations
-- -------------------------------------------------------
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  date date not null,
  time text not null,
  guests int not null check (guests >= 1 and guests <= 500),
  service text not null
    check (service in ('restaurant', 'events', 'catering', 'private_dining', 'outdoor_catering')),
  special_requests text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  confirmation_sent boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_date_idx on reservations(date);
create index if not exists reservations_status_idx on reservations(status);
create index if not exists reservations_email_idx on reservations(email);

-- -------------------------------------------------------
-- Blog Posts
-- -------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  published boolean not null default false,
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_idx on blog_posts(published);

-- -------------------------------------------------------
-- Gallery
-- -------------------------------------------------------
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  category text default 'general'
    check (category in ('general', 'food', 'events', 'ambiance', 'team')),
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------

-- === Profiles ===
alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- === Reservations ===
alter table reservations enable row level security;

drop policy if exists "Anyone can create a reservation" on reservations;
drop policy if exists "Admins can view all reservations" on reservations;
drop policy if exists "Admins can update reservations" on reservations;

create policy "Anyone can create a reservation"
  on reservations for insert with check (true);
create policy "Admins can view all reservations"
  on reservations for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );
create policy "Admins can update reservations"
  on reservations for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );

-- === Blog Posts ===
alter table blog_posts enable row level security;

drop policy if exists "Published posts are public" on blog_posts;
drop policy if exists "Admins can manage blog posts" on blog_posts;

create policy "Published posts are public"
  on blog_posts for select using (published = true);
create policy "Admins can manage blog posts"
  on blog_posts for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- === Gallery ===
alter table gallery enable row level security;

drop policy if exists "Gallery is public" on gallery;
drop policy if exists "Admins can manage gallery" on gallery;

create policy "Gallery is public"
  on gallery for select using (true);
create policy "Admins can manage gallery"
  on gallery for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- -------------------------------------------------------
-- Storage Bucket for Gallery
-- -------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "Gallery images are public" on storage.objects;
drop policy if exists "Admins can upload gallery images" on storage.objects;
drop policy if exists "Admins can delete gallery images" on storage.objects;

create policy "Gallery images are public"
  on storage.objects for select
  using (bucket_id = 'gallery');
create policy "Admins can upload gallery images"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
create policy "Admins can delete gallery images"
  on storage.objects for delete
  using (
    bucket_id = 'gallery' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- -------------------------------------------------------
-- Storage Bucket for Meals
-- -------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;

drop policy if exists "Meal images are public" on storage.objects;
drop policy if exists "Admins can upload meal images" on storage.objects;
drop policy if exists "Admins can delete meal images" on storage.objects;
drop policy if exists "Admins can update meal images" on storage.objects;

create policy "Meal images are public"
  on storage.objects for select
  using (bucket_id = 'meal-images');
create policy "Admins can upload meal images"
  on storage.objects for insert
  with check (
    bucket_id = 'meal-images' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
create policy "Admins can update meal images"
  on storage.objects for update
  using (
    bucket_id = 'meal-images' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
create policy "Admins can delete meal images"
  on storage.objects for delete
  using (
    bucket_id = 'meal-images' and
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

