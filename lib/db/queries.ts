// ============================================================
// DATABASE QUERIES — Server-side data fetching functions
// ============================================================

import { createServerClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types";

type Tables = Database["public"]["Tables"];

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSiteSettings() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .order("group_key");
  return (data ?? []) as Tables["site_settings"]["Row"][];
}

export async function getSiteSettingByKey(key: string) {
  const supabase = await createServerClient() as any;
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

// ============================================================
// NAVIGATION
// ============================================================

export async function getNavigationItems(menuKey = "main") {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_key", menuKey)
    .eq("is_visible", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

export async function getNavigationWithChildren(menuKey = "main") {
  const items = await getNavigationItems(menuKey);
  const supabase = await createServerClient() as any;
  const { data: children } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("menu_key", menuKey)
    .eq("is_visible", true)
    .not("parent_id", "is", null)
    .order("sort_order", { ascending: true });

  return items.map((item) => ({
    ...item,
    children: (children as any[])?.filter((c) => c.parent_id === item.id) ?? [],
  }));
}

// ============================================================
// HOMEPAGE SECTIONS
// ============================================================

export async function getHomepageSections() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_visible", true)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// AVENUES
// ============================================================

export async function getAvenues() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("avenues")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

export async function getAvenueBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("avenues")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();
  return data as Tables["avenues"]["Row"] | null;
}

// ============================================================
// PROJECTS
// ============================================================

export async function getProjects({
  status,
  avenueId,
  featured,
  limit,
  offset = 0,
}: {
  status?: string;
  avenueId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("projects")
    .select(
      `
      *,
      avenue:avenues(name, slug, color_hex),
      committee:committees(name, slug),
      images:project_images(image_url, caption, is_primary, sort_order),
      team:project_team(
        member:members(id, profile:profiles(first_name, last_name, avatar_url)),
        role_in_project
      )
    `,
    )
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (avenueId) query = query.eq("avenue_id", avenueId);
  if (featured) query = query.eq("is_featured", true);
  if (limit) query = query.range(offset, offset + limit - 1);

  const { data } = await query;
  return (data ?? []) as any[];
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("projects")
    .select(
      `
      *,
      avenue:avenues(name, slug, color_hex, description),
      committee:committees(name, slug),
      images:project_images(image_url, caption, is_primary, sort_order),
      team:project_team(
        member:members(id, profile:profiles(first_name, last_name, avatar_url)),
        role_in_project
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();
  return data as any;
}

export async function getFeaturedProjects(limit = 3) {
  return getProjects({ featured: true, limit });
}

export async function getProjectCount() {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)
    .is("deleted_at", null);
  return count ?? 0;
}

// ============================================================
// EVENTS
// ============================================================

export async function getEvents({
  status,
  eventType,
  avenueId,
  featured,
  upcoming,
  limit,
  offset = 0,
}: {
  status?: string;
  eventType?: string;
  avenueId?: string;
  featured?: boolean;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("events")
    .select(
      `
      *,
      avenue:avenues(name, slug, color_hex)
    `,
    )
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("date", { ascending: true });

  if (status) query = query.eq("status", status);
  else query = query.in("status", ["published", "ongoing"]);
  if (eventType) query = query.eq("event_type", eventType);
  if (avenueId) query = query.eq("avenue_id", avenueId);
  if (featured) query = query.eq("is_featured", true);
  if (upcoming) query = query.gte("date", new Date().toISOString());
  if (limit) query = query.range(offset, offset + limit - 1);

  const { data } = await query;
  return (data ?? []) as any[];
}

export async function getEventBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("events")
    .select(
      `
      *,
      avenue:avenues(name, slug, color_hex)
    `,
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();
  return data as any;
}

export async function getUpcomingEvents(limit = 6) {
  return getEvents({ upcoming: true, limit });
}

export async function getEventCount() {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .in("status", ["published", "ongoing"])
    .is("deleted_at", null);
  return count ?? 0;
}

// ============================================================
// BOARD MEMBERS
// ============================================================

export async function getBoardMembers({
  current = true,
}: { current?: boolean } = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("board_members")
    .select(
      `
      *,
      position:board_positions(*),
      member:members(
        id,
        user_id,
        profile:profiles(first_name, last_name, email, avatar_url, bio, occupation, company)
      )
    `,
    )
    .eq("is_visible", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (current) {
    const today = new Date().toISOString().split("T")[0];
    query = query.lte("term_start", today).or(`term_end.is.null,term_end.gte.${today}`);
  }

  const { data } = await query;
  return (data ?? []) as any[];
}

export async function getBoardPositions() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("board_positions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// MEMBERS
// ============================================================

export async function getMembers({
  status = "active",
  showInDirectory = true,
  limit,
  offset = 0,
}: {
  status?: string;
  showInDirectory?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("members")
    .select(
      `
      *,
      profile:profiles(first_name, last_name, email, avatar_url, bio, occupation, company)
    `,
    )
    .eq("show_in_directory", showInDirectory)
    .eq("status", status)
    .is("deleted_at", null)
    .order("join_date", { ascending: false });

  if (limit) query = query.range(offset, offset + limit - 1);

  const { data } = await query;
  return (data ?? []) as any[];
}

export async function getMemberCount() {
  const supabase = await createServerClient();
  const { count } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);
  return count ?? 0;
}

// ============================================================
// POSTS / BLOG / NEWS
// ============================================================

export async function getPosts({
  status = "published",
  categoryId,
  featured,
  limit,
  offset = 0,
  search,
}: {
  status?: string;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      category:categories(name, slug),
      author:profiles(first_name, last_name, avatar_url)
    `,
    )
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (status === "published") {
    query = query.eq("is_published", true).lte("published_at", new Date().toISOString());
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (featured) query = query.eq("is_featured", true);
  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }
  if (limit) query = query.range(offset, offset + limit - 1);

  const { data } = await query;
  return (data ?? []) as any[];
}

export async function getPostBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      category:categories(name, slug),
      author:profiles(first_name, last_name, avatar_url),
      tags:post_tagged(tags:post_tags(name, slug))
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();
  return data as any;
}

export async function getPostCategories() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// PAGES
// ============================================================

export async function getPageBySlug(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_public", true)
    .is("deleted_at", null)
    .single();
  return data as any;
}

export async function getPageBlocks(pageId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", pageId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// ROTARY HIGHLIGHTS
// ============================================================

export async function getRotaryHighlights() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("rotary_highlights")
    .select("id, title, body, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// SPONSOR CLUB
// ============================================================

export async function getSponsorClub() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("sponsor_club")
    .select("*")
    .eq("is_active", true)
    .order("club_name", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// COMMITTEES
// ============================================================

export async function getCommittees() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("committees")
    .select(
      `
      *,
      chair:members(profile:profiles(first_name, last_name)),
      avenue:avenues(name, slug)
    `,
    )
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// MEDIA / GALLERY
// ============================================================

export async function getAlbums() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("albums")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as any[];
}

export async function getAlbumById(albumId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("albums")
    .select(
      `
      *,
      media:album_media(
        media:media_files(id, file_url, thumbnail_url, alt_text, caption, sort_order)
      )
    `,
    )
    .eq("id", albumId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();
  return data as any;
}

export async function getMediaFiles({
  type,
  limit,
}: { type?: string; limit?: number } = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("media_files")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("media_type", type);
  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []) as any[];
}

// ============================================================
// BOOKINGS
// ============================================================

export async function getBookingTypes() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("booking_types")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  return (data ?? []) as any[];
}

export async function getBookingSlots(bookingTypeId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("booking_slots")
    .select("*")
    .eq("booking_type_id", bookingTypeId)
    .eq("is_available", true)
    .order("start_time", { ascending: true });
  return (data ?? []) as any[];
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const supabase = await createServerClient();

  const [
    { count: memberCount },
    { count: projectCount },
    { count: eventCount },
    { count: inquiryCount },
    { count: applicationCount },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)
      .is("deleted_at", null),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .in("status", ["published", "ongoing"])
      .is("deleted_at", null),
    supabase
      .from("contact_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread"),
    supabase
      .from("membership_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
  ]);

  return {
    memberCount: memberCount ?? 0,
    projectCount: projectCount ?? 0,
    eventCount: eventCount ?? 0,
    inquiryCount: inquiryCount ?? 0,
    applicationCount: applicationCount ?? 0,
  };
}
