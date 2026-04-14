import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import crypto from "crypto";

const ADMIN_ROLES = ["super_admin", "admin", "president", "secretary", "event_manager"];

/**
 * POST /api/admin/qr/generate
 * Generates a new QR code token for an event (admin only)
 */
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

    const isAdmin = roles?.some((r: any) => ADMIN_ROLES.includes(r.role));
    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { eventSlug, expiryHours = 24 } = await req.json();

    if (!eventSlug) {
      return NextResponse.json({ error: "Event slug is required" }, { status: 400 });
    }

    // Use service role to bypass RLS
    const adminSupabase = createServiceRoleClient() as any;

    // Verify event exists
    const { data: event, error: eventError } = await adminSupabase
      .from("events")
      .select("id, title")
      .eq("slug", eventSlug)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Deactivate existing QR codes for this event
    await adminSupabase
      .from("event_qr_codes")
      .update({ is_active: false })
      .eq("event_id", event.id);

    // Generate unique token
    const token = `evt-${crypto.randomBytes(8).toString("hex")}`;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    // Get creator's profile id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Create QR code record
    const { data: qrCode, error: insertError } = await adminSupabase
      .from("event_qr_codes")
      .insert({
        event_id: event.id,
        token,
        qr_data: token,
        expires_at: expiresAt,
        is_active: true,
        created_by: (profile as any)?.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create QR code:", insertError);
      return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }

    return NextResponse.json({
      id: qrCode.id,
      token: qrCode.token,
      qr_data: qrCode.qr_data,
      expires_at: expiresAt,
      eventTitle: event.title,
    });
  } catch (error: any) {
    console.error("QR generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
