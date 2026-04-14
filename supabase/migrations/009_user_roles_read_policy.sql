-- ============================================================
-- ROTARACT PLATFORM — Migration 009
-- Fix: Add missing SELECT policy on user_roles so users can
-- read their own roles. Without this, getHighestRole() always
-- returns "public" and everyone gets redirected to /pending.
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_roles' AND policyname = 'users_read_own_roles'
  ) THEN
    CREATE POLICY "users_read_own_roles" ON user_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_roles' AND policyname = 'admin_manage_user_roles'
  ) THEN
    CREATE POLICY "admin_manage_user_roles" ON user_roles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.is_active = true
            AND ur.role IN ('super_admin', 'admin')
        )
      );
  END IF;
END; $$;
