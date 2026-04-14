import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/db/server";

/**
 * POST /api/setup/super-admin
 * Creates a super_admin for the FIRST user in the database
 * Only works if NO super_admin exists yet (one-time setup)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient() as any;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if any super_admin already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        error: "Super admin already exists. Use /admin/setup to manage roles.",
      }, { status: 409 });
    }

    // Find user by email
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email")
      .eq("email", email)
      .limit(1);

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({
        error: `No user found with email: ${email}. Please sign up first.`,
      }, { status: 404 });
    }

    const user = profiles[0];

    // Grant super_admin role
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: user.user_id, role: "super_admin", is_active: true });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${user.first_name} ${user.last_name} is now a Super Admin!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
