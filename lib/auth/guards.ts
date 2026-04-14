import { getSession, getUserRoles, getHighestRole } from "./session";
import type { Database } from "@/lib/db/types";

type UserRole = Database["public"]["Enums"]["user_role_type"];

export async function requireAuth(redirectTo: string = "/login") {
  const session = await getSession();
  if (!session) {
    return { redirect: redirectTo };
  }
  return { session, userId: session.user.id };
}

export async function requireRole(
  allowedRoles: UserRole[],
  redirectTo: string = "/login"
) {
  const session = await getSession();
  if (!session) {
    return { redirect: redirectTo };
  }

  const roles = await getUserRoles(session.user.id);
  const highestRole = await getHighestRole(roles);

  const ROLE_HIERARCHY: Record<UserRole, number> = {
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

  const minAllowed = Math.min(
    ...allowedRoles.map((r) => ROLE_HIERARCHY[r] ?? 99)
  );

  if (ROLE_HIERARCHY[highestRole] > minAllowed) {
    return { redirect: "/unauthorized" };
  }

  return { session, userId: session.user.id, roles, highestRole };
}

export async function requireMember() {
  return requireRole(
    [
      "super_admin",
      "admin",
      "president",
      "secretary",
      "public_image_director",
      "membership_director",
      "project_director",
      "event_manager",
      "board_member",
      "member",
    ],
    "/login"
  );
}

export async function requireAdmin() {
  return requireRole(
    [
      "super_admin",
      "admin",
      "president",
      "secretary",
      "public_image_director",
      "membership_director",
      "project_director",
      "event_manager",
      "board_member",
    ],
    "/login"
  );
}
