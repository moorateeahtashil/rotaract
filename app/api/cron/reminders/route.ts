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
          member:members(id, user_id)
        )
      `
      )
      .gte("date", new Date().toISOString())
      .lte("date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .in("status", ["published", "ongoing"])
      .is("deleted_at", null);

    // Resolve profiles manually (members→profiles embed doesn't resolve).
    const regUserIds = (upcomingEvents || [])
      .flatMap((e: any) => (e.registrations || []).map((r: any) => r.member?.user_id))
      .filter(Boolean);
    const profileByUser = new Map<string, any>();
    if (regUserIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id, first_name, last_name, email").in("user_id", regUserIds);
      for (const p of profs || []) profileByUser.set(p.user_id, p);
    }

    if (upcomingEvents) {
      for (const event of upcomingEvents) {
        if (!event.registrations) continue;

        for (const reg of event.registrations) {
          const profile = profileByUser.get(reg.member?.user_id);
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
