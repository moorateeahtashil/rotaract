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
