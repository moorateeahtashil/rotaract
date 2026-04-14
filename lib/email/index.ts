import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  if (!resend) {
    console.warn(
      "[Email] Resend not configured. Email would have been sent:",
      { to, subject }
    );
    return { id: null, error: null }; // Mock success in dev
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html),
      replyTo: replyTo || FROM_EMAIL,
    });

    return { id: result.data?.id ?? null, error: result.error };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { id: null, error };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function renderEmailTemplate({
  title,
  body,
  ctaUrl,
  ctaText,
  footer,
}: {
  title: string;
  body: string;
  ctaUrl?: string;
  ctaText?: string;
  footer?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Open Sans', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #17458f; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; color: #54565a; line-height: 1.6; }
    .cta { display: inline-block; background: #17458f; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .cta:hover { background: #12366e; }
    .footer { background: #d6d1ca; padding: 24px; text-align: center; font-size: 12px; color: #898a8d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${body}
      ${
        ctaUrl && ctaText
          ? `<a href="${ctaUrl}" class="cta">${ctaText}</a>`
          : ""
      }
    </div>
    <div class="footer">
      ${footer || "Sent by Rotaract Club Platform"}
    </div>
  </div>
</body>
</html>
  `.trim();
}
