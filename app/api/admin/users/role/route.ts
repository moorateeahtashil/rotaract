import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import { cookies } from "next/headers";
import { ROLE_HIERARCHY, highestRoleLevel } from "@/lib/auth/roles";

const ADMIN_ROLES = [
  "super_admin", "admin", "normal", "president", "secretary",
  "public_image_director", "membership_director",
  "project_director", "event_manager", "board_member",
  "member", "prospective_member", "applicant"
];

/**
 * POST /api/admin/users/role
 * Assign or update a user's role
 * Requires: super_admin or admin role
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient() as any;
    const service = createServiceRoleClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin (service role bypasses RLS)
    const { data: adminRoles } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const callerRoleNames = (adminRoles || []).map((r: any) => r.role);
    const isAdmin = callerRoleNames.some((r: string) => ["super_admin", "admin"].includes(r));
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const isSuperAdmin = callerRoleNames.includes("super_admin");

    const { userId, role, deactivateRoles, ensureMemberRecord } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // ── Prevent privilege escalation ──
    // 1) Cannot assign a role more privileged than the caller's own highest.
    const callerLevel = highestRoleLevel(callerRoleNames);
    const targetLevel = ROLE_HIERARCHY[role] ?? ROLE_HIERARCHY.public;
    if (targetLevel < callerLevel) {
      return NextResponse.json({ error: "You cannot assign a role higher than your own." }, { status: 403 });
    }
    // 2) Only a super admin may grant or revoke super_admin.
    const touchesSuper = role === "super_admin" || (Array.isArray(deactivateRoles) && deactivateRoles.includes("super_admin"));
    if (touchesSuper && !isSuperAdmin) {
      return NextResponse.json({ error: "Only a Super Admin can manage the Super Admin role." }, { status: 403 });
    }
    // 3) Never remove the last active super admin (avoids locking everyone out).
    if (Array.isArray(deactivateRoles) && deactivateRoles.includes("super_admin")) {
      const { count } = await service
        .from("user_roles").select("*", { count: "exact", head: true })
        .eq("role", "super_admin").eq("is_active", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "You cannot remove the last Super Admin." }, { status: 403 });
      }
    }

    // Deactivate old conflicting roles first (e.g. old system role before assigning new one)
    if (Array.isArray(deactivateRoles) && deactivateRoles.length > 0) {
      await service
        .from("user_roles")
        .update({ is_active: false })
        .eq("user_id", userId)
        .in("role", deactivateRoles);
    }

    // Upsert the new role
    const { error } = await service
      .from("user_roles")
      .upsert(
        { user_id: userId, role, is_active: true },
        { onConflict: "user_id,role" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally create/activate the members row (used when approving an
    // applicant into a full member). Done server-side with the service role
    // because RLS forbids browser writes to members/user_roles.
    if (ensureMemberRecord) {
      const { data: existingMember } = await service
        .from("members")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingMember) {
        await service.from("members").insert({
          user_id: userId,
          join_date: new Date().toISOString().split("T")[0],
          status: "active",
        });
      } else {
        await service
          .from("members")
          .update({ status: "active", deleted_at: null })
          .eq("user_id", userId);
      }
    }

    return NextResponse.json({ success: true, message: `Role "${role}" assigned successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/role
 * Deactivate specific roles for a user (used when setting "no system role")
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient() as any;
    const service = createServiceRoleClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRoles } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const isAdmin = (adminRoles || []).some((r: any) => ["super_admin", "admin"].includes(r.role));
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, roles } = await req.json();
    if (!userId || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: "userId and roles[] are required" }, { status: 400 });
    }

    const { error } = await service
      .from("user_roles")
      .update({ is_active: false })
      .eq("user_id", userId)
      .in("role", roles);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
    const supabase = await createServerClient() as any;
    const service = createServiceRoleClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Authorize requester
    const { data: adminRoles } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const isAdmin = (adminRoles || []).some((r: any) => ["super_admin", "admin"].includes(r.role));
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Get all profiles with their highest role
    let query = service
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
      profiles.map(async (profile: any) => {
        const { data: roles } = await service
          .from("user_roles")
          .select("role, is_active")
          .eq("user_id", profile.user_id)
          .eq("is_active", true);

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          roles: roles?.map((r: any) => r.role) || [],
          highestRole: roles?.[0]?.role || "public",
        };
      })
    );

    return NextResponse.json(usersWithRoles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
