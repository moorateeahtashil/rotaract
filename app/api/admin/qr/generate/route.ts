import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/server";
import { requireRole } from "@/lib/auth/session";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * POST /api/admin/qr/generate
 * Generates a new QR code token for an event
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    await requireRole(["super_admin", "admin", "president", "secretary", "event_manager"]);

    const { eventSlug, expiryHours = 24 } = await req.json();

    if (!eventSlug) {
      return NextResponse.json({ error: "Event slug is required" }, { status: 400 });
    }

    const supabase = await createServiceClient(cookies());

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title")
      .eq("slug", eventSlug)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generate unique token
    const token = `evt-${crypto.randomBytes(8).toString("hex")}`;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    // Create QR code record
    const { data: qrCode, error: insertError } = await supabase
      .from("event_qr_codes")
      .insert({
        event_id: event.id,
        token,
        qr_data: token,
        expires_at: expiresAt,
        is_active: true,
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
    
    if (error.message?.includes("role")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
