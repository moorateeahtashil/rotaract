import { z } from "zod";

// ============================================================
// AUTH
// ============================================================
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// ============================================================
// PROFILE
// ============================================================
export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  bio: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  occupation: z.string().optional(),
  company: z.string().optional(),
  social_facebook: z.string().url().optional().or(z.literal("")),
  social_instagram: z.string().url().optional().or(z.literal("")),
  social_linkedin: z.string().url().optional().or(z.literal("")),
  social_twitter: z.string().url().optional().or(z.literal("")),
});

// ============================================================
// EVENT
// ============================================================
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300),
  slug: z.string().min(3).max(350).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  long_description: z.string().optional(),
  event_type: z.string().max(50).optional(),
  avenue_id: z.string().uuid().optional().or(z.literal("")),
  project_id: z.string().uuid().optional().or(z.literal("")),
  date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  location: z.string().max(300).optional(),
  location_url: z.string().url().optional().or(z.literal("")),
  map_embed_url: z.string().url().optional().or(z.literal("")),
  capacity: z.coerce.number().int().positive().optional(),
  registration_open: z.boolean(),
  registration_opens_at: z.coerce.date().optional(),
  registration_deadline: z.coerce.date().optional(),
  registration_fee: z.coerce.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean(),
  is_public: z.boolean(),
  status: z.enum(["draft", "published", "ongoing", "completed", "cancelled"]),
  seo_title: z.string().max(300).optional(),
  seo_description: z.string().optional(),
  og_image_url: z.string().url().optional().or(z.literal("")),
}).refine((data) => {
  if (data.end_date && data.date) {
    return data.end_date >= data.date;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

// ============================================================
// PROJECT
// ============================================================
export const projectSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(350).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(10),
  long_description: z.string().optional(),
  avenue_id: z.string().uuid().optional().or(z.literal("")),
  committee_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["planned", "active", "completed", "archived", "cancelled"]),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  location: z.string().max(300).optional(),
  location_url: z.string().url().optional().or(z.literal("")),
  budget_amount: z.coerce.number().min(0).optional(),
  funds_raised: z.coerce.number().min(0).optional(),
  impact_metrics: z.record(z.string(), z.any()).optional(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  seo_title: z.string().max(300).optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  og_image_url: z.string().url().optional().or(z.literal("")),
});

// ============================================================
// MEMBERSHIP APPLICATION
// ============================================================
export const membershipApplicationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required").optional(),
  date_of_birth: z.coerce.date().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  education: z.string().optional(),
  why_join: z.string().min(20, "Please tell us why you want to join (min 20 characters)"),
  how_heard: z.string().optional(),
  social_links: z.record(z.string()).optional(),
  additional_answers: z.record(z.string(), z.any()).optional(),
});

// ============================================================
// CONTACT
// ============================================================
export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required").max(300),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ============================================================
// BOOKING
// ============================================================
export const bookingSchema = z.object({
  booking_type_id: z.string().uuid(),
  slot_id: z.string().uuid().optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  notes: z.string().optional(),
}).refine((data) => data.end_time > data.start_time, {
  message: "End time must be after start time",
  path: ["end_time"],
});

// ============================================================
// ANNOUNCEMENT
// ============================================================
export const announcementSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  target_audience: z.enum(["all", "members", "board"]).optional(),
  is_published: z.boolean(),
  published_at: z.coerce.date().optional(),
  expires_at: z.coerce.date().optional(),
});

// ============================================================
// FAQ
// ============================================================
export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().max(100).optional(),
  sort_order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
});

// ============================================================
// RESOURCE
// ============================================================
export const resourceSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  file_url: z.string().url(),
  file_type: z.string().optional(),
  category: z.string().max(100).optional(),
  access_level: z.enum(["public", "member_only", "board_only"]),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

// ============================================================
// POST / BLOG
// ============================================================
export const postSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(350).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  featured_image: z.string().url().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  published_at: z.coerce.date().optional(),
  seo_title: z.string().max(300).optional(),
  seo_description: z.string().optional(),
  og_image_url: z.string().url().optional().or(z.literal("")),
});

// ============================================================
// AVENUE
// ============================================================
export const avenueSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  long_description: z.string().optional(),
  icon_key: z.string().max(50).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

// ============================================================
// BOARD MEMBER
// ============================================================
export const boardMemberSchema = z.object({
  member_id: z.string().uuid(),
  position_id: z.string().uuid(),
  custom_title: z.string().max(200).optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  term_start: z.coerce.date(),
  term_end: z.coerce.date().optional(),
  sort_order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
});

// ============================================================
// SITE SETTINGS
// ============================================================
export const siteSettingsSchema = z.record(z.string(), z.string());

// ============================================================
// NAVIGATION ITEM
// ============================================================
export const navigationItemSchema = z.object({
  menu_key: z.string().max(50),
  label: z.string().min(1).max(100),
  href: z.string(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.coerce.number().int().min(0),
  is_visible: z.boolean(),
  requires_auth: z.boolean(),
  required_role: z.string().optional().nullable(),
  is_external: z.boolean(),
  open_in_new_tab: z.boolean(),
  icon_key: z.string().max(50).optional().nullable(),
  mobile_only: z.boolean(),
  desktop_only: z.boolean(),
});
