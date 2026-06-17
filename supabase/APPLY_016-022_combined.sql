-- Combined migrations 016–022 (idempotent). Applied to live DB via Management API on 2026-06-17.

-- ===== 016_storage_buckets.sql =====

-- ============================================================
-- 016 — Storage buckets: ensure all app buckets exist, are PUBLIC,
-- and have correct read/write policies.
--
-- WHY: All images are rendered via plain public URLs
--   (https://<project>.supabase.co/storage/v1/object/public/<bucket>/...).
-- If a bucket is missing or its `public` flag is false, every image in it
-- returns 400/403 and "doesn't load" on the live site. This migration makes
-- bucket configuration reproducible in code instead of relying on the
-- dashboard, so it can't silently regress again.
-- ============================================================

-- 1) Ensure every bucket the app uploads to exists and is public.
insert into storage.buckets (id, name, public)
values
  ('banners',   'banners',   true),
  ('events',    'events',    true),
  ('gallery',   'gallery',   true),
  ('logos',     'logos',     true),
  ('media',     'media',     true),
  ('posts',     'posts',     true),
  ('public',    'public',    true),
  ('resources', 'resources', true)
on conflict (id) do update set public = true;

-- 2) Public read for objects in these buckets (so <img src> works for anyone).
do $$
begin
  if exists (select 1 from pg_policies
             where schemaname = 'storage' and tablename = 'objects'
             and policyname = 'public_read_app_buckets') then
    drop policy "public_read_app_buckets" on storage.objects;
  end if;
end $$;

create policy "public_read_app_buckets"
  on storage.objects for select
  to public
  using (
    bucket_id in ('banners','events','gallery','logos','media','posts','public','resources')
  );

-- 3) Authenticated users may upload/update/delete in these buckets.
--    (Admin UIs run as the signed-in user; finer-grained gating is enforced
--     in the app + admin routes.)
do $$
begin
  if exists (select 1 from pg_policies
             where schemaname = 'storage' and tablename = 'objects'
             and policyname = 'authenticated_write_app_buckets') then
    drop policy "authenticated_write_app_buckets" on storage.objects;
  end if;
  if exists (select 1 from pg_policies
             where schemaname = 'storage' and tablename = 'objects'
             and policyname = 'authenticated_update_app_buckets') then
    drop policy "authenticated_update_app_buckets" on storage.objects;
  end if;
  if exists (select 1 from pg_policies
             where schemaname = 'storage' and tablename = 'objects'
             and policyname = 'authenticated_delete_app_buckets') then
    drop policy "authenticated_delete_app_buckets" on storage.objects;
  end if;
end $$;

create policy "authenticated_write_app_buckets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('banners','events','gallery','logos','media','posts','public','resources')
  );

create policy "authenticated_update_app_buckets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('banners','events','gallery','logos','media','posts','public','resources')
  );

create policy "authenticated_delete_app_buckets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('banners','events','gallery','logos','media','posts','public','resources')
  );

-- ===== 017_fix_admin_rls_policies.sql =====

-- ============================================================
-- 017 — Fix admin RLS write policies + add missing ones
--
-- BUG FIXED: the "admin_manage_*" policies in migration 002 used
--   EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ... WHERE ur.is_active
--           AND ur.role IN ('super_admin','admin',...))
-- but NEVER filtered ur.user_id = auth.uid(). That makes the EXISTS true for
-- EVERY authenticated user as long as *some* admin exists — i.e. any logged-in
-- member could insert/update/delete projects, events, posts, bookings,
-- announcements, documents, applications, etc. These are rewritten to correctly
-- scope to the CURRENT user.
--
-- Also adds the missing admin write policies for sponsor_club, booking_types
-- and booking_slots (previously had public read only, so the new admin UIs
-- would be blocked by RLS).
-- ============================================================

-- ── Helper note: pattern is EXISTS (... WHERE ur.user_id = auth.uid() ...) ──

-- 1) projects
drop policy if exists "admin_manage_projects" on projects;
create policy "admin_manage_projects" on projects for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary','project_director'))
);

-- 2) events
drop policy if exists "admin_manage_events" on events;
create policy "admin_manage_events" on events for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary','event_manager'))
);

-- 3) posts
drop policy if exists "admin_manage_posts" on posts;
create policy "admin_manage_posts" on posts for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','public_image_director'))
);

-- 4) bookings
drop policy if exists "admin_manage_bookings" on bookings;
create policy "admin_manage_bookings" on bookings for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);

-- 5) contact_inquiries
drop policy if exists "admin_manage_contact_inquiries" on contact_inquiries;
create policy "admin_manage_contact_inquiries" on contact_inquiries for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','secretary'))
);

-- 6) membership_applications
drop policy if exists "admin_manage_applications" on membership_applications;
create policy "admin_manage_applications" on membership_applications for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','membership_director'))
);

-- 7) email_templates
drop policy if exists "admin_manage_email_templates" on email_templates;
create policy "admin_manage_email_templates" on email_templates for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin'))
);

-- 8) announcements
drop policy if exists "admin_manage_announcements" on announcements;
create policy "admin_manage_announcements" on announcements for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);

-- 9) documents
drop policy if exists "admin_manage_documents" on documents;
create policy "admin_manage_documents" on documents for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin'))
);

-- ── Missing admin write policies (only had public read before) ──

-- sponsor_club
drop policy if exists "admin_manage_sponsor_club" on sponsor_club;
create policy "admin_manage_sponsor_club" on sponsor_club for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','public_image_director'))
);

-- booking_types
drop policy if exists "admin_manage_booking_types" on booking_types;
create policy "admin_manage_booking_types" on booking_types for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);

-- booking_slots
alter table booking_slots enable row level security;
drop policy if exists "public_read_booking_slots" on booking_slots;
create policy "public_read_booking_slots" on booking_slots for select using (true);
drop policy if exists "admin_manage_booking_slots" on booking_slots;
create policy "admin_manage_booking_slots" on booking_slots for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);

-- ===== 018_faqs_columns_and_rls.sql =====

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

-- ===== 019_fix_sponsor_club_read.sql =====

-- ============================================================
-- 019 — Fix sponsor_club public read policy.
-- The live sponsor_club table has no deleted_at column, but the original
-- public_read policy filtered on deleted_at. Recreate it to key off is_active
-- only, so the public Sponsors page (and homepage) can read sponsor clubs.
-- ============================================================

drop policy if exists "public_read_sponsor_club" on sponsor_club;
create policy "public_read_sponsor_club" on sponsor_club for select
  using (is_active = true);

-- ===== 020_membership_requirements.sql =====

-- ============================================================
-- 020 — Membership requirements + attendance admin policies
--
-- Adds a single-row, admin-editable config of how much a prospective member
-- must participate before they can be promoted to full member, and ensures
-- admins can write attendance_records / read the new config.
-- ============================================================

create table if not exists membership_requirements (
  id int primary key default 1,
  required_meetings int not null default 4,
  required_board_meetings int not null default 0,
  required_fellowships int not null default 2,
  required_projects int not null default 2,
  required_project_leads int not null default 0,
  notes text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the single config row.
insert into membership_requirements (id) values (1) on conflict (id) do nothing;

alter table membership_requirements enable row level security;

-- Everyone signed in can read the thresholds (prospective members see their goal).
drop policy if exists "read_membership_requirements" on membership_requirements;
create policy "read_membership_requirements" on membership_requirements for select
  using (auth.role() = 'authenticated');

-- Admins manage the thresholds.
drop policy if exists "admin_manage_membership_requirements" on membership_requirements;
create policy "admin_manage_membership_requirements" on membership_requirements for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','membership_director'))
);

-- attendance_records had RLS enabled but no policies. Add admin manage + own-read.
alter table attendance_records enable row level security;

drop policy if exists "admin_manage_attendance_records" on attendance_records;
create policy "admin_manage_attendance_records" on attendance_records for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary','event_manager'))
);

drop policy if exists "members_read_own_attendance" on attendance_records;
create policy "members_read_own_attendance" on attendance_records for select using (
  auth.uid() = (select user_id from members where id = member_id)
);

-- ===== 021_dynamic_type_requirements.sql =====

-- ============================================================
-- 021 — Make membership requirements dynamic per event type.
-- Instead of fixed meeting/board/fellowship/project columns, store a JSON map
-- of { "<event_type name>": required_count }. Works with ANY event types the
-- club defines in /admin/event-types. required_project_leads stays separate.
-- ============================================================

alter table membership_requirements
  add column if not exists type_requirements jsonb not null default '{}'::jsonb;

-- ===== 022_mandatory_event_types.sql =====

-- ============================================================
-- 022 — Mandatory, non-deletable event types.
-- Adds an is_system flag and guarantees the core event types exist. System
-- types cannot be soft-deleted or deactivated (enforced in the admin UI and
-- by a trigger as a safety net).
-- ============================================================

alter table event_types add column if not exists is_system boolean not null default false;

-- Upsert the mandatory types (by slug). Reactivate + un-delete if they exist.
insert into event_types (name, slug, is_active, is_system, sort_order)
values
  ('Project',                  'project',                  true, true, 1),
  ('Fellowship',               'fellowship',               true, true, 2),
  ('Professional Development', 'professional-development', true, true, 3),
  ('Club Meeting',             'club-meeting',             true, true, 4),
  ('Club Assembly',            'club-assembly',            true, true, 5),
  ('Board Meeting',            'board-meeting',            true, true, 6)
on conflict (slug) do update
  set is_system = true, is_active = true, deleted_at = null, name = excluded.name;

-- Safety net: block hard deletes and soft-delete/deactivation of system types.
create or replace function protect_system_event_types() returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    if old.is_system then raise exception 'System event types cannot be deleted'; end if;
    return old;
  end if;
  if (tg_op = 'UPDATE') then
    if old.is_system and (new.deleted_at is not null or new.is_active = false) then
      raise exception 'System event types cannot be deleted or deactivated';
    end if;
    return new;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_protect_system_event_types on event_types;
create trigger trg_protect_system_event_types
  before update or delete on event_types
  for each row execute function protect_system_event_types();
