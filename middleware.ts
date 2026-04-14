import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // ─── Maintenance mode check ───
  // Check site_settings for maintenance_mode (skip for admin)
  if (pathname.startsWith("/admin")) {
    // Admin can always access even in maintenance mode
  } else if (process.env.MAINTENANCE_MODE === "true") {
    if (pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // ─── Protected routes: /member/* ───
  if (pathname.startsWith("/member")) {
    if (!session) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ─── Protected routes: /admin/* ───
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check role — admin requires at least 'board_member' role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("is_active", true);

    const ROLE_HIERARCHY: Record<string, number> = {
      super_admin: 0,
      admin: 1,
      president: 2,
      secretary: 3,
      public_image_director: 4,
      membership_director: 5,
      project_director: 6,
      event_manager: 7,
      board_member: 8,
      member: 9,
      applicant: 10,
      public: 11,
    };

    const highestRole = roles?.length
      ? roles.reduce((min: string, r: { role: string }) => {
          return ROLE_HIERARCHY[r.role] < ROLE_HIERARCHY[min]
            ? r.role
            : min;
        }, "public")
      : "public";

    if (ROLE_HIERARCHY[highestRole] > ROLE_HIERARCHY["board_member"]) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ─── Auth routes redirect if already logged in ───
  if (
    session &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")
  ) {
    return NextResponse.redirect(new URL("/member", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
