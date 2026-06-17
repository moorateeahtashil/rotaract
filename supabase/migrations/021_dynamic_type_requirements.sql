-- ============================================================
-- 021 — Make membership requirements dynamic per event type.
-- Instead of fixed meeting/board/fellowship/project columns, store a JSON map
-- of { "<event_type name>": required_count }. Works with ANY event types the
-- club defines in /admin/event-types. required_project_leads stays separate.
-- ============================================================

alter table membership_requirements
  add column if not exists type_requirements jsonb not null default '{}'::jsonb;
