-- ============================================================
-- ROTARACT PLATFORM — Migration 007
-- Fix: Event Types + Approval Flow (safe version)
-- Handles existing membership_applications table
-- ============================================================

-- ─── EVENT TYPES ───
CREATE TABLE IF NOT EXISTS "event_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "slug" VARCHAR(120) NOT NULL UNIQUE,
  "description" TEXT,
  "color_hex" VARCHAR(7) DEFAULT '#17458f',
  "icon_key" VARCHAR(50),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

-- ─── LINK EVENTS TO EVENT TYPES ───
ALTER TABLE events ADD COLUMN IF NOT EXISTS "event_type_id" UUID REFERENCES event_types(id);

-- ─── FIX membership_applications: Add user_id if missing ───
DO $$
BEGIN
  -- If table doesn't exist, create it fresh
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'membership_applications' AND table_schema = 'public') THEN
    CREATE TABLE "membership_applications" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
      "first_name" VARCHAR(100) NOT NULL,
      "last_name" VARCHAR(100) NOT NULL,
      "email" VARCHAR(255) NOT NULL,
      "phone" VARCHAR(20),
      "occupation" VARCHAR(200),
      "why_join" TEXT,
      "status" application_status NOT NULL DEFAULT 'submitted',
      "reviewed_by" UUID REFERENCES profiles(id),
      "reviewed_at" TIMESTAMPTZ,
      "review_notes" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  ELSE
    -- Table exists: add user_id column if it's missing
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'membership_applications'
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
      ALTER TABLE membership_applications
        ADD COLUMN "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END;
$$;

-- ─── FUNCTION: Assign applicant role on signup ───
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, 'applicant', true)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_role'
  ) THEN
    CREATE TRIGGER on_auth_user_created_role
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user_role();
  END IF;
END;
$$;

-- ─── RLS for event_types ───
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_types' AND policyname = 'public_read_event_types') THEN
    CREATE POLICY "public_read_event_types" ON event_types
      FOR SELECT USING (is_active = true AND deleted_at IS NULL);
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_types' AND policyname = 'admin_manage_event_types') THEN
    CREATE POLICY "admin_manage_event_types" ON event_types
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND ur.role IN ('super_admin', 'admin', 'president', 'secretary', 'event_manager')
        )
      );
  END IF;
END; $$;

-- ─── RLS for membership_applications ───
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'applicant_view_own_application') THEN
    CREATE POLICY "applicant_view_own_application" ON membership_applications
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'applicant_insert_application') THEN
    CREATE POLICY "applicant_insert_application" ON membership_applications
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'admin_manage_applications') THEN
    CREATE POLICY "admin_manage_applications" ON membership_applications
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND ur.role IN ('super_admin', 'admin', 'president', 'membership_director')
        )
      );
  END IF;
END; $$;

-- ─── INDEXES (safe) ───
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status
  ON membership_applications(status)
  WHERE user_id IS NOT NULL;

-- ─── SEED DEFAULT EVENT TYPES (idempotent) ───
INSERT INTO event_types (name, slug, description, color_hex, sort_order) VALUES
  ('Community Service',       'community-service',       'Service projects benefiting the local community',          '#17458f', 1),
  ('Fellowship',              'fellowship',              'Social gatherings and recreational activities',             '#f7a81b', 2),
  ('Professional Development','professional-development','Workshops, seminars, and skill-building events',           '#00a3ad', 3),
  ('Fundraiser',              'fundraiser',              'Fundraising events for projects and causes',               '#e5004d', 4),
  ('Training',                'training',                'Training sessions and orientations',                       '#6b7280', 5),
  ('Club Meeting',            'club-meeting',            'Regular club meetings and assemblies',                     '#17458f', 6),
  ('District Event',          'district-event',          'District-level Rotaract events and conferences',           '#7c3aed', 7),
  ('International',           'international',           'International partnerships and exchanges',                 '#059669', 8)
ON CONFLICT (slug) DO NOTHING;
