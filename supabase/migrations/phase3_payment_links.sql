-- Phase 3: Manual Razorpay Payment Links (bridge until the full Razorpay
-- account/website is approved for live Checkout).
-- Safe to run multiple times (idempotent). Run in Supabase SQL Editor.

-- A payment_bookings row can now also be created directly from the admin
-- panel (via a Razorpay Payment Link) instead of only via the public
-- checkout flow. Those rows may not have a customer email on hand yet.
alter table payment_bookings alter column email drop not null;

-- Tracks which Razorpay Payment Link (plink_...) this booking is waiting on.
-- The existing razorpay_order_id/razorpay_payment_id columns still get
-- filled in once the payment_link.paid webhook fires, so refunds, revenue
-- stats, and the Payments admin table all work exactly the same either way.
alter table payment_bookings add column if not exists razorpay_payment_link_id text unique;

create index if not exists payment_bookings_payment_link_id_idx
  on payment_bookings (razorpay_payment_link_id);
