-- ============================================================
-- ROTARACT PLATFORM — Migration Batch 2
-- Additional tables for projects, events, posts, media, email, etc.
-- ============================================================

-- ─── PROJECTS ───
CREATE TABLE IF NOT EXISTS "projects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "slug" VARCHAR(350) NOT NULL UNIQUE,
  "subtitle" VARCHAR(300),
  "description" TEXT NOT NULL,
  "long_description" TEXT,
  "avenue_id" UUID REFERENCES avenues(id),
  "committee_id" UUID REFERENCES committees(id),
  "status" project_status NOT NULL DEFAULT 'planned',
  "start_date" DATE,
  "end_date" DATE,
  "location" VARCHAR(300),
  "location_url" TEXT,
  "budget_amount" DECIMAL(12,2),
  "funds_raised" DECIMAL(12,2),
  "impact_metrics" JSONB DEFAULT '{}',
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMPTZ,
  "seo_title" VARCHAR(300),
  "seo_description" TEXT,
  "seo_keywords" TEXT,
  "og_image_url" TEXT,
  "created_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS "project_images" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "image_url" TEXT NOT NULL,
  "caption" VARCHAR(300),
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "project_team" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "role_in_project" VARCHAR(100) DEFAULT 'team_member',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, member_id)
);

-- ─── EVENTS ───
CREATE TABLE IF NOT EXISTS "events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "slug" VARCHAR(350) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "long_description" TEXT,
  "event_type" VARCHAR(50),
  "avenue_id" UUID REFERENCES avenues(id),
  "project_id" UUID REFERENCES projects(id),
  "date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ,
  "location" VARCHAR(300),
  "location_url" TEXT,
  "map_embed_url" TEXT,
  "capacity" INT,
  "registration_open" BOOLEAN NOT NULL DEFAULT false,
  "registration_opens_at" TIMESTAMPTZ,
  "registration_deadline" TIMESTAMPTZ,
  "registration_fee" DECIMAL(10,2),
  "image_url" TEXT,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "status" event_status NOT NULL DEFAULT 'draft',
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "seo_title" VARCHAR(300),
  "seo_description" TEXT,
  "og_image_url" TEXT,
  "created_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS "event_registrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "status" registration_status NOT NULL DEFAULT 'registered',
  "registered_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "payment_status" VARCHAR(50),
  "payment_amount" DECIMAL(10,2),
  "notes" TEXT,
  "cancelled_at" TIMESTAMPTZ,
  UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS "event_waitlist" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "position" INT NOT NULL,
  "added_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "notified_at" TIMESTAMPTZ,
  "status" VARCHAR(50) DEFAULT 'waiting',
  UNIQUE(event_id, member_id)
);

-- ─── BOOKINGS ───
CREATE TABLE IF NOT EXISTS "booking_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "capacity" INT,
  "duration_minutes" INT NOT NULL DEFAULT 30,
  "requires_approval" BOOLEAN NOT NULL DEFAULT false,
  "max_hours_per_month" INT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "booking_slots" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_type_id" UUID NOT NULL REFERENCES booking_types(id) ON DELETE CASCADE,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "max_bookings" INT,
  "current_bookings" INT DEFAULT 0,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_type_id" UUID NOT NULL REFERENCES booking_types(id) ON DELETE CASCADE,
  "slot_id" UUID REFERENCES booking_slots(id),
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "start_time" TIMESTAMPTZ NOT NULL,
  "end_time" TIMESTAMPTZ NOT NULL,
  "status" booking_status NOT NULL DEFAULT 'pending',
  "notes" TEXT,
  "admin_notes" TEXT,
  "approved_by" UUID REFERENCES profiles(id),
  "approved_at" TIMESTAMPTZ,
  "rejected_by" UUID REFERENCES profiles(id),
  "rejected_at" TIMESTAMPTZ,
  "rejection_reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

-- ─── CONTACT INQUIRIES ───
CREATE TABLE IF NOT EXISTS "contact_inquiries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "subject" VARCHAR(300) NOT NULL,
  "message" TEXT NOT NULL,
  "inquiry_type" VARCHAR(50) DEFAULT 'general',
  "status" VARCHAR(50) NOT NULL DEFAULT 'unread',
  "admin_notes" TEXT,
  "assigned_to" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── MEMBERSHIP APPLICATIONS ───
CREATE TABLE IF NOT EXISTS "membership_applications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "date_of_birth" DATE,
  "occupation" VARCHAR(200),
  "company" VARCHAR(200),
  "education" TEXT,
  "why_join" TEXT NOT NULL,
  "how_heard" VARCHAR(200),
  "social_links" JSONB DEFAULT '{}',
  "status" application_status NOT NULL DEFAULT 'submitted',
  "admin_notes" TEXT,
  "assigned_to" UUID REFERENCES profiles(id),
  "reviewed_by" UUID REFERENCES profiles(id),
  "reviewed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── POSTS / BLOG ───
CREATE TABLE IF NOT EXISTS "posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "slug" VARCHAR(350) NOT NULL UNIQUE,
  "content" TEXT NOT NULL,
  "excerpt" VARCHAR(500),
  "featured_image" TEXT,
  "category_id" UUID REFERENCES categories(id),
  "author_id" UUID REFERENCES profiles(id),
  "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMPTZ,
  "seo_title" VARCHAR(300),
  "seo_description" TEXT,
  "og_image_url" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS "post_tags" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "slug" VARCHAR(150) NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "post_tagged" (
  "post_id" UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  "tag_id" UUID NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ─── MEDIA ───
CREATE TABLE IF NOT EXISTS "media_files" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "file_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "file_type" VARCHAR(50),
  "file_size" BIGINT,
  "alt_text" VARCHAR(300),
  "caption" TEXT,
  "media_type" media_type NOT NULL DEFAULT 'image',
  "uploaded_by" UUID REFERENCES profiles(id),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "albums" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "slug" VARCHAR(350) NOT NULL UNIQUE,
  "description" TEXT,
  "cover_image_url" TEXT,
  "media_count" INT DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "album_media" (
  "album_id" UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  "media_id" UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  "sort_order" INT NOT NULL DEFAULT 0,
  "added_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, media_id)
);

-- ─── SPONSOR CLUB ───
CREATE TABLE IF NOT EXISTS "sponsor_club" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(300) NOT NULL,
  "description" TEXT,
  "logo_url" TEXT,
  "website" TEXT,
  "meeting_info" TEXT,
  "message" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);

-- ─── EMAIL SYSTEM ───
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "template_key" VARCHAR(100) NOT NULL UNIQUE,
  "subject" VARCHAR(300) NOT NULL,
  "body_html" TEXT NOT NULL,
  "body_text" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "to_email" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(300) NOT NULL,
  "template_key" VARCHAR(100),
  "external_id" VARCHAR(300),
  "status" email_send_status NOT NULL DEFAULT 'pending',
  "error_message" TEXT,
  "sent_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── REMINDERS ───
CREATE TABLE IF NOT EXISTS "reminder_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" VARCHAR(50) NOT NULL,
  "reminder_type" VARCHAR(100) NOT NULL,
  "timing_hours" INT NOT NULL,
  "template_key" VARCHAR(100),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "reminder_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reminder_rule_id" UUID REFERENCES reminder_rules(id),
  "entity_type" VARCHAR(50) NOT NULL,
  "entity_id" UUID NOT NULL,
  "recipient_email" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "sent_at" TIMESTAMPTZ,
  "error_message" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ANNOUNCEMENTS ───
CREATE TABLE IF NOT EXISTS "announcements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "body" TEXT NOT NULL,
  "priority" announcement_priority NOT NULL DEFAULT 'normal',
  "target_audience" VARCHAR(50) DEFAULT 'all',
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ,
  "created_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── DOCUMENTS / RESOURCES ───
CREATE TABLE IF NOT EXISTS "documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "description" TEXT,
  "file_url" TEXT NOT NULL,
  "file_type" VARCHAR(50),
  "category" VARCHAR(100),
  "access_level" resource_access_level NOT NULL DEFAULT 'public',
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "uploaded_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── AUDIT LOGS ───
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES profiles(id),
  "action" audit_action NOT NULL,
  "entity_type" VARCHAR(100),
  "entity_id" UUID,
  "details" JSONB DEFAULT '{}',
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ATTENDANCE ───
CREATE TABLE IF NOT EXISTS "attendance_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "event_id" UUID REFERENCES events(id),
  "date" DATE NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'present',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, event_id)
);

-- ─── VOLUNTEER HOURS ───
CREATE TABLE IF NOT EXISTS "volunteer_hours" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "project_id" UUID REFERENCES projects(id),
  "event_id" UUID REFERENCES events(id),
  "date" DATE NOT NULL,
  "hours" DECIMAL(5,2) NOT NULL,
  "description" TEXT,
  "verified_by" UUID REFERENCES profiles(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── TRIGGERS ───
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsor_club_updated_at BEFORE UPDATE ON sponsor_club FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS for new tables ───
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tagged ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_club ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "public_read_project_images" ON project_images FOR SELECT USING (true);
CREATE POLICY "public_read_events" ON events FOR SELECT USING (is_public = true AND deleted_at IS NULL);
CREATE POLICY "public_read_posts" ON posts FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "public_read_post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "public_read_post_tagged" ON post_tagged FOR SELECT USING (true);
CREATE POLICY "public_read_sponsor_club" ON sponsor_club FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "public_read_email_templates" ON email_templates FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_documents" ON documents FOR SELECT USING (is_active = true AND access_level = 'public');
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT USING (is_published = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "public_read_albums" ON albums FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "public_read_media" ON media_files FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "public_read_booking_types" ON booking_types FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Member policies
CREATE POLICY "members_view_documents" ON documents FOR SELECT USING (is_active = true AND (access_level = 'public' OR access_level = 'member_only'));
CREATE POLICY "members_view_announcements" ON announcements FOR SELECT USING (is_published = true);
CREATE POLICY "members_view_bookings" ON bookings FOR SELECT USING (auth.uid() = (SELECT user_id FROM members WHERE id = member_id));
CREATE POLICY "members_create_bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM members WHERE id = member_id));
CREATE POLICY "members_view_event_registrations" ON event_registrations FOR SELECT USING (auth.uid() = (SELECT user_id FROM members WHERE id = member_id));
CREATE POLICY "members_create_event_registrations" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM members WHERE id = member_id));

-- Admin write policies
CREATE POLICY "admin_manage_projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary', 'project_director'))
);
CREATE POLICY "admin_manage_events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary', 'event_manager'))
);
CREATE POLICY "admin_manage_posts" ON posts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'public_image_director'))
);
CREATE POLICY "admin_manage_bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary'))
);
CREATE POLICY "admin_manage_contact_inquiries" ON contact_inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'secretary'))
);
CREATE POLICY "admin_manage_applications" ON membership_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'membership_director'))
);
CREATE POLICY "admin_manage_email_templates" ON email_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);
CREATE POLICY "admin_manage_announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary'))
);
CREATE POLICY "admin_manage_documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur JOIN profiles p ON p.user_id = ur.user_id WHERE ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured, is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured, is_public, deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured, is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_to ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_entity ON reminder_logs(entity_type, entity_id);
