-- ============================================================
-- QR ATTENDANCE SYSTEM — Migration
-- Adds QR code support for event attendance tracking
-- ============================================================

-- ─── EVENT QR CODES TABLE ───
CREATE TABLE IF NOT EXISTS "event_qr_codes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "token" VARCHAR(100) NOT NULL UNIQUE,
  "qr_data" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" UUID REFERENCES profiles(id)
);

-- ─── ATTENDANCE SCAN LOGS ───
CREATE TABLE IF NOT EXISTS "attendance_scan_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "qr_code_id" UUID REFERENCES event_qr_codes(id),
  "scanned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "status" VARCHAR(50) NOT NULL DEFAULT 'success',
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "error_message" TEXT,
  UNIQUE(event_id, member_id)
);

-- ─── INDEXES ───
CREATE INDEX idx_event_qr_codes_event ON event_qr_codes(event_id);
CREATE INDEX idx_event_qr_codes_token ON event_qr_codes(token);
CREATE INDEX idx_attendance_scan_event ON attendance_scan_logs(event_id);
CREATE INDEX idx_attendance_scan_member ON attendance_scan_logs(member_id);

-- ─── RLS ───
ALTER TABLE event_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_scan_logs ENABLE ROW LEVEL SECURITY;

-- Members can view active QR codes for public events
CREATE POLICY "members_view_active_qr" ON event_qr_codes FOR SELECT USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- Members can create attendance scan logs for themselves
CREATE POLICY "members_create_scan_log" ON attendance_scan_logs FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM members WHERE id = member_id)
);

-- Members can view their own scan logs
CREATE POLICY "members_view_own_scans" ON attendance_scan_logs FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM members WHERE id = member_id)
);

-- Admin can manage QR codes
CREATE POLICY "admin_manage_qr_codes" ON event_qr_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary', 'event_manager'))
);

-- Admin can view all scan logs
CREATE POLICY "admin_view_all_scans" ON attendance_scan_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary'))
);
