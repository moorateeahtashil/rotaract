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
        .select("user_id, status, join_date, classification, show_in_directory")
        .is("deleted_at", null),
    ]);

    const roleMap: Record<string, string[]> = {};
    (allRoles || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const memberMap: Record<string, any> = {};
    (members || []).forEach((m: any) => {
      memberMap[m.user_id] = m;
    });

    const result = (profiles || []).map((p: any) => {
      const m = memberMap[p.user_id];
      return {
        user_id: p.user_id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        roles: roleMap[p.user_id] || [],
        member_status: m?.status,
        join_date: m?.join_date ?? null,
        classification: m?.classification ?? null,
        show_in_directory: m?.show_in_directory ?? null,
        created_at: p.created_at,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/members
 * Update a member's name (profiles) + member details (members). Admin-only,
 * service role to bypass RLS. Fixes "Unknown Member" / wrong "member since".
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const service = createServiceRoleClient() as any;
    const { data: callerRoles } = await service
      .from("user_roles").select("role").eq("user_id", user.id).eq("is_active", true);
    if (!(callerRoles || []).some((r: any) => ["super_admin", "admin"].includes(r.role))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, first_name, last_name, classification, join_date, show_in_directory } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    if (first_name !== undefined || last_name !== undefined) {
      const profilePatch: any = { updated_at: new Date().toISOString() };
      if (first_name !== undefined) profilePatch.first_name = (first_name || "").trim();
      if (last_name !== undefined) profilePatch.last_name = (last_name || "").trim();
      const { error } = await service.from("profiles").update(profilePatch).eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const memberPatch: any = { updated_at: new Date().toISOString() };
    if (classification !== undefined) memberPatch.classification = classification?.trim() || null;
    if (join_date !== undefined) memberPatch.join_date = join_date || null;
    if (show_in_directory !== undefined) memberPatch.show_in_directory = !!show_in_directory;

    const { data: existing } = await service
      .from("members").select("id").eq("user_id", userId).maybeSingle();
    if (existing) {
      const { error } = await service.from("members").update(memberPatch).eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await service.from("members").insert({
        user_id: userId,
        status: "active",
        join_date: join_date || new Date().toISOString().split("T")[0],
        classification: classification?.trim() || null,
        show_in_directory: show_in_directory === undefined ? true : !!show_in_directory,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
