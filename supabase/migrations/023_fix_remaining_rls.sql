-- ============================================================
-- 023 — Fix remaining RLS gaps
--   #4: rotary_highlights had FOR ALL TO authenticated USING(true) → ANY
--       logged-in user could edit homepage highlights. Role-gate it.
--   #5: board_members, albums, album_media had only public-read (or none) →
--       admin saves were silently denied. Add admin write policies.
-- ============================================================

-- ── rotary_highlights ──
drop policy if exists "Authenticated can manage highlights" on rotary_highlights;
drop policy if exists "admin_manage_rotary_highlights" on rotary_highlights;
create policy "admin_manage_rotary_highlights" on rotary_highlights for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','public_image_director'))
);

-- ── board_members ──
drop policy if exists "admin_manage_board_members" on board_members;
create policy "admin_manage_board_members" on board_members for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);

-- ── albums ──
drop policy if exists "admin_manage_albums" on albums;
create policy "admin_manage_albums" on albums for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','public_image_director'))
);

-- ── album_media (had no policies at all — add public read + admin manage) ──
alter table album_media enable row level security;
drop policy if exists "public_read_album_media" on album_media;
create policy "public_read_album_media" on album_media for select using (true);
drop policy if exists "admin_manage_album_media" on album_media;
create policy "admin_manage_album_media" on album_media for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','public_image_director'))
);
