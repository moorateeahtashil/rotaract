import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 0, admin: 1, president: 2, secretary: 3,
  public_image_director: 4, membership_director: 5,
  project_director: 6, event_manager: 7, board_member: 8,
  member: 9, applicant: 10, public: 11,
};

async function getHighestRole(supabase: any, userId: string): Promise<string> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!roles?.length) return "public";

  return roles.reduce((min: string, r: { role: string }) =>
    ROLE_HIERARCHY[r.role] < ROLE_HIERARCHY[min] ? r.role : min,
    "public"
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
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

    const highestRole = await getHighestRole(supabase, session.user.id);
    if (highestRole === "applicant" || highestRole === "public") {
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

    const highestRole = await getHighestRole(supabase, session.user.id);
    if (ROLE_HIERARCHY[highestRole] > ROLE_HIERARCHY["board_member"]) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ─── Redirect logged-in users away from auth pages ───
  if (session && (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")) {
    const highestRole = await getHighestRole(supabase, session.user.id);

    if (highestRole === "applicant" || highestRole === "public") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    const isAdmin = ROLE_HIERARCHY[highestRole] <= ROLE_HIERARCHY["board_member"];
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/member", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
