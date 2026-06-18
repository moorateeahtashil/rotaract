-- ============================================================
-- 026 — Admin write policy for board_positions so the new in-app
-- "Manage Positions" UI can add/edit/deactivate positions.
-- ============================================================

drop policy if exists "admin_manage_board_positions" on board_positions;
create policy "admin_manage_board_positions" on board_positions for all using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.is_active = true
          and ur.role in ('super_admin','admin','president','secretary'))
);
