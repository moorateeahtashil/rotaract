-- ============================================================
-- SEED DATA — News/Posts Sample Content
-- Run this AFTER running the migrations
-- ============================================================

-- ─── Post Categories ───
INSERT INTO "categories" (name, slug, description, is_active) VALUES
  ('Club News', 'club-news', 'Updates and announcements from our Rotaract club', true),
  ('Service Projects', 'service-projects', 'Stories from our service projects', true),
  ('Events', 'events', 'Event recaps and highlights', true),
  ('Member Spotlights', 'member-spotlights', 'Featured members and their stories', true),
  ('Rotary International', 'rotary-international', 'News from Rotary International', true),
  ('Community Impact', 'community-impact', 'How we are making a difference', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Sample Posts ───
-- Note: You'll need to get valid category IDs after insertion.
-- For now, we insert posts without category and you can update later via admin.

INSERT INTO "pages" (title, slug, meta_title, meta_description, is_published, is_public) VALUES
  ('News & Blog', 'news', 'News & Updates - Rotaract Club', 'Latest news and updates from our Rotaract club', true, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample posts (these will show on /news once database is seeded)
-- Note: The actual posts table is called 'posts' — check if it exists in migration 002
