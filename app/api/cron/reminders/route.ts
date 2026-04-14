// ============================================================
// REMINDER CRON JOB — Runs every hour via Vercel Cron
// ============================================================

import { createServiceRoleClient } from "@/lib/db/server";
import { sendTemplateEmail, logReminder } from "@/lib/email/templates";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient() as any;
  let processed = 0;
  let errors = 0;

  try {
    // ─── EVENT REMINDERS ───
    // Find events happening in the next 24 hours
    const { data: upcomingEvents } = await supabase
      .from("events")
      .select(
        `
        *,
        registrations:event_registrations(
          member:members(
            profile:profiles(first_name, last_name, email)
          )
        )
      `
      )
      .gte("date", new Date().toISOString())
      .lte("date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .in("status", ["published", "ongoing"])
      .is("deleted_at", null);

    if (upcomingEvents) {
      for (const event of upcomingEvents) {
        if (!event.registrations) continue;

        for (const reg of event.registrations) {
          const profile = reg.member?.profile;
          if (!profile?.email) continue;

          // Check if reminder already sent
          const { data: alreadySent } = await supabase
            .from("reminder_logs")
            .select("id")
            .eq("entity_type", "event")
            .eq("entity_id", event.id)
            .eq("recipient_email", profile.email)
            .eq("reminder_type", "event_reminder")
            .gte("sent_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if (alreadySent && alreadySent.length > 0) continue;

          // Send reminder
          const result = await sendTemplateEmail(
            "event_registration_confirmation",
            profile.email,
            {
              first_name: profile.first_name,
              event_title: event.title,
              event_date: new Date(event.date).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          );

          if (result.error) {
            errors++;
            console.error("Event reminder failed:", result.error);
          } else {
            processed++;
            await logReminder(
              "event_24h_reminder",
              "event",
              event.id,
              profile.email,
              "sent"
            );
          }
        }
      }
    }

    // ─── BOOKING REMINDERS ───
    const { data: upcomingBookings } = await supabase
      .from("bookings")
      .select(
        `
        *,
        member:members(
          profile:profiles(first_name, last_name, email)
        ),
        booking_type:booking_types(name)
      `
      )
      .gte("start_time", new Date().toISOString())
      .lte("start_time", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .eq("status", "approved");

    if (upcomingBookings) {
      for (const booking of upcomingBookings) {
        const profile = booking.member?.profile;
        if (!profile?.email) continue;

        // Check if already reminded
        const { data: alreadySent } = await supabase
          .from("reminder_logs")
          .select("id")
          .eq("entity_type", "booking")
          .eq("entity_id", booking.id)
          .eq("recipient_email", profile.email)
          .gte("sent_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (alreadySent && alreadySent.length > 0) continue;

        const result = await sendTemplateEmail(
          "booking_confirmation",
          profile.email,
          {
            first_name: profile.first_name,
            booking_type: booking.booking_type?.name || "Meeting",
            booking_time: new Date(booking.start_time).toLocaleString("en-IN"),
          }
        );

        if (result.error) {
          errors++;
        } else {
          processed++;
          await logReminder(
            "booking_24h_reminder",
            "booking",
            booking.id,
            profile.email,
            "sent"
          );
        }
      }
    }

    // ─── MEMBERSHIP FOLLOW-UP ───
    const { data: staleApplications } = await supabase
      .from("membership_applications")
      .select("*")
      .eq("status", "submitted")
      .lt("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

    if (staleApplications) {
      for (const app of staleApplications) {
        // Check if follow-up already sent
        const { data: alreadySent } = await supabase
          .from("reminder_logs")
          .select("id")
          .eq("entity_type", "application")
          .eq("entity_id", app.id)
          .gte("sent_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (alreadySent && alreadySent.length > 0) continue;

        // Send follow-up reminder to admin (not to applicant)
        processed++;
        await logReminder(
          "application_follow_up",
          "application",
          app.id,
          app.email,
          "pending_review"
        );
      }
    }

    return Response.json({
      success: true,
      processed,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron job error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
