import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] Code exchange failed:", error.message);
  }

  // Code missing or exchange failed — send to login with error
  return NextResponse.redirect(`${origin}/login?error=invite_expired`);
}
