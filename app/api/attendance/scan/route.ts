import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import { canAccessMemberPortal } from "@/lib/auth/roles";

/**
 * POST /api/attendance/scan
 * Marks attendance for a member at an event using a QR code token.
 * Allowed for any portal user (members AND prospective_members). If a
 * prospective member has no members row yet, one is auto-provisioned
 * (their role is unchanged — the members table is separate from roles).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient() as any;
    const service = createServiceRoleClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gate: only portal users (members / prospective members / board / admin).
    const { data: roleRows } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("is_active", true);
    const roleNames = (roleRows || []).map((r: any) => r.role);
    if (!canAccessMemberPortal(roleNames)) {
      return NextResponse.json(
        { error: "Your account does not have member portal access yet." },
        { status: 403 }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get member ID — auto-provision a members row if one doesn't exist yet
    // (e.g. for a prospective member attending their first event).
    let { data: member } = await service
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      const { data: created, error: createErr } = await service
        .from("members")
        .insert({
          user_id: user.id,
          join_date: new Date().toISOString().split("T")[0],
          status: "active",
          show_in_directory: false, // auto-provisioned for attendance; not a public listing
        })
        .select("id")
        .single();
      if (createErr || !created) {
        return NextResponse.json(
          { error: "Could not set up your attendance profile. Please contact an admin." },
          { status: 500 }
        );
      }
      member = created;
    }

    // Find the QR code
    const { data: qrCode, error: qrError } = await service
      .from("event_qr_codes")
      .select("id, event_id, expires_at, is_active, events!inner(title, date, end_date, status)")
      .eq("token", token)
      .single();

    if (qrError || !qrCode) {
      return NextResponse.json({ error: "Invalid QR code. Please check the code and try again." }, { status: 404 });
    }

    const qr = qrCode as any;

    if (!qr.is_active) {
      return NextResponse.json({ error: "This QR code is no longer active." }, { status: 410 });
    }

    if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
      return NextResponse.json({ error: "This QR code has expired." }, { status: 410 });
    }

    // Reject if the event has ended (status, or its end/date has passed).
    const ev = qr.events || {};
    const now = new Date();
    const endsAt = ev.end_date ? new Date(ev.end_date) : null;
    // No explicit end time → allow check-in through the end of the event day.
    const dayEnd = ev.date ? new Date(new Date(ev.date).setHours(23, 59, 59, 999)) : null;
    const ended =
      ev.status === "completed" ||
      ev.status === "cancelled" ||
      (endsAt ? endsAt < now : dayEnd ? dayEnd < now : false);
    if (ended) {
      return NextResponse.json(
        { error: "This event has ended — attendance is closed.", eventTitle: ev.title },
        { status: 410 }
      );
    }

    // Check if member already scanned for this event
    const { data: existingScan } = await service
      .from("attendance_scan_logs")
      .select("id")
      .eq("event_id", qr.event_id)
      .eq("member_id", member.id)
      .maybeSingle();

    if (existingScan) {
      return NextResponse.json({
        error: "You have already marked attendance for this event.",
        eventTitle: qr.events?.title,
      }, { status: 409 });
    }

    // Record attendance
    const { error: insertError } = await service
      .from("attendance_scan_logs")
      .insert({
        event_id: qr.event_id,
        member_id: member.id,
        qr_code_id: qr.id,
        status: "success",
      });

    if (insertError) {
      console.error("Attendance insert error:", insertError);
      return NextResponse.json({ error: "Failed to record attendance. Please try again." }, { status: 500 });
    }

    // Update member's total events count
    await service.rpc("increment_member_events", { p_member_id: member.id }).catch(() => {
      // Non-critical — ignore if function doesn't exist
    });

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
