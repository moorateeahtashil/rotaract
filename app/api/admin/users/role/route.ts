import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/server";
import { cookies } from "next/headers";

const ADMIN_ROLES = [
  "super_admin", "admin", "president", "secretary",
  "public_image_director", "membership_director",
  "project_director", "event_manager", "board_member",
  "member", "applicant"
];

/**
 * POST /api/admin/users/role
 * Assign or update a user's role
 * Requires: super_admin or admin role
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const cookieStore = cookies();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    const { data: currentRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("role", { ascending: true })
      .limit(1)
      .single();

    if (!currentRole || !["super_admin", "admin"].includes(currentRole.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Upsert the role
    const { error } = await supabase
      .from("user_roles")
      .upsert(
        { user_id: userId, role, is_active: true },
        { onConflict: "user_id,role" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Role "${role}" assigned successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/users/role?search=xxx
 * List all users with their roles
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Get all profiles with their highest role
    let query = supabase
      .from("profiles")
      .select("id, user_id, first_name, last_name, email, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: profiles, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get roles for each user
    const usersWithRoles = await Promise.all(
      profiles.map(async (profile) => {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role, is_active")
          .eq("user_id", profile.user_id)
          .eq("is_active", true);

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          roles: roles?.map(r => r.role) || [],
          highestRole: roles?.[0]?.role || "public",
        };
      })
    );

    return NextResponse.json(usersWithRoles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
