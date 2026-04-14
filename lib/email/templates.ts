// ============================================================
// EMAIL TEMPLATES & SENDING
// ============================================================

import { Resend } from "resend";
import { createServiceClient } from "@/lib/db/client";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@rotaract.org";
const CLUB_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Rotaract Club";

// ============================================================
// TEMPLATE RENDERING
// ============================================================

interface TemplateVars {
  [key: string]: string | number | boolean | null | undefined;
}

export async function getEmailTemplate(key: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("email_templates")
    .select("*")
    .eq("template_key", key)
    .eq("is_active", true)
    .single();
  return data;
}

export function renderTemplate(html: string, vars: TemplateVars): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value ?? ""));
  }
  return result;
}

// ============================================================
// EMAIL SENDING
// ============================================================

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  if (!resend) {
    console.warn("Resend not configured — email not sent:", { to, subject });
    return { id: null, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${CLUB_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html),
      reply_to: replyTo,
    });

    if (error) {
      console.error("Email send error:", error);
      return { id: null, error: error.message };
    }

    // Log the email
    await logEmail(to, subject, data?.id, "sent");

    return { id: data?.id, error: null };
  } catch (err: any) {
    console.error("Email send error:", err);
    return { id: null, error: err.message };
  }
}

// ============================================================
// TEMPLATE-BASED EMAIL SENDING
// ============================================================

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  vars: TemplateVars,
  replyTo?: string
) {
  const template = await getEmailTemplate(templateKey);
  if (!template) {
    return { id: null, error: `Template not found: ${templateKey}` };
  }

  const subject = renderTemplate(template.subject, vars);
  const html = renderTemplate(template.body_html, vars);
  const text = template.body_text ? renderTemplate(template.body_text, vars) : undefined;

  return sendEmail({ to, subject, html, text, replyTo });
}

// ============================================================
// SPECIFIC EMAIL FLOWS
// ============================================================

export async function sendContactAcknowledgment(data: {
  email: string;
  first_name: string;
  subject: string;
}) {
  return sendTemplateEmail("contact_acknowledgment", data.email, {
    first_name: data.first_name,
    club_name: CLUB_NAME,
  });
}

export async function sendContactAdminNotification(data: {
  admin_email: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return sendTemplateEmail("contact_admin_notification", data.admin_email, {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    subject: data.subject,
    message: data.message,
  });
}

export async function sendMembershipAcknowledgment(data: {
  email: string;
  first_name: string;
}) {
  return sendTemplateEmail("membership_acknowledgment", data.email, {
    first_name: data.first_name,
    club_name: CLUB_NAME,
  });
}

export async function sendEventRegistrationConfirmation(data: {
  email: string;
  first_name: string;
  event_title: string;
  event_date: string;
}) {
  return sendTemplateEmail("event_registration_confirmation", data.email, {
    first_name: data.first_name,
    event_title: data.event_title,
    event_date: data.event_date,
  });
}

export async function sendBookingConfirmation(data: {
  email: string;
  first_name: string;
  booking_type: string;
  booking_time: string;
}) {
  return sendTemplateEmail("booking_confirmation", data.email, {
    first_name: data.first_name,
    booking_type: data.booking_type,
    booking_time: data.booking_time,
  });
}

export async function sendWelcomeMember(data: {
  email: string;
  first_name: string;
}) {
  return sendTemplateEmail("welcome_member", data.email, {
    first_name: data.first_name,
    club_name: CLUB_NAME,
  });
}

// ============================================================
// EMAIL LOGGING
// ============================================================

async function logEmail(
  to: string,
  subject: string,
  externalId: string | null,
  status: string
) {
  const supabase = createServiceClient();
  await supabase.from("email_logs").insert({
    to_email: to,
    subject,
    template_key: null,
    external_id: externalId,
    status: status as any,
    sent_at: new Date().toISOString(),
  });
}

export async function logReminder(
  ruleId: string,
  entityType: string,
  entityId: string,
  recipientEmail: string,
  status: string
) {
  const supabase = createServiceClient();
  await supabase.from("reminder_logs").insert({
    reminder_rule_id: ruleId,
    entity_type: entityType,
    entity_id: entityId,
    recipient_email: recipientEmail,
    status: status as any,
    sent_at: new Date().toISOString(),
  });
}

// ============================================================
// UTILITIES
// ============================================================

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
