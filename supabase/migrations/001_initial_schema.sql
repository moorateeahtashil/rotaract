-- ============================================================
-- ROTARACT PLATFORM — Migration Batch 1
-- Foundation: Enums, Core Tables, RLS, Indexes
-- ============================================================

-- ─── ENUMS ───
CREATE TYPE "user_role_type" AS ENUM (
  'super_admin', 'admin', 'president', 'secretary',
  'public_image_director', 'membership_director',
  'project_director', 'event_manager', 'board_member',
  'member', 'applicant', 'public'
);

CREATE TYPE "member_status" AS ENUM ('active', 'inactive', 'suspended', 'alumni', 'pending');
CREATE TYPE "project_status" AS ENUM ('planned', 'active', 'completed', 'archived', 'cancelled');
CREATE TYPE "event_status" AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');
CREATE TYPE "registration_status" AS ENUM ('registered', 'checked_in', 'cancelled', 'no_show');
CREATE TYPE "booking_status" AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE "application_status" AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE "announcement_priority" AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE "resource_access_level" AS ENUM ('public', 'member_only', 'board_only');
CREATE TYPE "media_type" AS ENUM ('image', 'video', 'document', 'other');
CREATE TYPE "page_block_type" AS ENUM (
  'hero', 'text', 'image', 'image_gallery', 'cta', 'stats',
  'cards', 'faq', 'timeline', 'video_embed', 'spacer', 'custom_html'
);
CREATE TYPE "email_send_status" AS ENUM (
  'pending', 'sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked'
);
CREATE TYPE "audit_action" AS ENUM (
  'create', 'update', 'delete', 'restore', 'login', 'logout',
  'role_change', 'approval', 'rejection', 'email_sent',
  'reminder_sent', 'setting_change'
);

-- ─── TABLES ───

CREATE TABLE "profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "avatar_url" TEXT,
  "bio" TEXT,
  "date_of_birth" DATE,
  "address_line_1" VARCHAR(255),
  "address_line_2" VARCHAR(255),
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "postal_code" VARCHAR(20),
  "country" VARCHAR(100) DEFAULT 'India',
  "emergency_contact_name" VARCHAR(200),
  "emergency_contact_phone" VARCHAR(20),
  "blood_group" VARCHAR(5),
  "occupation" VARCHAR(200),
  "company" VARCHAR(200),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "user_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "role" user_role_type NOT NULL,
  "granted_by" UUID REFERENCES profiles(id),
  "granted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expires_at" TIMESTAMPTZ,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role)
);

CREATE TABLE "members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  "member_number" VARCHAR(50) UNIQUE,
  "classification" VARCHAR(200),
  "join_date" DATE NOT NULL,
  "membership_type" VARCHAR(50) DEFAULT 'core',
  "status" member_status NOT NULL DEFAULT 'pending',
  "total_service_hours" DECIMAL(8,2) DEFAULT 0,
  "total_projects" INT DEFAULT 0,
  "total_events" INT DEFAULT 0,
  "show_in_directory" BOOLEAN NOT NULL DEFAULT true,
  "social_facebook" TEXT,
  "social_instagram" TEXT,
  "social_linkedin" TEXT,
  "social_twitter" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "board_positions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "position_key" VARCHAR(100) NOT NULL UNIQUE,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "board_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "position_id" UUID NOT NULL REFERENCES board_positions(id) ON DELETE CASCADE,
  "custom_title" VARCHAR(200),
  "photo_url" TEXT,
  "term_start" DATE NOT NULL,
  "term_end" DATE,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  UNIQUE(member_id, position_id, term_start)
);

CREATE TABLE "avenues" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "long_description" TEXT,
  "icon_key" VARCHAR(50),
  "image_url" TEXT,
  "color_hex" VARCHAR(7),
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "committees" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "avenue_id" UUID REFERENCES avenues(id),
  "chair_member_id" UUID REFERENCES members(id),
  "logo_url" TEXT,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "committee_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "committee_id" UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  "member_id" UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  "role_in_committee" VARCHAR(100) DEFAULT 'member',
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(committee_id, member_id)
);

CREATE TABLE "site_settings" (
  "key" VARCHAR(100) PRIMARY KEY,
  "value" TEXT NOT NULL,
  "value_type" VARCHAR(20) NOT NULL DEFAULT 'string',
  "group_key" VARCHAR(50) NOT NULL DEFAULT 'general',
  "label" VARCHAR(200),
  "description" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "navigation_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "menu_key" VARCHAR(50) NOT NULL DEFAULT 'main',
  "label" VARCHAR(100) NOT NULL,
  "href" TEXT NOT NULL,
  "parent_id" UUID REFERENCES navigation_items(id),
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "requires_auth" BOOLEAN NOT NULL DEFAULT false,
  "required_role" user_role_type,
  "is_external" BOOLEAN NOT NULL DEFAULT false,
  "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
  "icon_key" VARCHAR(50),
  "mobile_only" BOOLEAN NOT NULL DEFAULT false,
  "desktop_only" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "homepage_sections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "section_type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(300),
  "subtitle" VARCHAR(300),
  "body" TEXT,
  "image_url" TEXT,
  "cta_label" VARCHAR(100),
  "cta_href" TEXT,
  "secondary_cta_label" VARCHAR(100),
  "secondary_cta_href" TEXT,
  "data_json" JSONB DEFAULT '{}',
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(300) NOT NULL,
  "slug" VARCHAR(350) NOT NULL UNIQUE,
  "meta_title" VARCHAR(300),
  "meta_description" TEXT,
  "meta_keywords" TEXT,
  "og_image_url" TEXT,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

CREATE TABLE "page_blocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_id" UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  "block_type" page_block_type NOT NULL,
  "title" VARCHAR(300),
  "content" TEXT,
  "content_json" JSONB DEFAULT '{}',
  "image_url" TEXT,
  "image_url_2" TEXT,
  "cta_label" VARCHAR(100),
  "cta_href" TEXT,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_visible" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "parent_id" UUID REFERENCES categories(id),
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- ─── HELPER FUNCTIONS ───
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_user_highest_role()
RETURNS user_role_type AS $$
  SELECT role FROM user_roles
  WHERE user_id = auth.uid()
  AND is_active = true
  ORDER BY
    CASE role
      WHEN 'super_admin' THEN 0 WHEN 'admin' THEN 1
      WHEN 'president' THEN 2 WHEN 'secretary' THEN 3
      WHEN 'public_image_director' THEN 4 WHEN 'membership_director' THEN 5
      WHEN 'project_director' THEN 6 WHEN 'event_manager' THEN 7
      WHEN 'board_member' THEN 8 WHEN 'member' THEN 9
      WHEN 'applicant' THEN 10 ELSE 11
    END
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_member_id()
RETURNS UUID AS $$
  SELECT id FROM members WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── UPDATED_AT TRIGGERS ───
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON board_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avenues_updated_at BEFORE UPDATE ON avenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON committees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_navigation_updated_at BEFORE UPDATE ON navigation_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_blocks_updated_at BEFORE UPDATE ON page_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── AUTH TRIGGER ───
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE avenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read for public content
CREATE POLICY "public_read_avenues" ON avenues FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "public_read_homepage" ON homepage_sections FOR SELECT USING (is_visible = true AND is_enabled = true);
CREATE POLICY "public_read_pages" ON pages FOR SELECT USING (is_published = true AND is_public = true AND deleted_at IS NULL);
CREATE POLICY "public_read_page_blocks" ON page_blocks FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "public_read_navigation" ON navigation_items FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_board" ON board_members FOR SELECT USING (is_visible = true AND deleted_at IS NULL);
CREATE POLICY "public_read_board_positions" ON board_positions FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_committees" ON committees FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Members can view member directory
CREATE POLICY "members_view_directory" ON members FOR SELECT USING (
  show_in_directory = true AND status = 'active' AND deleted_at IS NULL
);

-- Authenticated users can view profiles
CREATE POLICY "authenticated_view_profiles" ON profiles FOR SELECT USING (
  auth.uid() IS NOT NULL AND deleted_at IS NULL
);

-- Admin write policies (simplified — production should be more granular)
CREATE POLICY "admin_manage_avenues" ON avenues FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'president', 'secretary'))
);
CREATE POLICY "admin_manage_homepage" ON homepage_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'public_image_director'))
);
CREATE POLICY "admin_manage_navigation" ON navigation_items FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);
CREATE POLICY "admin_manage_pages" ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);
CREATE POLICY "admin_manage_page_blocks" ON page_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);
CREATE POLICY "admin_manage_settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);

-- Users can edit own profile
CREATE POLICY "users_edit_own_profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_edit_own_member" ON members FOR UPDATE USING (auth.uid() = user_id);

-- ─── INDEXES ───
CREATE INDEX idx_avenues_slug ON avenues(slug);
CREATE INDEX idx_avenues_active ON avenues(is_active, deleted_at);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_directory ON members(show_in_directory, status, deleted_at);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published, is_public, deleted_at);
CREATE INDEX idx_homepage_sections_visible ON homepage_sections(is_visible, is_enabled, sort_order);
CREATE INDEX idx_nav_menu ON navigation_items(menu_key, parent_id, sort_order);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
