import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// System roles that grant admin dashboard access
const ADMIN_SYSTEM_ROLES = ["super_admin", "admin"];

// Org roles (and legacy roles) that grant member portal access
const MEMBER_ACCESS_ROLES = [
  "super_admin", "admin",
  "board_member", "member",
  // Legacy board roles — treated as board_member
  "president", "secretary", "public_image_director",
  "membership_director", "project_director", "event_manager",
];

async function getUserRoles(supabase: any, userId: string): Promise<string[]> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true);

  return roles?.map((r: { role: string }) => r.role) ?? [];
}

function canAccessAdmin(roles: string[]): boolean {
  return roles.some((r) => ADMIN_SYSTEM_ROLES.includes(r));
}

function canAccessMemberPortal(roles: string[]): boolean {
  return roles.some((r) => MEMBER_ACCESS_ROLES.includes(r));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  // Treat as "session exists" if getUser() returns a verified user
  const session = sessionUser ? { user: sessionUser } : null;
  const pathname = request.nextUrl.pathname;

  // ─── Maintenance mode ───
  if (!pathname.startsWith("/admin") && process.env.MAINTENANCE_MODE === "true") {
    if (pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // ─── Protected /pending ───
  if (pathname === "/pending") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ─── Protected /member/* ───
  if (pathname.startsWith("/member")) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const roles = await getUserRoles(supabase, session.user.id);
    if (!canAccessMemberPortal(roles)) {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
  }

  // ─── Protected /admin/* ───
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const roles = await getUserRoles(supabase, session.user.id);
    if (!canAccessAdmin(roles)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ─── Redirect logged-in users away from auth pages ───
  if (session && (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")) {
    const roles = await getUserRoles(supabase, session.user.id);

    if (canAccessAdmin(roles)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (canAccessMemberPortal(roles)) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
