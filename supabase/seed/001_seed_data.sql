-- ============================================================
-- ROTARACT PLATFORM — SEED DATA
-- Realistic demo data for development and testing
-- ============================================================

-- ─── SITE SETTINGS ───
INSERT INTO "site_settings" ("key", "value", "value_type", "group_key", "label", "description", "is_public") VALUES
('club_name', 'Rotaract Club of Mumbai Central', 'string', 'general', 'Club Name', 'Official club name', true),
('club_tagline', 'Service Above Self', 'string', 'general', 'Tagline', 'Club tagline', true),
('club_description', 'Empowering young leaders through community service, fellowship, and professional development since 2015.', 'string', 'general', 'Description', 'Club description', true),
('contact_email', 'contact@rotaractmumbaicentral.org', 'string', 'contact', 'Contact Email', 'Primary contact email', true),
('contact_phone', '+91 98765 43210', 'string', 'contact', 'Contact Phone', 'Primary contact phone', true),
('meeting_day', 'Every 2nd & 4th Monday', 'string', 'meeting', 'Meeting Day', 'Regular meeting schedule', true),
('meeting_time', '7:00 PM IST', 'string', 'meeting', 'Meeting Time', 'Regular meeting time', true),
('meeting_location', 'Community Hall, Rotary Bhavan, Mumbai', 'string', 'meeting', 'Meeting Location', 'Regular meeting venue', true),
('social_facebook', 'https://facebook.com/rotaractmumbaicentral', 'string', 'social', 'Facebook', 'Facebook page URL', true),
('social_instagram', 'https://instagram.com/rotaractmumbaicentral', 'string', 'social', 'Instagram', 'Instagram profile URL', true),
('social_linkedin', 'https://linkedin.com/company/rotaractmumbaicentral', 'string', 'social', 'LinkedIn', 'LinkedIn page URL', true),
('social_twitter', 'https://twitter.com/rotaractmc', 'string', 'social', 'Twitter', 'Twitter profile URL', true),
('social_youtube', 'https://youtube.com/@rotaractmumbaicentral', 'string', 'social', 'YouTube', 'YouTube channel URL', true),
('seo_default_title', 'Rotaract Club of Mumbai Central — Service Above Self', 'string', 'seo', 'Default SEO Title', 'Default page title', true),
('seo_default_description', 'Rotaract Club of Mumbai Central empowers young leaders through community service and professional development.', 'string', 'seo', 'Default SEO Description', 'Default meta description', true),
('footer_copyright', '© 2026 Rotaract Club of Mumbai Central. All rights reserved.', 'string', 'footer', 'Footer Copyright', 'Footer copyright text', true),
('footer_tagline', 'Connecting young leaders through service, fellowship, and professional development.', 'string', 'footer', 'Footer Tagline', 'Footer tagline', true);

-- ─── NAVIGATION ITEMS ───
INSERT INTO "navigation_items" ("menu_key", "label", "href", "sort_order", "is_visible", "requires_auth", "is_external", "open_in_new_tab", "icon_key") VALUES
('main', 'Home', '/', 1, true, false, false, false, 'Home'),
('main', 'About', '/about', 2, false, false, false, false, 'Info'),
('main', 'Projects', '/projects', 3, false, false, false, false, 'FolderKanban'),
('main', 'Events', '/events', 4, false, false, false, false, 'Calendar'),
('main', 'News', '/news', 5, false, false, false, false, 'Newspaper'),
('main', 'Join Us', '/join', 6, false, false, false, false, 'Users'),
('main', 'Contact', '/contact', 7, false, false, false, false, 'Mail');

-- About sub-navigation
INSERT INTO "navigation_items" ("menu_key", "label", "href", "parent_id", "sort_order", "is_visible") VALUES
('main', 'About Rotaract', '/about', (SELECT id FROM navigation_items WHERE href = '/about' AND parent_id IS NULL LIMIT 1), 1, true),
('main', 'About Rotary', '/about/rotary', (SELECT id FROM navigation_items WHERE href = '/about' AND parent_id IS NULL LIMIT 1), 2, true),
('main', 'Our Club', '/about/our-club', (SELECT id FROM navigation_items WHERE href = '/about' AND parent_id IS NULL LIMIT 1), 3, true);

-- ─── AVENUES OF SERVICE ───
INSERT INTO "avenues" ("name", "slug", "description", "long_description", "icon_key", "color_hex", "sort_order", "is_active") VALUES
('Club Service', 'club-service', 'Strengthening our club fellowship and ensuring effective club functioning.', 'Club Service focuses on building a vibrant and effective club through fellowship activities, club administration, and member engagement. This avenue ensures that our club runs smoothly and that members feel connected and valued.', 'Users', '#17458f', 1, true),
('Community Service', 'community-service', 'Improving the quality of life in our local community through hands-on projects.', 'Community Service is the heart of what we do. Through this avenue, we identify local needs and organize projects that address education, health, sanitation, and community welfare. We work directly with communities to create sustainable impact.', 'Heart', '#d41367', 2, true),
('Vocational Service', 'vocational-service', 'Promoting integrity and excellence in our professions and serving others through our work.', 'Vocational Service encourages Rotaractors to uphold the highest ethical standards in their professions and to use their skills and expertise to serve others. This avenue connects professional growth with community impact.', 'Briefcase', '#0067c8', 3, true),
('International Service', 'international-service', 'Building global understanding and peace through cross-cultural projects and exchanges.', 'International Service connects our club to the global Rotaract network. Through international partnerships, cultural exchanges, and global humanitarian projects, we promote peace and understanding across borders.', 'Globe', '#00a2e0', 4, true),
('Professional Development', 'professional-development', 'Building skills, knowledge, and networks for career advancement and personal growth.', 'Professional Development equips our members with the skills and knowledge they need to excel in their careers. Through workshops, mentorship, and networking events, we help members grow as professionals and leaders.', 'GraduationCap', '#00adbb', 5, true),
('Environmental Sustainability', 'environmental-sustainability', 'Protecting our planet through conservation, awareness, and sustainable practices.', 'Environmental Sustainability addresses the urgent need to protect our natural environment. Through tree planting drives, cleanliness campaigns, awareness programs, and sustainable practices, we work to leave the planet better than we found it.', 'Leaf', '#22c55e', 6, true);

-- ─── BOARD POSITIONS ───
INSERT INTO "board_positions" ("position_key", "title", "description", "sort_order", "is_active") VALUES
('president', 'President', 'Leads the club and represents it at district and international levels.', 1, true),
('vice_president', 'Vice President', 'Supports the President and assumes leadership in their absence.', 2, true),
('secretary', 'Secretary', 'Maintains club records, handles correspondence, and manages administration.', 3, true),
('treasurer', 'Treasurer', 'Manages club finances, budgets, and financial reporting.', 4, true),
('sergeant_at_arms', 'Sergeant at Arms', 'Ensures meeting order and manages club logistics.', 5, true),
('membership_director', 'Membership Director', 'Leads membership recruitment, retention, and engagement efforts.', 6, true),
('project_director', 'Project Director', 'Plans, coordinates, and executes club service projects.', 7, true),
('public_image_director', 'Public Image Director', 'Manages the club''s public image, media, and communications.', 8, true),
('council_member', 'Council Member', 'Represents the club at the Rotary district council.', 9, true);

-- ─── HOMEPAGE SECTIONS ───
INSERT INTO "homepage_sections" ("section_type", "title", "subtitle", "body", "cta_label", "cta_href", "secondary_cta_label", "secondary_cta_href", "sort_order", "is_visible", "is_enabled") VALUES
('hero', 'Service Above Self', 'Empowering young leaders to create lasting change through community service, fellowship, and professional development.', NULL, 'Join Our Club', '/join', 'View Our Projects', '/projects', 1, true, true),
('meeting_info', 'Next Meeting', NULL, NULL, NULL, NULL, NULL, NULL, 2, true, true),
('stats', 'Our Impact', NULL, NULL, NULL, NULL, NULL, NULL, 3, true, true),
('featured_projects', 'Featured Projects', 'Making a difference through impactful service initiatives.', NULL, 'View All', '/projects', NULL, NULL, 4, true, true),
('upcoming_events', 'Upcoming Events', 'Join us at our next gathering.', NULL, 'View All', '/events', NULL, NULL, 5, true, true),
('avenues', 'Avenues of Service', 'Six pathways through which Rotaractors serve their communities and grow as leaders.', NULL, NULL, NULL, NULL, NULL, 6, true, true),
('board_preview', 'Our Leadership', 'Meet the team guiding our club.', NULL, 'View All', '/leadership', NULL, NULL, 7, true, true),
('news_preview', 'Latest News', 'Stay updated with our club''s achievements and stories.', NULL, 'View All', '/news', NULL, NULL, 8, true, true),
('sponsor', 'Our Sponsor Club', 'Proudly mentored by our sponsor Rotary club.', NULL, NULL, NULL, NULL, NULL, 9, true, true),
('cta', 'Ready to Make a Difference?', NULL, 'Join a global network of young leaders committed to creating positive change.', 'Apply for Membership', '/join', 'Contact Us', '/contact', 10, true, true);

-- ─── SPONSOR CLUB ───
INSERT INTO "sponsor_club" ("name", "description", "logo_url", "website", "meeting_info", "message", "is_active") VALUES
('Rotary Club of Mumbai Central', 'Our founding sponsor club, providing mentorship, guidance, and connection to the global Rotary network since 2015.', NULL, 'https://rotary.org', 'Every Monday at 7:30 PM, Rotary Bhavan, Mumbai', 'We are proud to mentor the next generation of service leaders through the Rotaract program.', true);

-- ─── PAGES ───
INSERT INTO "pages" ("title", "slug", "meta_title", "meta_description", "is_published", "is_public") VALUES
('About Rotaract', 'about-rotaract', 'About Rotaract — Rotary in Action', 'Learn about Rotaract, a global program of Rotary International for young leaders ages 18-30.', true, true),
('Privacy Policy', 'privacy-policy', 'Privacy Policy', 'How we collect, use, and protect your personal information.', true, true),
('Terms of Use', 'terms-of-use', 'Terms of Use', 'Terms and conditions for using our website.', true, true);

-- ─── CATEGORIES (for blog posts) ───
INSERT INTO "categories" ("name", "slug", "description", "sort_order", "is_active") VALUES
('Club News', 'club-news', 'News and updates about our club activities.', 1, true),
('Project Updates', 'project-updates', 'Updates and stories from our service projects.', 2, true),
('Member Spotlight', 'member-spotlight', 'Featuring our members and their achievements.', 3, true),
('Events', 'events', 'Event announcements and recaps.', 4, true),
('Rotary Connection', 'rotary-connection', 'News about our connection to Rotary International.', 5, true);

-- ─── EMAIL TEMPLATES ───
INSERT INTO "email_templates" ("name", "template_key", "subject", "body_html", "body_text", "is_active") VALUES
('Contact Form Acknowledgment', 'contact_acknowledgment', 'Thank you for contacting us — Rotaract Club', '<html><body><h1>Thank you for reaching out!</h1><p>Dear {{first_name}},</p><p>We have received your message and will respond within a few business days.</p><p>Best regards,<br/>{{club_name}}</p></body></html>', 'Thank you for reaching out! We will respond within a few business days.', true),
('Contact Form Notification', 'contact_admin_notification', 'New Contact Inquiry: {{subject}}', '<html><body><h1>New Contact Inquiry</h1><p><strong>From:</strong> {{first_name}} {{last_name}} ({{email}})</p><p><strong>Subject:</strong> {{subject}}</p><p><strong>Message:</strong> {{message}}</p></body></html>', 'New contact inquiry received.', true),
('Membership Inquiry Confirmation', 'membership_acknowledgment', 'Thank you for your interest in joining — Rotaract Club', '<html><body><h1>Welcome!</h1><p>Dear {{first_name}},</p><p>Thank you for your interest in joining our Rotaract club. Our membership director will be in touch soon.</p><p>Best regards,<br/>{{club_name}}</p></body></html>', 'Thank you for your interest! Our membership director will contact you.', true),
('Event Registration Confirmation', 'event_registration_confirmation', 'Registration Confirmed: {{event_title}}', '<html><body><h1>You''re Registered!</h1><p>Dear {{first_name}},</p><p>You are registered for <strong>{{event_title}}</strong> on {{event_date}}.</p><p>We look forward to seeing you there!</p></body></html>', 'You are registered for the event.', true),
('Booking Confirmation', 'booking_confirmation', 'Booking Confirmed: {{booking_type}}', '<html><body><h1>Booking Confirmed</h1><p>Dear {{first_name}},</p><p>Your booking for <strong>{{booking_type}}</strong> has been confirmed for {{booking_time}}.</p></body></html>', 'Your booking has been confirmed.', true),
('Welcome New Member', 'welcome_member', 'Welcome to the Club, {{first_name}}!', '<html><body><h1>Welcome to Rotaract!</h1><p>Dear {{first_name}},</p><p>We''re thrilled to welcome you as a member of {{club_name}}. Get ready for an amazing journey of service and growth!</p></body></html>', 'Welcome to the club!', true);

-- ─── REMINDER RULES ───
INSERT INTO "reminder_rules" ("entity_type", "reminder_type", "timing_hours", "template_key", "is_active") VALUES
('event', 'registration_reminder', 48, 'event_registration_confirmation', true),
('event', 'event_reminder', 24, 'event_registration_confirmation', true),
('booking', 'booking_reminder', 24, 'booking_confirmation', true),
('application', 'follow_up', 72, 'membership_acknowledgment', true);

-- ============================================================
-- NOTE: The following require auth.users entries to work properly
-- In development, create users first via Supabase Auth UI or API,
-- then run the remaining seed data.
-- ============================================================

-- To create a super admin for development:
-- 1. Sign up via the /signup page
-- 2. Then run:
-- INSERT INTO "user_roles" ("user_id", "role") VALUES ('<USER_UUID>', 'super_admin');

-- ─── SEED MEMBERS (after creating auth users) ───
-- These are example member records — create corresponding auth.users first

-- Example: After creating a user with ID 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx':
-- INSERT INTO "members" ("user_id", "member_number", "classification", "join_date", "status", "show_in_directory")
-- VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'RC-2024-001', 'Software Engineer', '2024-01-15', 'active', true);

-- ─── SEED BOARD MEMBERS (after creating members) ───
-- Example:
-- INSERT INTO "board_members" ("member_id", "position_id", "term_start", "term_end", "sort_order", "is_visible")
-- VALUES ('<MEMBER_UUID>', (SELECT id FROM board_positions WHERE position_key = 'president' LIMIT 1), '2025-07-01', '2026-06-30', 1, true);

-- ─── SEED PROJECTS ───
-- INSERT INTO "projects" ("title", "slug", "description", "long_description", "avenue_id", "status", "start_date", "end_date", "location", "is_featured", "is_published")
-- VALUES ('Clean Drive Initiative', 'clean-drive-initiative', 'A community cleanliness drive...', 'Full description...', (SELECT id FROM avenues WHERE slug = 'community-service' LIMIT 1), 'active', '2025-03-01', '2025-03-15', 'Mumbai Central', true, true);

-- ─── SEED EVENTS ───
-- INSERT INTO "events" ("title", "slug", "description", "event_type", "date", "location", "registration_open", "status", "is_public")
-- VALUES ('Monthly Club Meeting', 'monthly-meeting-march-2025', 'Regular club meeting to discuss projects...', 'club meeting', '2025-03-10 19:00:00+05:30', 'Rotary Bhavan', true, 'published', true);

-- ─── SEED POSTS ───
-- INSERT INTO "posts" ("title", "slug", "content", "excerpt", "category_id", "status", "is_published", "published_at", "author_id")
-- VALUES ('Our First Project of the Year', 'first-project-2025', 'Full blog content...', 'We kicked off the year with...', (SELECT id FROM categories WHERE slug = 'project-updates' LIMIT 1), 'published', true, NOW(), '<AUTHOR_USER_ID>');
