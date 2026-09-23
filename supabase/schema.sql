-- SIT WITH ME — Supabase setup script
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query > Run).

-- ============================================================================
-- 1. TABLES
-- ============================================================================

create table if not exists admin_users (
  email text primary key
);

create table if not exists companions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  age int not null,
  languages text[] not null default '{}',
  intro text not null default '',
  favorites text not null default '',
  photo_url text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists pricing (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration text not null,
  price_inr int not null,
  description text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null,
  companion_id uuid references companions(id) on delete set null,
  companion_name_snapshot text,
  activity text not null,
  preferred_date date not null,
  preferred_time text not null,
  area text not null,
  notes text,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Paid', 'Completed', 'Cancelled', 'No-show')),
  internal_notes text,
  amount_paid numeric,
  would_rebook text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_whatsapp_idx on bookings (whatsapp);

-- ============================================================================
-- 2. is_admin() helper — SECURITY DEFINER so it can check admin_users
--    even though admin_users itself has no public-readable policies.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users au where au.email = auth.jwt() ->> 'email'
  );
$$;

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

alter table admin_users enable row level security;
alter table companions enable row level security;
alter table pricing enable row level security;
alter table bookings enable row level security;

-- admin_users: no direct public policies. Only readable via is_admin() (security definer)
-- and by an authorized admin checking their own row from the admin layout.
create policy "Admins can read admin_users" on admin_users
  for select using (email = auth.jwt() ->> 'email');

-- companions: public can read visible rows only; admins can do everything.
create policy "Public can view visible companions" on companions
  for select using (visible = true);

create policy "Admins can manage companions" on companions
  for all using (is_admin()) with check (is_admin());

-- pricing: public can read visible rows only; admins can do everything.
create policy "Public can view visible pricing" on pricing
  for select using (visible = true);

create policy "Admins can manage pricing" on pricing
  for all using (is_admin()) with check (is_admin());

-- bookings: public can INSERT ONLY. Admins can read/update/delete.
create policy "Public can create bookings" on bookings
  for insert with check (true);

create policy "Admins can read bookings" on bookings
  for select using (is_admin());

create policy "Admins can update bookings" on bookings
  for update using (is_admin()) with check (is_admin());

create policy "Admins can delete bookings" on bookings
  for delete using (is_admin());

-- ============================================================================
-- 4. STORAGE — public bucket for companion photos
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('companion-photos', 'companion-photos', true)
on conflict (id) do nothing;

create policy "Public can view companion photos" on storage.objects
  for select using (bucket_id = 'companion-photos');

create policy "Admins can upload companion photos" on storage.objects
  for insert with check (bucket_id = 'companion-photos' and is_admin());

create policy "Admins can update companion photos" on storage.objects
  for update using (bucket_id = 'companion-photos' and is_admin());

create policy "Admins can delete companion photos" on storage.objects
  for delete using (bucket_id = 'companion-photos' and is_admin());

-- ============================================================================
-- 5. SEED DATA
-- ============================================================================

-- Replace these with your real admin emails, then create matching users in
-- Authentication > Users in the Supabase dashboard (see README for steps).
insert into admin_users (email) values
  ('admin1@example.com'),
  ('admin2@example.com')
on conflict (email) do nothing;

insert into pricing (title, duration, price_inr, description, sort_order) values
  ('Café chat', '1 hour', 699, 'A relaxed one-on-one over coffee.', 1),
  ('Outing', '3 hours', 1799, 'A longer outing — walk, movie, or temple visit.', 2)
on conflict do nothing;

insert into companions (first_name, age, languages, intro, favorites, photo_url, sort_order) values
  ('Aisha', 24, array['English', 'Hindi'],
   'A calm listener who loves slow mornings and good conversation. Easy to talk to about anything.',
   'Café hopping, long walks, city temples', null, 1),
  ('Rohan', 27, array['English', 'Hindi', 'Kannada'],
   'Friendly and easygoing — happy to just sit and chat or explore a new part of the city with you.',
   'Movies, street food, parks', null, 2)
on conflict do nothing;
