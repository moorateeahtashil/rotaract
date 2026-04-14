-- ============================================================
-- PROSPECTIVE MEMBER TYPE — Migration
-- Adds 'prospective' user type for membership applicants
-- ============================================================

-- Add 'prospective' to the member_status enum
ALTER TYPE "member_status" ADD VALUE IF NOT EXISTS 'prospective';

-- Add prospective_members table for tracking applicants before full membership
CREATE TABLE IF NOT EXISTS "prospective_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "occupation" VARCHAR(200),
  "company" VARCHAR(200),
  "why_interest" TEXT,
  "how_heard" VARCHAR(200),
  "referred_by" UUID REFERENCES members(id),
  "status" VARCHAR(50) NOT NULL DEFAULT 'inquiry',
  -- inquiry, applied, interviewed, approved, joined, declined
  "application_date" TIMESTAMPTZ,
  "interview_date" TIMESTAMPTZ,
  "interview_notes" TEXT,
  "approved_by" UUID REFERENCES profiles(id),
  "approved_at" TIMESTAMPTZ,
  "converted_to_member_id" UUID REFERENCES members(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

-- Add permissions for prospective members to access member portal
-- They get limited access: can view announcements, events, but not bookings/resources
GRANT SELECT ON events TO authenticated;
GRANT SELECT ON announcements TO authenticated;

-- ─── INDEXES ───
CREATE INDEX idx_prospective_members_status ON prospective_members(status);
CREATE INDEX idx_prospective_members_email ON prospective_members(email);

-- ─── RLS ───
ALTER TABLE prospective_members ENABLE ROW LEVEL SECURITY;

-- Prospective members can view their own record
CREATE POLICY "prospective_view_own" ON prospective_members FOR SELECT USING (
  auth.uid() = user_id
);

-- Prospective members can update their own record
CREATE POLICY "prospective_update_own" ON prospective_members FOR UPDATE USING (
  auth.uid() = user_id
);

-- Prospective members can create their own record
CREATE POLICY "prospective_insert_own" ON prospective_members FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Admin can manage all prospective members
CREATE POLICY "admin_manage_prospective" ON prospective_members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'membership_director'))
);
