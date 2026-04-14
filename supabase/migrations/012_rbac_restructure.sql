-- ============================================================
-- ROTARACT PLATFORM — Migration 012
-- RBAC Restructure: Simplified System + Org Roles
-- Requires: Migration 011 (enum values 'normal', 'prospective_member') already committed.
-- Adds: year_of_service to profiles, wallet_address to committees
-- Migrates: applicant → prospective_member
-- Updates: new user trigger, role-based RLS policies
-- ============================================================

-- ─── PROFILE ADDITIONS ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "year_of_service" VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "profile_complete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS "short_bio" TEXT;

-- ─── COMMITTEE WALLET LINK ───
ALTER TABLE committees ADD COLUMN IF NOT EXISTS "wallet_address" TEXT;
ALTER TABLE committees ADD COLUMN IF NOT EXISTS "chair_wallet_address" TEXT;

-- ─── MEMBERS: year_of_service fallback ───
-- (Already has classification; adding service_year for display)
ALTER TABLE members ADD COLUMN IF NOT EXISTS "service_year" VARCHAR(20);

-- ─── MIGRATE applicant → prospective_member ───
UPDATE user_roles
SET role = 'prospective_member'
WHERE role = 'applicant';

-- ─── UPDATE TRIGGER: new users get prospective_member ───
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, 'prospective_member', true)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── UPDATE current_user_highest_role() for new hierarchy ───
CREATE OR REPLACE FUNCTION current_user_highest_role()
RETURNS user_role_type AS $$
  SELECT role FROM user_roles
  WHERE user_id = auth.uid()
  AND is_active = true
  ORDER BY
    CASE role
      WHEN 'super_admin'        THEN 0
      WHEN 'admin'              THEN 1
      WHEN 'board_member'       THEN 2
      WHEN 'member'             THEN 3
      WHEN 'prospective_member' THEN 4
      WHEN 'normal'             THEN 5
      -- Legacy roles kept in DB but ranked lower priority
      WHEN 'president'              THEN 2
      WHEN 'secretary'              THEN 2
      WHEN 'public_image_director'  THEN 2
      WHEN 'membership_director'    THEN 2
      WHEN 'project_director'       THEN 2
      WHEN 'event_manager'          THEN 2
      WHEN 'applicant'              THEN 4
      ELSE 6
    END
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── RLS POLICY UPDATES ───
-- Update admin policies to use new role set

-- Avenues
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='avenues' AND policyname='admin_manage_avenues') THEN
    DROP POLICY "admin_manage_avenues" ON avenues;
  END IF;
END; $$;
CREATE POLICY "admin_manage_avenues" ON avenues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.role IN ('super_admin', 'admin', 'board_member', 'president', 'secretary')
  )
);

-- Committees: admins and board members can manage
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='committees' AND policyname='admin_manage_committees') THEN
    CREATE POLICY "admin_manage_committees" ON committees FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.is_active = true
          AND ur.role IN ('super_admin', 'admin', 'board_member', 'president', 'secretary')
      )
    );
  END IF;
END; $$;

-- Site settings: only super_admin and admin
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='admin_manage_settings') THEN
    DROP POLICY "admin_manage_settings" ON site_settings;
  END IF;
END; $$;
CREATE POLICY "admin_manage_settings" ON site_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.role IN ('super_admin', 'admin')
  )
);

-- Members RLS: approved members (member, board_member, admin, super_admin) can view directory
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='members_view_directory') THEN
    DROP POLICY "members_view_directory" ON members;
  END IF;
END; $$;
CREATE POLICY "members_view_directory" ON members FOR SELECT USING (
  show_in_directory = true AND status = 'active' AND deleted_at IS NULL
);

-- Allow admins to manage members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='admin_manage_members') THEN
    CREATE POLICY "admin_manage_members" ON members FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.is_active = true
          AND ur.role IN ('super_admin', 'admin')
      )
    );
  END IF;
END; $$;

-- Profiles: admins can manage all profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='admin_manage_profiles') THEN
    CREATE POLICY "admin_manage_profiles" ON profiles FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.is_active = true
          AND ur.role IN ('super_admin', 'admin')
      )
    );
  END IF;
END; $$;

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON profiles(profile_complete);
CREATE INDEX IF NOT EXISTS idx_user_roles_new_roles ON user_roles(user_id, role) WHERE role IN ('super_admin', 'admin', 'normal', 'board_member', 'member', 'prospective_member') AND is_active = true;

-- ─── SEED SOCIAL SETTINGS (idempotent) ───
INSERT INTO site_settings (key, value, value_type, group_key, label, description, is_public) VALUES
  ('footer_tagline',     'Serving Communities, Developing Leaders.',       'string', 'footer',  'Footer Tagline',       'Short tagline shown in the footer', true),
  ('footer_about',       'A Rotaract club committed to service above self.','string', 'footer',  'Footer About Text',    'Brief description in footer',       true),
  ('social_facebook',    '',                                                'string', 'social',  'Facebook URL',         'Full Facebook page URL',            true),
  ('social_instagram',   '',                                                'string', 'social',  'Instagram URL',        'Full Instagram profile URL',        true),
  ('social_twitter',     '',                                                'string', 'social',  'Twitter/X URL',        'Full Twitter/X profile URL',        true),
  ('social_linkedin',    '',                                                'string', 'social',  'LinkedIn URL',         'Full LinkedIn page URL',            true),
  ('social_youtube',     '',                                                'string', 'social',  'YouTube URL',          'Full YouTube channel URL',          true),
  ('social_whatsapp',    '',                                                'string', 'social',  'WhatsApp Group URL',   'WhatsApp community link',           true),
  ('contact_email',      '',                                                'string', 'contact', 'Contact Email',        'Primary contact email address',     true),
  ('contact_phone',      '',                                                'string', 'contact', 'Contact Phone',        'Primary contact phone number',      true),
  ('contact_address',    '',                                                'string', 'contact', 'Club Address',         'Physical address of the club',      true)
ON CONFLICT (key) DO NOTHING;
