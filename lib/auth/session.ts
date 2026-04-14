import { createServerClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types";

type UserRole = Database["public"]["Enums"]["user_role_type"];

// Role hierarchy — lower number = higher privilege
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

export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  return profile;
}

export async function getCurrentMember() {
  const supabase = await createServerClient();
  const session = await getSession();
  if (!session) return null;

  const { data: member } = await supabase
    .from("members")
    .select(
      `
      *,
      profile:profiles(*)
    `
    )
    .eq("user_id", session.user.id)
    .is("deleted_at", null)
    .single();

  return member;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const supabase = await createServerClient();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true);

  return roles?.map((r) => r.role) ?? [];
}

export async function getHighestRole(roles: UserRole[]): Promise<UserRole> {
  if (!roles.length) return "public";

  return roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest]
      ? current
      : highest;
  }, "public");
}

export function hasRole(
  userRoles: UserRole[],
  requiredRoles: UserRole[],
  minRole?: UserRole
): boolean {
  if (minRole) {
    const highest = userRoles.length
      ? userRoles.reduce((h, r) =>
          ROLE_HIERARCHY[r] < ROLE_HIERARCHY[h] ? r : h
        )
      : "public";
    return ROLE_HIERARCHY[highest] <= ROLE_HIERARCHY[minRole];
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}

export function canAccess(
  userRoles: UserRole[],
  requiredRole: UserRole
): boolean {
  const highest = getHighestRoleSync(userRoles);
  return ROLE_HIERARCHY[highest] <= ROLE_HIERARCHY[requiredRole];
}

function getHighestRoleSync(roles: UserRole[]): UserRole {
  if (!roles.length) return "public";
  return roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest]
      ? current
      : highest;
  }, "public");
}

export const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
  "board_member",
];

export const BOARD_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
  "board_member",
];
