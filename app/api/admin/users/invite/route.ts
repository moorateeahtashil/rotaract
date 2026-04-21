import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import { renderEmailTemplate } from "@/lib/email/index";

async function sendViaBrevo(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.NEXT_PUBLIC_SITE_NAME || "Rotaract Club";

  console.log("[Brevo] apiKey set:", !!apiKey, "| fromEmail set:", !!fromEmail);
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const clubName = process.env.NEXT_PUBLIC_SITE_NAME || "Rotaract Club";

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
      if (linkError.message?.includes("already been registered")) {
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

    // Create member record if role warrants it
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

    // Send branded invite email via Brevo API
    const html = renderEmailTemplate({
      title: `You're invited to ${clubName}`,
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Hi <strong>${first_name}</strong>,</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
          You've been invited to join the <strong style="color:#17458f;">${clubName} Member Portal</strong> —
          your central hub for events, announcements, and club resources.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">
          Click the button below to set your password and activate your account.
        </p>
        <p style="margin:24px 0 0;font-size:13px;color:#898a8d;">This link expires in 24 hours.</p>
      `,
      ctaUrl: actionLink,
      ctaText: "Accept Invitation",
      footer: `&copy; ${new Date().getFullYear()} ${clubName} &mdash; Service Above Self`,
    });

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
