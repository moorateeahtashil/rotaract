-- ============================================================
-- 025 — Seed standard Rotaract board positions.
-- board_positions was empty, so the "Add Board Member" position dropdown was
-- blank. Seed the common positions (admins can add/edit more in the DB).
-- ============================================================

insert into board_positions (position_key, title, sort_order, is_active) values
  ('president',              'President',                       1, true),
  ('vice-president',         'Vice President',                  2, true),
  ('secretary',             'Secretary',                       3, true),
  ('treasurer',             'Treasurer',                       4, true),
  ('sergeant-at-arms',      'Sergeant-at-Arms',                5, true),
  ('immediate-past-president','Immediate Past President',       6, true),
  ('club-service-director', 'Club Service Director',           7, true),
  ('community-service-director','Community Service Director',   8, true),
  ('international-service-director','International Service Director', 9, true),
  ('professional-dev-director','Professional Development Director', 10, true),
  ('public-image-director', 'Public Image Director',           11, true),
  ('membership-director',   'Membership Director',             12, true)
on conflict (position_key) do nothing;
