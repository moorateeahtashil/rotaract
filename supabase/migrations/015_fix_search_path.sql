-- ============================================================
-- ROTARACT PLATFORM — Migration 015
-- Fix: Add SET search_path = public to all SECURITY DEFINER
-- functions to prevent "relation does not exist" errors when
-- search_path is empty during trigger execution.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (NEW.id, 'prospective_member', true)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION handle_privileged_role_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND NEW.role NOT IN ('applicant', 'public') THEN
    UPDATE public.user_roles
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND role = 'applicant'
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_user_highest_role()
RETURNS user_role_type AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  AND is_active = true
  ORDER BY
    CASE role
      WHEN 'super_admin'            THEN 0
      WHEN 'admin'                  THEN 1
      WHEN 'board_member'           THEN 2
      WHEN 'member'                 THEN 3
      WHEN 'prospective_member'     THEN 4
      WHEN 'normal'                 THEN 5
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
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
