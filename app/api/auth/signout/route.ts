import { createServerClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
