-- ============================================================
-- ROTARACT PLATFORM — Migration 008
-- When a privileged role is assigned to a user, automatically
-- deactivate their applicant role so they skip the approval queue.
-- ============================================================

-- ─── FUNCTION ───
CREATE OR REPLACE FUNCTION handle_privileged_role_assigned()
RETURNS TRIGGER AS $$
BEGIN
  -- If a non-applicant, non-public role is being set active, remove applicant role
  IF NEW.is_active = true AND NEW.role NOT IN ('applicant', 'public') THEN
    UPDATE user_roles
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND role = 'applicant'
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── TRIGGER ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_privileged_role_assigned'
  ) THEN
    CREATE TRIGGER on_privileged_role_assigned
      AFTER INSERT OR UPDATE ON user_roles
      FOR EACH ROW EXECUTE FUNCTION handle_privileged_role_assigned();
  END IF;
END;
$$;

-- ─── BACKFILL: fix any existing users who already have a privileged role + applicant ───
UPDATE user_roles
SET is_active = false
WHERE role = 'applicant'
  AND is_active = true
  AND user_id IN (
    SELECT DISTINCT user_id FROM user_roles
    WHERE role NOT IN ('applicant', 'public')
      AND is_active = true
  );
