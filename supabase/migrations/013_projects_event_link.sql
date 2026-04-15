-- ============================================================
-- Migration 013: Add event_id to projects for relational link
-- ============================================================

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "event_id" UUID REFERENCES events(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_projects_event_id ON projects(event_id);
