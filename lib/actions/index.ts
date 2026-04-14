// ============================================================
// SERVER ACTIONS — All CRUD operations
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/db/server";
import { requireAuth, requireAdmin } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";

// ============================================================
// CONTACT INQUIRY
// ============================================================

export async function submitContactInquiry(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiry_type?: string;
}) {
  try {
    const supabase = createServiceRoleClient() as any;

    const { error } = await supabase.from("contact_inquiries").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      inquiry_type: data.inquiry_type || "general",
      status: "unread",
    });

    if (error) {
      console.error("Contact inquiry error:", error);
      return { success: false, error: error.message };
    }

    // TODO: Send email notification to admin
    // TODO: Send acknowledgment email to user

    return { success: true };
  } catch (err: any) {
    console.error("Contact inquiry error:", err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// MEMBERSHIP APPLICATION
// ============================================================

export async function submitMembershipApplication(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: Date;
  occupation?: string;
  company?: string;
  education?: string;
  why_join: string;
  how_heard?: string;
  social_links?: Record<string, string>;
}) {
  try {
    const supabase = createServiceRoleClient() as any;

    const { error } = await supabase.from("membership_applications").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth?.toISOString().split("T")[0] || null,
      occupation: data.occupation || null,
      company: data.company || null,
      education: data.education || null,
      why_join: data.why_join,
      how_heard: data.how_heard || null,
      social_links: data.social_links || null,
      status: "submitted",
    });

    if (error) {
      console.error("Membership application error:", error);
      return { success: false, error: error.message };
    }

    // TODO: Send email notification to membership director
    // TODO: Send confirmation email to applicant

    return { success: true };
  } catch (err: any) {
    console.error("Membership application error:", err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// EVENT REGISTRATION
// ============================================================

export async function registerForEvent(eventId: string, memberId: string) {
  const guard = await requireAuth("/login");
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;

    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      member_id: memberId,
      status: "registered",
    });

    if (error) {
      console.error("Event registration error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/events");
    revalidatePath("/member/events");
    return { success: true };
  } catch (err: any) {
    console.error("Event registration error:", err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// BOOKING
// ============================================================

export async function createBooking(data: {
  booking_type_id: string;
  slot_id?: string;
  member_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}) {
  const guard = await requireAuth("/login");
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;

    const { error } = await supabase.from("bookings").insert({
      booking_type_id: data.booking_type_id,
      slot_id: data.slot_id || null,
      member_id: data.member_id,
      start_time: data.start_time,
      end_time: data.end_time,
      status: "pending",
      notes: data.notes || null,
    });

    if (error) {
      console.error("Booking error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/member/bookings");
    return { success: true };
  } catch (err: any) {
    console.error("Booking error:", err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — PROJECT CRUD
// ============================================================

export async function createProject(formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { userId } = guard;

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);
    const description = formData.get("description") as string;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        title,
        slug,
        subtitle: formData.get("subtitle") as string || null,
        description,
        long_description: (formData.get("long_description") as string) || null,
        avenue_id: (formData.get("avenue_id") as string) || null,
        committee_id: (formData.get("committee_id") as string) || null,
        status: (formData.get("status") as any) || "planned",
        start_date: (formData.get("start_date") as string) || null,
        end_date: (formData.get("end_date") as string) || null,
        location: (formData.get("location") as string) || null,
        location_url: (formData.get("location_url") as string) || null,
        budget_amount: formData.get("budget_amount") ? parseFloat(formData.get("budget_amount") as string) : null,
        is_featured: formData.get("is_featured") === "on",
        is_published: formData.get("is_published") === "on",
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        seo_keywords: (formData.get("seo_keywords") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Create project error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true, data: project };
  } catch (err: any) {
    console.error("Create project error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateProject(id: string, formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        slug,
        subtitle: formData.get("subtitle") as string || null,
        description: formData.get("description") as string,
        long_description: (formData.get("long_description") as string) || null,
        avenue_id: (formData.get("avenue_id") as string) || null,
        committee_id: (formData.get("committee_id") as string) || null,
        status: (formData.get("status") as any) || "planned",
        start_date: (formData.get("start_date") as string) || null,
        end_date: (formData.get("end_date") as string) || null,
        location: (formData.get("location") as string) || null,
        location_url: (formData.get("location_url") as string) || null,
        budget_amount: formData.get("budget_amount") ? parseFloat(formData.get("budget_amount") as string) : null,
        is_featured: formData.get("is_featured") === "on",
        is_published: formData.get("is_published") === "on",
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        seo_keywords: (formData.get("seo_keywords") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Update project error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error("Update project error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteProject(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString(), deleted_by: guard.userId })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — EVENT CRUD
// ============================================================

export async function createEvent(formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { userId } = guard;

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);
    const date = formData.get("date") as string;

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        slug,
        description: formData.get("description") as string,
        long_description: (formData.get("long_description") as string) || null,
        event_type: (formData.get("event_type") as string) || null,
        avenue_id: (formData.get("avenue_id") as string) || null,
        project_id: (formData.get("project_id") as string) || null,
        date,
        end_date: (formData.get("end_date") as string) || null,
        location: (formData.get("location") as string) || null,
        location_url: (formData.get("location_url") as string) || null,
        map_embed_url: (formData.get("map_embed_url") as string) || null,
        capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
        registration_open: formData.get("registration_open") === "on",
        registration_opens_at: (formData.get("registration_opens_at") as string) || null,
        registration_deadline: (formData.get("registration_deadline") as string) || null,
        registration_fee: formData.get("registration_fee") ? parseFloat(formData.get("registration_fee") as string) : null,
        image_url: (formData.get("image_url") as string) || null,
        is_featured: formData.get("is_featured") === "on",
        status: (formData.get("status") as any) || "draft",
        is_public: formData.get("is_public") !== "off",
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Create event error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, data: event };
  } catch (err: any) {
    console.error("Create event error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);
    const date = formData.get("date") as string;

    const { error } = await supabase
      .from("events")
      .update({
        title,
        slug,
        description: formData.get("description") as string,
        long_description: (formData.get("long_description") as string) || null,
        event_type: (formData.get("event_type") as string) || null,
        avenue_id: (formData.get("avenue_id") as string) || null,
        project_id: (formData.get("project_id") as string) || null,
        date,
        end_date: (formData.get("end_date") as string) || null,
        location: (formData.get("location") as string) || null,
        location_url: (formData.get("location_url") as string) || null,
        map_embed_url: (formData.get("map_embed_url") as string) || null,
        capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
        registration_open: formData.get("registration_open") === "on",
        registration_opens_at: (formData.get("registration_opens_at") as string) || null,
        registration_deadline: (formData.get("registration_deadline") as string) || null,
        registration_fee: formData.get("registration_fee") ? parseFloat(formData.get("registration_fee") as string) : null,
        image_url: (formData.get("image_url") as string) || null,
        is_featured: formData.get("is_featured") === "on",
        status: (formData.get("status") as any) || "draft",
        is_public: formData.get("is_public") !== "off",
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/events");
    revalidatePath(`/events/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEvent(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString(), deleted_by: guard.userId })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — POST/BLOG CRUD
// ============================================================

export async function createPost(formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { userId } = guard;

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);
    const publishedAt = formData.get("published_at") as string;

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        slug,
        content: formData.get("content") as string,
        excerpt: (formData.get("excerpt") as string) || null,
        featured_image: (formData.get("featured_image") as string) || null,
        category_id: (formData.get("category_id") as string) || null,
        status: (formData.get("status") as any) || "draft",
        is_featured: formData.get("is_featured") === "on",
        is_published: formData.get("is_published") === "on",
        published_at: publishedAt || null,
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
        author_id: userId,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true, data: post };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePost(id: string, formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string || slugify(title);
    const publishedAt = formData.get("published_at") as string;

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        content: formData.get("content") as string,
        excerpt: (formData.get("excerpt") as string) || null,
        featured_image: (formData.get("featured_image") as string) || null,
        category_id: (formData.get("category_id") as string) || null,
        status: (formData.get("status") as any) || "draft",
        is_featured: formData.get("is_featured") === "on",
        is_published: formData.get("is_published") === "on",
        published_at: publishedAt || null,
        seo_title: (formData.get("seo_title") as string) || null,
        seo_description: (formData.get("seo_description") as string) || null,
        og_image_url: (formData.get("og_image_url") as string) || null,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/news");
    revalidatePath(`/news/${slug}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePost(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString(), deleted_by: guard.userId })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — SITE SETTINGS
// ============================================================

export async function updateSiteSettings(settings: Record<string, string>) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_by: guard.userId,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(update, { onConflict: "key" });
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — HOMEPAGE SECTIONS
// ============================================================

export async function updateHomepageSection(id: string, data: {
  title?: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  cta_label?: string;
  cta_href?: string;
  secondary_cta_label?: string;
  secondary_cta_href?: string;
  sort_order?: number;
  is_visible?: boolean;
  is_enabled?: boolean;
}) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("homepage_sections")
      .update(data)
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — NAVIGATION
// ============================================================

export async function updateNavigation(id: string, data: {
  label?: string;
  href?: string;
  sort_order?: number;
  is_visible?: boolean;
  requires_auth?: boolean;
  required_role?: string;
  icon_key?: string;
  mobile_only?: boolean;
  desktop_only?: boolean;
}) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("navigation_items")
      .update(data)
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/navigation");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createNavigation(data: {
  menu_key: string;
  label: string;
  href: string;
  sort_order?: number;
  is_visible?: boolean;
  requires_auth?: boolean;
  icon_key?: string;
}) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase.from("navigation_items").insert({
      menu_key: data.menu_key,
      label: data.label,
      href: data.href,
      sort_order: data.sort_order ?? 0,
      is_visible: data.is_visible ?? true,
      requires_auth: data.requires_auth ?? false,
      icon_key: data.icon_key ?? null,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/navigation");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteNavigation(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("navigation_items")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/navigation");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — BOARD MEMBER CRUD
// ============================================================

export async function createBoardMember(formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;

    const termStart = formData.get("term_start") as string;

    const { data, error } = await supabase
      .from("board_members")
      .insert({
        member_id: formData.get("member_id") as string,
        position_id: formData.get("position_id") as string,
        custom_title: (formData.get("custom_title") as string) || null,
        photo_url: (formData.get("photo_url") as string) || null,
        term_start: termStart,
        term_end: (formData.get("term_end") as string) || null,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        is_visible: formData.get("is_visible") !== "off",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/board");
    revalidatePath("/leadership");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBoardMember(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("board_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/board");
    revalidatePath("/leadership");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — AVENUE CRUD
// ============================================================

export async function createAvenue(formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || slugify(name);

    const { data, error } = await supabase
      .from("avenues")
      .insert({
        name,
        slug,
        description: formData.get("description") as string,
        long_description: (formData.get("long_description") as string) || null,
        icon_key: (formData.get("icon_key") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
        color_hex: (formData.get("color_hex") as string) || null,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        is_active: formData.get("is_active") !== "off",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/avenues");
    revalidatePath("/avenues-of-service");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAvenue(id: string, formData: FormData) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || slugify(name);

    const { error } = await supabase
      .from("avenues")
      .update({
        name,
        slug,
        description: formData.get("description") as string,
        long_description: (formData.get("long_description") as string) || null,
        icon_key: (formData.get("icon_key") as string) || null,
        image_url: (formData.get("image_url") as string) || null,
        color_hex: (formData.get("color_hex") as string) || null,
        sort_order: parseInt(formData.get("sort_order") as string) || 0,
        is_active: formData.get("is_active") !== "off",
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/avenues");
    revalidatePath("/avenues-of-service");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAvenue(id: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("avenues")
      .update({ deleted_at: new Date().toISOString(), deleted_by: guard.userId })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/avenues");
    revalidatePath("/avenues-of-service");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — UPDATE INQUIRY STATUS
// ============================================================

export async function updateInquiryStatus(id: string, status: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// ADMIN — UPDATE APPLICATION STATUS
// ============================================================

export async function updateApplicationStatus(id: string, status: string) {
  const guard = await requireAdmin();
  if ("redirect" in guard) return guard;

  try {
    const supabase = createServiceRoleClient() as any;
    const { error } = await supabase
      .from("membership_applications")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
