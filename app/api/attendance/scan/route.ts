import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { cookies } from "next/headers";

/**
 * POST /api/attendance/scan
 * Marks attendance for a member at an event using a QR code token
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient(cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get member ID
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
    }

    // Find the QR code
    const { data: qrCode, error: qrError } = await supabase
      .from("event_qr_codes")
      .select("id, event_id, expires_at, is_active, events!inner(title)")
      .eq("token", token)
      .single();

    if (qrError || !qrCode) {
      return NextResponse.json({ error: "Invalid QR code token" }, { status: 404 });
    }

    const qr = qrCode as any;

    // Check if QR code is active and not expired
    if (!qr.is_active) {
      return NextResponse.json({ error: "This QR code is no longer active" }, { status: 410 });
    }

    if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
      return NextResponse.json({ error: "This QR code has expired" }, { status: 410 });
    }

    // Check if member already scanned for this event
    const { data: existingScan } = await supabase
      .from("attendance_scan_logs")
      .select("id")
      .eq("event_id", qr.event_id)
      .eq("member_id", member.id)
      .single();

    if (existingScan) {
      return NextResponse.json({ 
        error: "You have already marked attendance for this event",
        eventTitle: qr.events?.title 
      }, { status: 409 });
    }

    // Record attendance
    const { error: insertError } = await supabase
      .from("attendance_scan_logs")
      .insert({
        event_id: qr.event_id,
        member_id: member.id,
        qr_code_id: qr.id,
        status: "success",
      });

    if (insertError) {
      return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
    }

    // Also update attendance_records
    await supabase
      .from("attendance_records")
      .upsert({
        member_id: member.id,
        event_id: qr.event_id,
        date: new Date().toISOString().split("T")[0],
        status: "present",
      }, { onConflict: "member_id,event_id" });

    return NextResponse.json({
      success: true,
      message: `Attendance marked for "${qr.events?.title}"`,
      eventTitle: qr.events?.title,
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
