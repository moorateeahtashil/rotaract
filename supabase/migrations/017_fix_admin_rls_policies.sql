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
