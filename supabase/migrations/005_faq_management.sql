-- ============================================================
-- FAQ ADMIN MANAGEMENT — Migration
-- Adds proper FAQ table with admin CRUD support
-- ============================================================

-- ─── FAQ CATEGORIES ───
CREATE TABLE IF NOT EXISTS "faq_categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── FAQ ENTRIES ───
CREATE TABLE IF NOT EXISTS "faqs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID REFERENCES faq_categories(id),
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sort_order" INT NOT NULL DEFAULT 0,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" UUID REFERENCES profiles(id)
);

-- ─── TRIGGERS ───
CREATE TRIGGER update_faq_categories_updated_at BEFORE UPDATE ON faq_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ───
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public read for published FAQs
CREATE POLICY "public_read_faq_categories" ON faq_categories FOR SELECT 
  USING (is_active = true);
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT 
  USING (is_published = true AND deleted_at IS NULL);

-- Admin write policies
CREATE POLICY "admin_manage_faq_categories" ON faq_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin'))
);
CREATE POLICY "admin_manage_faqs" ON faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.is_active = true AND ur.role IN ('super_admin', 'admin', 'secretary'))
);

-- ─── INDEXES ───
CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX idx_faq_categories_active ON faq_categories(is_active, sort_order);
CREATE INDEX idx_faqs_category ON faqs(category_id);
CREATE INDEX idx_faqs_published ON faqs(is_published, deleted_at, sort_order);
