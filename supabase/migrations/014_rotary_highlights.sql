-- Rotary highlights: admin-managed cards for the "What is Rotary?" section
CREATE TABLE IF NOT EXISTS "rotary_highlights" (
  "id"          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "title"       TEXT        NOT NULL,
  "body"        TEXT,
  "image_url"   TEXT,
  "sort_order"  INT         DEFAULT 0,
  "is_active"   BOOLEAN     DEFAULT true,
  "created_at"  TIMESTAMPTZ DEFAULT now(),
  "updated_at"  TIMESTAMPTZ DEFAULT now()
);

-- Seed with the previous hardcoded content so the section isn't empty on first deploy
INSERT INTO "rotary_highlights" ("title", "body", "image_url", "sort_order") VALUES
  ('Peace',               '150+ Peace Centers worldwide working to prevent conflict and foster long-lasting peace.',       NULL, 1),
  ('Disease Prevention',  'Rotary has helped make the world 99.9% polio-free through the PolioPlus program.',             NULL, 2),
  ('Water & Sanitation',  'Clean water and sanitation access provided to over 10 million people across developing nations.', NULL, 3),
  ('Education',           'Over 50,000 scholarships awarded through the Rotary Foundation to future global leaders.',      NULL, 4),
  ('Maternal Health',     'Improving maternal and child health outcomes in 100+ countries through targeted programs.',     NULL, 5),
  ('Economic Growth',     '30,000+ livelihood and economic development projects launched in underserved communities.',     NULL, 6),
  ('Environment',         '5,000+ environmental initiatives protecting ecosystems and promoting sustainability.',          NULL, 7),
  ('Community Service',   '1.4 million Rotary members united in hands-on service to make communities stronger.',          NULL, 8);

-- RLS: anyone can read, authenticated users can manage
ALTER TABLE "rotary_highlights" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read highlights"
  ON "rotary_highlights" FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Authenticated can manage highlights"
  ON "rotary_highlights" FOR ALL TO authenticated USING (true) WITH CHECK (true);
