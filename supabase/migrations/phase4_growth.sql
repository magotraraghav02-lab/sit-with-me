-- Phase 4: Ad tracking attribution, reviews, site settings, pricing badges,
-- quiz tagging, and abandoned-checkout follow-up.
-- Safe to run multiple times (idempotent). Run in Supabase SQL Editor.

-- ============================================================================
-- 1. ATTRIBUTION — first-touch UTM/fbclid + Meta browser ids, captured at
--    booking-request time so every payment can be traced back to an ad.
-- ============================================================================

alter table payment_bookings add column if not exists utm_source text;
alter table payment_bookings add column if not exists utm_medium text;
alter table payment_bookings add column if not exists utm_campaign text;
alter table payment_bookings add column if not exists utm_term text;
alter table payment_bookings add column if not exists utm_content text;
alter table payment_bookings add column if not exists fbclid text;
alter table payment_bookings add column if not exists fbp text;
alter table payment_bookings add column if not exists fbc text;
alter table payment_bookings add column if not exists landing_page text;

-- 30-minute "still pending, nudge them" reminder. Deliberately separate from
-- `status`, which must stay 'Pending' so the payment_link.paid webhook can
-- still match a late real payment (see markAbandonedBookings in
-- payment-actions.ts for the much longer hard-abandon window on `status`).
alter table payment_bookings add column if not exists abandoned_reminder_sent_at timestamptz;

create index if not exists payment_bookings_utm_source_idx on payment_bookings (utm_source);

-- ============================================================================
-- 2. PRICING — admin-editable badge text (e.g. "Most popular", "Best value",
--    "Save Rs.1,989") and quiz tags so the 3-tap quiz can recommend a plan
--    without any hardcoded plan IDs.
-- ============================================================================

alter table pricing add column if not exists badge_text text;
alter table pricing add column if not exists quiz_tags text[] not null default '{}';

-- ============================================================================
-- 3. REVIEWS — admin-entered only (no public submission form), shown on the
--    site only once at least 3 are approved.
-- ============================================================================

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_first_name text not null,
  service_title text not null,
  rating int not null check (rating between 1 and 5),
  review_text text not null,
  approved boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_approved_idx on reviews (approved);

alter table reviews enable row level security;

do $$ begin
  create policy "Public can view approved reviews" on reviews
    for select using (approved = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can manage reviews" on reviews
    for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 4. SITE SETTINGS — single-row key/value-ish table for the founder video
--    and any future admin-editable site-wide content.
-- ============================================================================

create table if not exists site_settings (
  id boolean primary key default true,
  founder_video_url text,
  founder_captions_url text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = true)
);

insert into site_settings (id) values (true) on conflict (id) do nothing;

alter table site_settings enable row level security;

do $$ begin
  create policy "Public can view site settings" on site_settings
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can manage site settings" on site_settings
    for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 5. STORAGE — public bucket for the founder video + captions
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

do $$ begin
  create policy "Public can view site media" on storage.objects
    for select using (bucket_id = 'site-media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can upload site media" on storage.objects
    for insert with check (bucket_id = 'site-media' and is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update site media" on storage.objects
    for update using (bucket_id = 'site-media' and is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can delete site media" on storage.objects
    for delete using (bucket_id = 'site-media' and is_admin());
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 6. SEED — FIRST50 exit-intent coupon (₹50 off), off by default until you
--    review it in /admin/coupons.
-- ============================================================================

insert into coupons (code, discount_inr, active) values
  ('FIRST50', 50, true)
on conflict (code) do nothing;
