export type UserRole = Database["public"]["Enums"]["user_role_type"];
export type MemberStatus = Database["public"]["Enums"]["member_status"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type AnnouncementPriority = Database["public"]["Enums"]["announcement_priority"];
export type ResourceAccessLevel = Database["public"]["Enums"]["resource_access_level"];
export type MediaType = Database["public"]["Enums"]["media_type"];
export type PageBlockType = Database["public"]["Enums"]["page_block_type"];
export type EmailSendStatus = Database["public"]["Enums"]["email_send_status"];
export type AuditAction = Database["public"]["Enums"]["audit_action"];

import type { Database } from "./db/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRoles = Database["public"]["Tables"]["user_roles"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type BoardPosition = Database["public"]["Tables"]["board_positions"]["Row"];
export type BoardMember = Database["public"]["Tables"]["board_members"]["Row"];
export type Committee = Database["public"]["Tables"]["committees"]["Row"];
export type CommitteeMember = Database["public"]["Tables"]["committee_members"]["Row"];
export type Avenue = Database["public"]["Tables"]["avenues"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectImage = Database["public"]["Tables"]["project_images"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventRegistration = Database["public"]["Tables"]["event_registrations"]["Row"];
export type BookingType = Database["public"]["Tables"]["booking_types"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type MediaFile = Database["public"]["Tables"]["media_files"]["Row"];
export type Album = Database["public"]["Tables"]["albums"]["Row"];
export type HomepageSection = Database["public"]["Tables"]["homepage_sections"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];
export type NavigationItem = Database["public"]["Tables"]["navigation_items"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type EmailTemplate = Database["public"]["Tables"]["email_templates"]["Row"];
export type ReminderRule = Database["public"]["Tables"]["reminder_rules"]["Row"];
export type SponsorClub = Database["public"]["Tables"]["sponsor_club"]["Row"];
export type MembershipApplication = Database["public"]["Tables"]["membership_applications"]["Row"];
export type ContactInquiry = Database["public"]["Tables"]["contact_inquiries"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type VolunteerHour = Database["public"]["Tables"]["volunteer_hours"]["Row"];
export type AttendanceRecord = Database["public"]["Tables"]["attendance_records"]["Row"];

// Composite types for joins
export type ProjectWithDetails = Project & {
  avenue: Avenue | null;
  committee: Committee | null;
  images: ProjectImage[];
  team: (Member & { profile: Profile })[];
};

export type EventWithDetails = Event & {
  avenue: Avenue | null;
  project: Project | null;
  registrationCount?: number;
};

export type PostWithDetails = Post & {
  category: Category | null;
  author: Profile | null;
};

export type MemberWithProfile = Member & {
  profile: Profile;
  boardPositions: BoardMember[];
};
