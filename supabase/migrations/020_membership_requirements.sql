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
