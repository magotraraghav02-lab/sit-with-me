-- Phase 1: companion profile fields
-- Safe to run multiple times (idempotent).

-- "Available today" indicator (was added directly in the Supabase dashboard
-- earlier; included here so schema.sql / this migration matches production).
alter table companions add column if not exists available_today boolean not null default false;

-- Free-text list of services a companion offers, shown on their profile card
-- and editable from /admin/companions.
alter table companions add column if not exists services_offered text;
