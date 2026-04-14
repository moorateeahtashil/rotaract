-- ============================================================
-- SEED DATA — Sample Posts, Events, Projects & Content
-- Run AFTER both migrations are applied
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

-- ─── Sample Posts (English) ───
-- Note: Replace author_id with a real profile ID from your database
INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Club Launches New Literacy Initiative in Local Schools',
  'literacy-initiative-schools',
  '<p>Our Rotaract club has partnered with three local schools to launch a comprehensive literacy program aimed at improving reading and writing skills among underprivileged students.</p>
   <p>The initiative, which begins this month, will see over 30 Rotaract members volunteering weekly to provide one-on-one tutoring, reading sessions, and educational resources to more than 200 students across the district.</p>
   <p>"Education is the foundation of community development," said our club president. "We believe that every child deserves the opportunity to read and write with confidence."</p>
   <p>The program will run for six months initially, with plans to expand based on the impact and feedback from teachers and students. We are also calling for book donations from the community to build mini-libraries in each participating school.</p>
   <p>If you would like to volunteer or donate books, please contact us through our website or visit our next meeting.</p>',
  'Over 30 Rotaract members volunteering to support 200+ students in local schools with literacy program.',
  'published',
  true,
  true,
  now() - interval '2 days',
  (SELECT id FROM categories WHERE slug = 'club-news' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Annual Tree Plantation Drive: 500 Trees Planted',
  'tree-plantation-500-trees',
  '<p>In our commitment to environmental sustainability, our club successfully planted 500 trees across the city during our annual Tree Plantation Drive last weekend.</p>
   <p>Members, volunteers, and community participants came together to plant native tree species in parks, along roadsides, and in school campuses. The drive was conducted in collaboration with the local municipal corporation and environmental organizations.</p>
   <p>This initiative aligns with Rotary International''s focus area of environmental sustainability and our club''s dedication to creating a greener, more sustainable future for our community.</p>
   <p>We thank all participants and sponsors who made this event possible. Stay tuned for updates on the survival rate and growth of these trees in the coming months!</p>',
  '500 native trees planted across the city in collaboration with local organizations.',
  'published',
  true,
  false,
  now() - interval '5 days',
  (SELECT id FROM categories WHERE slug = 'service-projects' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Member Spotlight: Priya Sharma Leads International Service Project',
  'member-spotlight-priya-sharma',
  '<p>We are proud to share the story of our member Priya Sharma, who recently led an international service project connecting Rotaract clubs across three countries.</p>
   <p>Priya coordinated with clubs in India, Nepal, and Bangladesh to provide clean water solutions to rural communities. The project installed 15 water purification units, benefiting over 3,000 people.</p>
   <p>"Working with fellow Rotaractors from different countries taught me the power of collaboration and shared vision," Priya shared. "Service has no boundaries."</p>
   <p>Priya has been an active member for three years and has contributed to over 20 service projects. She inspires us all to think bigger and act bolder!</p>',
  'How one member''s vision led to a cross-border clean water project benefiting 3,000+ people.',
  'published',
  true,
  false,
  now() - interval '1 week',
  (SELECT id FROM categories WHERE slug = 'member-spotlights' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Rotary International Announces New Peacebuilding Initiative',
  'rotary-peacebuilding-initiative',
  '<p>Rotary International has announced a new global peacebuilding initiative aimed at supporting conflict prevention and resolution efforts in communities worldwide.</p>
   <p>The initiative will expand the Rotary Peace Fellowship program, increase funding for peacebuilding projects, and create new partnerships with organizations working toward global peace.</p>
   <p>As Rotaractors, we can contribute to this effort by organizing community dialogues, supporting peace education programs, and fostering understanding across cultural and social divides in our own communities.</p>
   <p>Learn more about how you can get involved at rotary.org/peace</p>',
  'Rotary International expands peacebuilding efforts and fellowship programs globally.',
  'published',
  true,
  false,
  now() - interval '2 weeks',
  (SELECT id FROM categories WHERE slug = 'rotary-international' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Blood Donation Camp Collects 150 Units in One Day',
  'blood-donation-camp-150-units',
  '<p>Our club organized a mega blood donation camp at the community hall last Saturday, collecting over 150 units of blood in just one day.</p>
   <p>In partnership with the city blood bank, 200+ donors registered, with 150 successful donations. The collected blood will be distributed to hospitals and emergency services across the region.</p>
   <p>This initiative addresses the critical need for blood supply, especially during holiday seasons when donations typically drop. We are grateful to every donor who stepped forward to save lives.</p>
   <p>We plan to make this a quarterly event and are already working on the next camp. Stay connected for updates!</p>',
  '150 units of blood collected in partnership with city blood bank to support local hospitals.',
  'published',
  true,
  false,
  now() - interval '3 weeks',
  (SELECT id FROM categories WHERE slug = 'community-impact' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "posts" (title, slug, content, excerpt, status, is_published, is_featured, published_at, category_id)
SELECT
  'Upcoming: Annual Installation Dinner & New Board Swearing-In',
  'installation-dinner-new-board',
  '<p>Join us for our Annual Installation Dinner where we will swear in our new board of directors for the upcoming Rotaract year.</p>
   <p>The evening will include dinner, awards for outstanding service, entertainment, and the formal installation of our new president, vice president, secretary, treasurer, and directors.</p>
   <p>Date: Coming soon<br>Time: 7:00 PM<br>Venue: To be announced</p>
   <p>This is a great opportunity to welcome new leaders and celebrate the achievements of the outgoing team. Members and their families are invited. Please RSVP through the member portal.</p>',
  'Annual installation dinner celebrating new board leadership and honoring outgoing team.',
  'published',
  true,
  false,
  now() - interval '1 month',
  (SELECT id FROM categories WHERE slug = 'events' LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

-- ─── Seed Avenues of Service ───
INSERT INTO "avenues" (name, slug, description, long_description, sort_order, is_active) VALUES
  ('Club Development', 'club-development',
   'Strengthening our club through membership growth, retention, and effective administration.',
   'A strong club is the foundation of effective service. This avenue focuses on recruiting new members, engaging existing ones, and ensuring our club operates efficiently with proper governance, communication, and leadership development.',
   1, true),
  ('Community Service', 'community-service',
   'Improving lives and strengthening communities through meaningful service projects.',
   'Community service is at the heart of what we do. From local cleanups to educational programs, health camps to disaster relief — we take action to address the most pressing needs of our community and make a lasting, positive impact.',
   2, true),
  ('Vocational Service', 'vocational-service',
   'Using our professional skills to serve others and promote high ethical standards.',
   'Vocational service encourages Rotaractors to use their professional expertise to serve others. This includes mentoring youth, supporting career development, promoting ethical business practices, and helping people find meaningful employment.',
   3, true),
  ('International Service', 'international-service',
   'Building global understanding and peace through cross-cultural service.',
   'International service connects Rotaractors across borders. Through exchange programs, international partnerships, and global service projects, we build bridges of understanding and work together to solve problems that transcend national boundaries.',
   4, true),
  ('Professional Development', 'professional-development',
   'Developing leadership, career skills, and personal growth opportunities.',
   'Rotaract isn''t just about service — it''s about growing as a leader and a professional. Through workshops, networking events, mentorship programs, and hands-on project management experience, members develop skills that benefit their careers and personal lives.',
   5, true),
  ('Environmental Sustainability', 'environment',
   'Protecting and preserving our natural environment for future generations.',
   'Environmental sustainability is one of Rotary''s seven focus areas. Our projects include tree planting, waste management, water conservation, clean energy promotion, and environmental education — all aimed at creating a healthier planet for everyone.',
   6, true),
  ('Peacebuilding', 'peacebuilding',
   'Supporting conflict prevention and peacebuilding efforts worldwide.',
   'Through Rotary Peace Centers, fellowship programs, and community dialogues, we work to build understanding and goodwill across cultures. Rotaractors organize peace workshops, support refugees, and promote tolerance in their communities.',
   7, true),
  ('Youth Development', 'youth-development',
   'Empowering the next generation through mentorship, education, and leadership training.',
   'Youth development is at the heart of Rotaract. Through Interact partnerships, youth forums, career mentorship, and leadership workshops, we invest in young people and help them reach their full potential as future leaders.',
   8, true)
ON CONFLICT (slug) DO NOTHING;
