import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";

async function sendViaBrevo(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.NEXT_PUBLIC_SITE_NAME || "Rotaract Club";

  if (!apiKey || !fromEmail) {
    return { error: `Brevo not configured — apiKey:${!!apiKey} fromEmail:${!!fromEmail}` };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: err.message || "Brevo send failed" };
  }

  return { error: null };
}

function buildInviteHtml(firstName: string, clubName: string, actionLink: string, year: number) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>You're Invited</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Open Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <span style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#17458f;">
              &#9670; ${clubName} &#9670;
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#17458f 0%,#0067c8 100%);padding:48px 40px 40px;text-align:center;">
                  <div style="width:56px;height:56px;background:rgba(247,168,27,0.2);border:2px solid #f7a81b;border-radius:50%;margin:0 auto 20px;">
                    <span style="font-size:24px;line-height:56px;display:block;">✉</span>
                  </div>
                  <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;">You're Invited!</h1>
                  <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">Join the ${clubName} Member Portal</p>
                </td>
              </tr>
              <tr><td style="background:#f7a81b;height:3px;"></td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 20px;font-size:16px;color:#54565a;line-height:1.6;">
                    Hi <strong style="color:#17458f;">${firstName}</strong>,
                  </p>
                  <p style="margin:0 0 16px;font-size:15px;color:#54565a;line-height:1.7;">
                    An admin has invited you to join the <strong>${clubName}</strong> member portal — your hub for club events, announcements, resources, and more.
                  </p>
                  <p style="margin:0 0 32px;font-size:15px;color:#54565a;line-height:1.7;">
                    Click below to set your password and activate your account.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                    <tr>
                      <td style="background:#17458f;border-radius:8px;box-shadow:0 4px 12px rgba(23,69,143,0.3);">
                        <a href="${actionLink}" style="display:inline-block;padding:16px 40px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;border-radius:8px;">
                          Accept Invitation &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#f0f4fb;border-left:3px solid #17458f;border-radius:0 6px 6px 0;padding:14px 16px;">
                        <p style="margin:0;font-size:13px;color:#54565a;line-height:1.6;">
                          &#128274; This link expires in <strong>24 hours</strong>. If it expires, contact your admin for a new invitation.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <hr style="border:none;border-top:1px solid #e8e8e8;margin:32px 0 24px;"/>
                  <p style="margin:0 0 6px;font-size:12px;color:#898a8d;">If the button doesn't work, paste this link in your browser:</p>
                  <p style="margin:0;font-size:11px;word-break:break-all;">
                    <a href="${actionLink}" style="color:#0067c8;text-decoration:none;">${actionLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:28px 16px 0;">
            <p style="margin:0 0 4px;font-size:12px;color:#898a8d;">&copy; ${year} ${clubName} &mdash; Service Above Self</p>
            <p style="margin:0;font-size:11px;color:#b1b1b1;">You received this because an admin invited you. If unexpected, ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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

    const adminSupabase = createServiceRoleClient() as any;
    // Build appUrl: prefer explicit env vars, fall back to request host.
    // x-forwarded-host is reliable on Vercel even for same-origin requests.
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.startsWith("http://localhost")
        ? (host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL)
        : (process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : ""));
    const clubName = process.env.NEXT_PUBLIC_SITE_NAME || "Rotaract Club";

    // Check if this email already exists in auth.users
    const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    if (existingUser) {
      if (existingUser.email_confirmed_at) {
        // Already a confirmed user — just assign role, no email needed
        const { data: existingProfile } = await adminSupabase
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .single();

        if (!existingProfile) {
          return NextResponse.json({ error: "User exists in auth but has no profile. Contact support." }, { status: 500 });
        }

        const { error: roleError } = await adminSupabase.from("user_roles").upsert(
          { user_id: existingProfile.user_id, role, is_active: true },
          { onConflict: "user_id,role" }
        );

        if (roleError) {
          return NextResponse.json({ error: `Failed to assign role: ${roleError.message}` }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `${email} already has an account. Role "${role}" has been assigned.`,
        });
      } else {
        // Invited but never confirmed — resend a fresh invite link
        const { data: resendLink, error: resendError } = await adminSupabase.auth.admin.generateLink({
          type: "invite",
          email,
          options: {
            data: { first_name, last_name },
            redirectTo: `${appUrl}/reset-password`,
          },
        });

        if (resendError) throw resendError;

        const resendActionLink = resendLink.properties?.action_link;
        const year = new Date().getFullYear();
        const resendHtml = buildInviteHtml(first_name, clubName, resendActionLink, year);

        const { error: emailError } = await sendViaBrevo(
          email,
          `You're invited to join ${clubName}`,
          resendHtml
        );

        if (emailError) console.error("Resend invite email failed:", emailError);

        return NextResponse.json({
          success: true,
          message: `Invitation resent to ${email}.`,
        });
      }
    }

    // generateLink creates the user + returns invite link WITHOUT sending any email
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        data: { first_name, last_name },
        redirectTo: `${appUrl}/reset-password`,
      },
    });

    if (linkError) {
      throw linkError;
    }

    const newUserId = linkData.user?.id;
    const actionLink = linkData.properties?.action_link;

    if (!newUserId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Assign role
    await adminSupabase.from("user_roles").upsert(
      { user_id: newUserId, role, is_active: true },
      { onConflict: "user_id,role" }
    );

    // The handle_new_user_role trigger auto-assigns prospective_member to every new user.
    // If the invited role is higher (member / board_member / admin / super_admin),
    // deactivate the trigger-added prospective_member so only the intended role is active.
    const ORG_ROLES_ABOVE_PROSPECTIVE = ["member", "board_member", "admin", "super_admin", "president",
      "secretary", "public_image_director", "membership_director", "project_director", "event_manager"];
    if (ORG_ROLES_ABOVE_PROSPECTIVE.includes(role)) {
      await adminSupabase
        .from("user_roles")
        .update({ is_active: false })
        .eq("user_id", newUserId)
        .eq("role", "prospective_member");
    }

    // Create member record if role warrants it
    if (role !== "prospective_member") {
      await adminSupabase.from("members").upsert(
        {
          user_id: newUserId,
          join_date: new Date().toISOString().split("T")[0],
          status: "active",
        },
        { onConflict: "user_id" }
      );
    }

    // Send branded invite email via Brevo API
    const year = new Date().getFullYear();
    const html = buildInviteHtml(first_name, clubName, actionLink, year);

    const { error: emailError } = await sendViaBrevo(
      email,
      `You're invited to join ${clubName}`,
      html
    );

    if (emailError) {
      console.error("Invite email failed:", emailError);
      return NextResponse.json({
        success: true,
        warning: true,
        message: "Member created but the invite email could not be sent. Please share the portal link manually.",
      });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully" });
  } catch (error: any) {
    console.error("Invite user error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
