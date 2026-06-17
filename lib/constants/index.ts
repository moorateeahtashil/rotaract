// ============================================================
// BRAND COLORS — Rotary/Rotaract Approved Palette
// ============================================================
export const BRAND_COLORS = {
  rotaryBlue: "#17458f",
  rotaryGold: "#f7a81b",
  azure: "#0067c8",
  skyBlue: "#00a2e0",
  cranberry: "#d41367",
  turquoise: "#00adbb",
  white: "#ffffff",
  charcoal: "#54565a",
  pewter: "#898a8d",
  smoke: "#b1b1b1",
  silver: "#d0cfcd",
  stone: "#9ba4b0",
  cloud: "#d6d1ca",
  black: "#000000",
} as const;

// ============================================================
// PRIMARY BRAND
// ============================================================
export const PRIMARY = BRAND_COLORS.rotaryBlue;
export const ACCENT = BRAND_COLORS.rotaryGold;

// ============================================================
// TYPOGRAPHY
// ============================================================
export const FONT_HEADING =
  '"Open Sans", "Arial", sans-serif';
export const FONT_BODY = '"Open Sans", "Georgia", serif';

// ============================================================
// AVENUES OF SERVICE (Default 6)
// ============================================================
export const DEFAULT_AVENUES = [
  {
    key: "club-development",
    name: "Club Development",
    icon: "Users",
  },
  {
    key: "community-service",
    name: "Community Service",
    icon: "Heart",
  },
  {
    key: "vocational-service",
    name: "Vocational Service",
    icon: "Briefcase",
  },
  {
    key: "international-service",
    name: "International Service",
    icon: "Globe",
  },
  {
    key: "professional-development",
    name: "Professional Development",
    icon: "GraduationCap",
  },
  {
    key: "environment",
    name: "Environmental Sustainability",
    icon: "Leaf",
  },
  {
    key: "peacebuilding",
    name: "Peacebuilding",
    icon: "Heart",
  },
  {
    key: "youth-development",
    name: "Youth Development",
    icon: "Users",
  },
] as const;

// ============================================================
// BOARD POSITIONS (Default)
// ============================================================
export const DEFAULT_BOARD_POSITIONS = [
  { key: "president", title: "President", sort_order: 1 },
  { key: "vice_president", title: "Vice President", sort_order: 2 },
  { key: "secretary", title: "Secretary", sort_order: 3 },
  { key: "treasurer", title: "Treasurer", sort_order: 4 },
  { key: "sergeant_at_arms", title: "Sergeant at Arms", sort_order: 5 },
  {
    key: "membership_director",
    title: "Membership Director",
    sort_order: 6,
  },
  {
    key: "project_director",
    title: "Project Director",
    sort_order: 7,
  },
  {
    key: "public_image_director",
    title: "Public Image Director",
    sort_order: 8,
  },
  { key: "council_member", title: "Council Member", sort_order: 9 },
] as const;

// ============================================================
// SITE SETTINGS KEYS
// ============================================================
export const SITE_SETTINGS_GROUPS = {
  GENERAL: "general",
  CONTACT: "contact",
  SOCIAL: "social",
  SEO: "seo",
  MEETING: "meeting",
  FOOTER: "footer",
  TOGGLE: "toggle",
} as const;

export const SITE_SETTINGS_KEYS = {
  CLUB_NAME: "club_name",
  CLUB_TAGLINE: "club_tagline",
  CLUB_DESCRIPTION: "club_description",
  LOGO_URL: "logo_url",
  FAVICON_URL: "favicon_url",
  CONTACT_EMAIL: "contact_email",
  CONTACT_PHONE: "contact_phone",
  MEETING_DAY: "meeting_day",
  MEETING_TIME: "meeting_time",
  MEETING_LOCATION: "meeting_location",
  FOOTER_COPYRIGHT: "footer_copyright",
  FOOTER_TAGLINE: "footer_tagline",
  SOCIAL_FACEBOOK: "social_facebook",
  SOCIAL_INSTAGRAM: "social_instagram",
  SOCIAL_TWITTER: "social_twitter",
  SOCIAL_LINKEDIN: "social_linkedin",
  SOCIAL_YOUTUBE: "social_youtube",
  SEO_DEFAULT_TITLE: "seo_default_title",
  SEO_DEFAULT_DESCRIPTION: "seo_default_description",
  SEO_DEFAULT_OG_IMAGE: "seo_default_og_image",
  GOOGLE_MAPS_EMBED_URL: "google_maps_embed_url",
  REGISTRATION_OPEN: "registration_open",
  MAINTENANCE_MODE: "maintenance_mode",
} as const;

// ============================================================
// ROUTES
// ============================================================
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/about/rotary",
  "/about/our-club",
  "/leadership",
  "/members",
  "/avenues-of-service",
  "/projects",
  "/events",
  "/news",
  "/join",
  "/contact",
  "/sponsors",
  "/resources",
  "/faq",
  "/gallery",
  "/privacy",
  "/terms",
] as const;

export const MEMBER_ROUTES = [
  "/member",
  "/member/profile",
  "/member/events",
  "/member/attendance",
  "/member/announcements",
  "/member/directory",
  "/member/resources",
] as const;

export const ADMIN_ROUTES = ["/admin"] as const;

export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

// ============================================================
// PAGINATION
// ============================================================
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 25;

// ============================================================
// UPLOAD
// ============================================================
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

// ============================================================
// DATE FORMATS
// ============================================================
export const DATE_FORMAT = "yyyy-MM-dd";
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm";
export const DISPLAY_DATE_FORMAT = "MMMM d, yyyy";
export const DISPLAY_DATETIME_FORMAT = "MMM d, yyyy 'at' h:mm a";
