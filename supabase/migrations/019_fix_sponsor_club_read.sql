-- ============================================================
-- 019 — Fix sponsor_club public read policy.
-- The live sponsor_club table has no deleted_at column, but the original
-- public_read policy filtered on deleted_at. Recreate it to key off is_active
-- only, so the public Sponsors page (and homepage) can read sponsor clubs.
-- ============================================================

drop policy if exists "public_read_sponsor_club" on sponsor_club;
create policy "public_read_sponsor_club" on sponsor_club for select
  using (is_active = true);
