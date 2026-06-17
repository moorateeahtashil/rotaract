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
