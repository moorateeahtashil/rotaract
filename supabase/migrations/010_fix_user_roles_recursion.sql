-- ============================================================
-- Fix recursion in user_roles RLS policies
-- Problem: A policy on user_roles referenced user_roles in USING,
-- causing "infinite recursion detected" when selecting roles.
-- Solution: Drop the broad FOR ALL admin policy. Keep SELECT policy
-- for users to read their own roles. Admin writes now go through
-- server routes using the service role key.
-- ============================================================

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_roles' AND policyname = 'admin_manage_user_roles'
  ) THEN
    DROP POLICY "admin_manage_user_roles" ON user_roles;
  END IF;
END $$;

-- Note: The SELECT policy should already exist per migration 009:
--   CREATE POLICY "users_read_own_roles" ON user_roles
--     FOR SELECT USING (auth.uid() = user_id);
-- If not present in your instance, re-create it manually.

