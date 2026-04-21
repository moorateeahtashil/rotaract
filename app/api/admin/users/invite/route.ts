import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const adminRoles = ["super_admin", "admin", "president", "secretary", "membership_director"];
    const isAdmin = roles?.some((r: any) => adminRoles.includes(r.role));

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { first_name, last_name, email, role = "member" } = await req.json();

    if (!email || !first_name || !last_name) {
      return NextResponse.json({ error: "first_name, last_name, and email are required" }, { status: 400 });
    }

    // Use service role client to bypass RLS for admin operations
    const adminSupabase = createServiceRoleClient() as any;

    // Invite user via Supabase Auth (uses Brevo SMTP configured in Supabase dashboard)
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { first_name, last_name },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      }
    );

    if (inviteError) {
      // If user already exists, just assign the role
      if (inviteError.message?.includes("already been registered")) {
        const { data: existingProfile } = await adminSupabase
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .single();

        if (existingProfile) {
          await adminSupabase.from("user_roles").upsert(
            { user_id: existingProfile.user_id, role, is_active: true },
            { onConflict: "user_id,role" }
          );
          return NextResponse.json({ success: true, message: "Role assigned to existing user" });
        }
      }
      throw inviteError;
    }

    const newUserId = inviteData.user?.id;
    if (!newUserId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Assign role
    await adminSupabase.from("user_roles").insert({
      user_id: newUserId,
      role,
      is_active: true,
    });

    // If role is member or higher, create member record
    if (role !== "applicant" && role !== "prospective_member") {
      await adminSupabase.from("members").upsert(
        {
          user_id: newUserId,
          join_date: new Date().toISOString().split("T")[0],
          status: "active",
        },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully" });
  } catch (error: any) {
    console.error("Invite user error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
