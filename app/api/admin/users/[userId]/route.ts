import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";

/**
 * PATCH /api/admin/users/[userId]
 * Admin sets a user's password directly (NO email — instant reset).
 * Useful when email delivery is slow/unavailable. Admin shares the new
 * password with the user, who can change it later from their profile.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const service = createServiceRoleClient() as any;

    const { data: adminRoles } = await service
      .from("user_roles").select("role").eq("user_id", user.id).eq("is_active", true);
    const isSuperAdmin = adminRoles?.some((r: any) => r.role === "super_admin");
    const isAdmin = adminRoles?.some((r: any) => ["super_admin", "admin"].includes(r.role));
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId } = await params;
    const { password } = await req.json();

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Only a super admin may reset another super admin's password.
    if (!isSuperAdmin) {
      const { data: targetRoles } = await service
        .from("user_roles").select("role").eq("user_id", userId).eq("is_active", true);
      if (targetRoles?.some((r: any) => r.role === "super_admin")) {
        return NextResponse.json({ error: "Only a Super Admin can reset another Super Admin's password" }, { status: 403 });
      }
    }

    const { error } = await service.auth.admin.updateUserById(userId, { password });
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error: any) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceRoleClient() as any;

    // Only super_admin can delete users
    const { data: adminRoles } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const isSuperAdmin = adminRoles?.some((r: any) => r.role === "super_admin");
    const isAdmin = adminRoles?.some((r: any) => ["super_admin", "admin"].includes(r.role));

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId } = await params;

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Prevent non-super-admins from deleting super_admins
    if (!isSuperAdmin) {
      const { data: targetRoles } = await service
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("is_active", true);

      const targetIsSuperAdmin = targetRoles?.some((r: any) => r.role === "super_admin");
      if (targetIsSuperAdmin) {
        return NextResponse.json({ error: "Only a Super Admin can delete another Super Admin" }, { status: 403 });
      }
    }

    // Delete the auth user — cascades to profiles, user_roles, members via FK
    const { error: deleteError } = await service.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
