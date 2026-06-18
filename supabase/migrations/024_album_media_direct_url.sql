-- ============================================================
-- 024 — Align album_media with how the admin gallery actually works.
-- The admin uploads store the public image URL directly on album_media
-- (media_url), but the table only had (album_id, media_id) composite PK and
-- a NOT NULL media_id FK → uploads failed. The table is empty, so reshape it
-- to a direct-URL model: a real id PK, a media_url column, nullable media_id.
-- ============================================================

alter table album_media drop constraint if exists album_media_pkey;
alter table album_media add column if not exists id uuid default gen_random_uuid();
alter table album_media add column if not exists media_url text;
alter table album_media alter column media_id drop not null;

-- Make id the primary key (table is empty, safe).
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'album_media' and constraint_type = 'PRIMARY KEY'
  ) then
    alter table album_media add primary key (id);
  end if;
end $$;
