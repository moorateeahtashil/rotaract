import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/server";

export async function GET() {
  const supabase = await createServerClient() as any;
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ session: null, roles: [], note: "No session" });
  }

  const userId = user.id;
  const email = user.email;
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true);

  return NextResponse.json({
    userId,
    email,
    roles: roles?.map((r: any) => r.role) || [],
    error: error?.message,
  });
}
