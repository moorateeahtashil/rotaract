-- ============================================================
-- 018 — FAQs: ensure the columns the app uses exist + correct RLS.
--
-- The live faqs table uses (category text, is_visible bool, sort_order int).
-- Migration 005 assumed a different shape (category_id, is_published) via
-- CREATE TABLE IF NOT EXISTS, which was a no-op against the existing table.
-- This migration makes the schema match the app defensively and fixes the
-- public-read policy to key off is_visible.
-- ============================================================

alter table faqs add column if not exists category text;
alter table faqs add column if not exists is_visible boolean not null default true;
alter table faqs add column if not exists sort_order int not null default 0;

alter table faqs enable row level security;

-- Public can read visible, non-deleted FAQs.
drop policy if exists "public_read_faqs" on faqs;
create policy "public_read_faqs" on faqs for select
  using (is_visible = true and deleted_at is null);

-- Admins (and secretary) manage FAQs.
drop policy if exists "admin_manage_faqs" on faqs;
create policy "admin_manage_faqs" on faqs for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','secretary'))
);
