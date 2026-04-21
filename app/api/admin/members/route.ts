import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";

/**
 * GET /api/admin/members
 * Returns all profiles with their active roles and member status.
 * Uses service role to bypass RLS on user_roles.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceRoleClient() as any;

    // Verify requester is admin
    const { data: callerRoles } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const isAdmin = (callerRoles || []).some((r: any) =>
      ["super_admin", "admin"].includes(r.role)
    );
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Fetch profiles, roles, and member status in 3 queries
    const [{ data: profiles }, { data: allRoles }, { data: members }] = await Promise.all([
      service
        .from("profiles")
        .select("user_id, first_name, last_name, email, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      service
        .from("user_roles")
        .select("user_id, role")
        .eq("is_active", true),
      service
        .from("members")
        .select("user_id, status")
        .is("deleted_at", null),
    ]);

    const roleMap: Record<string, string[]> = {};
    (allRoles || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const memberMap: Record<string, string> = {};
    (members || []).forEach((m: any) => {
      memberMap[m.user_id] = m.status;
    });

    const result = (profiles || []).map((p: any) => ({
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      roles: roleMap[p.user_id] || [],
      member_status: memberMap[p.user_id],
      created_at: p.created_at,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
