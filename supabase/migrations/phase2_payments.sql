-- Phase 2: Razorpay pay-first booking flow.
-- Safe to run multiple times (idempotent). Run in Supabase SQL Editor.

-- ============================================================================
-- 1. NEW COLUMNS ON EXISTING TABLES
-- ============================================================================

alter table pricing add column if not exists calendly_link text;

-- ============================================================================
-- 2. ZONES — admin-editable area list with travel fees
-- ============================================================================

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  area_name text not null unique,
  in_zone boolean not null default true,
  travel_fee_inr int not null default 0,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. COUPONS — admin-managed discount codes
-- ============================================================================

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_inr int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. PAYMENT BOOKINGS — one row per pay-first checkout attempt
-- ============================================================================

create table if not exists payment_bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null,
  email text not null,
  pricing_id uuid references pricing(id) on delete set null,
  pricing_title_snapshot text not null,
  base_amount_inr int not null,
  area text not null,
  travel_fee_inr int not null default 0,
  coupon_code text,
  coupon_discount_inr int not null default 0,
  total_amount_inr int not null,
  currency text not null default 'INR',
  notes text,
  is_adult boolean not null default false,
  agreed_policy boolean not null default false,
  status text not null default 'Pending'
    check (status in ('Pending', 'Paid', 'Failed', 'Refunded', 'Abandoned')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  razorpay_refund_id text,
  refund_amount_inr int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_bookings_created_at_idx on payment_bookings (created_at desc);
create index if not exists payment_bookings_status_idx on payment_bookings (status);
create index if not exists payment_bookings_order_id_idx on payment_bookings (razorpay_order_id);

-- ============================================================================
-- 5. WEBHOOK EVENT LOG — dedupes Razorpay webhook retries
-- ============================================================================

create table if not exists razorpay_webhook_events (
  id text primary key, -- sha256 of the raw request body
  event_type text,
  received_at timestamptz not null default now()
);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

alter table zones enable row level security;
alter table coupons enable row level security;
alter table payment_bookings enable row level security;
alter table razorpay_webhook_events enable row level security;

do $$ begin
  create policy "Public can view visible zones" on zones
    for select using (visible = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can manage zones" on zones
    for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can manage coupons" on coupons
    for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;
-- No public policy on coupons: codes are checked server-side with the
-- service-role key so they can't be enumerated by reading the table.

do $$ begin
  create policy "Admins can read payment_bookings" on payment_bookings
    for select using (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update payment_bookings" on payment_bookings
    for update using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;
-- No public insert/select policy: pending rows are created and updated only
-- by server code (order-creation action + webhook route) using the
-- service-role key, which bypasses RLS entirely. This keeps amounts and
-- payment identifiers server-controlled at every step.

-- razorpay_webhook_events: no policies at all — service-role only, by design.

-- ============================================================================
-- 7. SEED DATA — starter zones (edit freely from /admin/zones)
-- ============================================================================

insert into zones (area_name, in_zone, travel_fee_inr, sort_order) values
  ('Indiranagar', true, 0, 1),
  ('Koramangala', true, 0, 2),
  ('HSR Layout', true, 0, 3),
  ('Whitefield', false, 149, 4),
  ('Electronic City', false, 199, 5)
on conflict (area_name) do nothing;
