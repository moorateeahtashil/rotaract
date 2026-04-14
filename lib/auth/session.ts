import { createServerClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types";

type UserRole = Database["public"]["Enums"]["user_role_type"];

// ─── Simplified RBAC ───
// System roles (dashboard access): super_admin, admin
// Standard system role (no dashboard): normal
// Org roles (membership status): board_member, member, prospective_member
// Legacy roles kept for backwards compat but mapped to board_member level

const ROLE_HIERARCHY: Record<string, number> = {
  // System roles
  super_admin: 0,
  admin: 1,
  // Org roles
  board_member: 2,
  member: 3,
  prospective_member: 4,
  normal: 5,
  // Legacy org roles (treat as board_member)
  president: 2,
  secretary: 2,
  public_image_director: 2,
  membership_director: 2,
  project_director: 2,
  event_manager: 2,
  // Legacy pending role
  applicant: 4,
  public: 5,
};

export async function getSession() {
  const supabase = await createServerClient() as any;
  // Use getUser() — authenticates with Supabase Auth server (not just cookies)
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return null;
  // Return a session-like object so all callers using session.user.id continue to work
  return { user };
}

export async function getCurrentUser() {
  const supabase = await createServerClient() as any;
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
  const supabase = await createServerClient() as any;
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
  const supabase = await createServerClient() as any;
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true);

  return roles?.map((r: any) => r.role) ?? [];
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

// Roles that can access the Admin Dashboard
export const ADMIN_ROLES: string[] = [
  "super_admin",
  "admin",
];

// Roles that have board/elevated privileges (internal members section, project/event creation)
export const BOARD_ROLES: string[] = [
  "super_admin",
  "admin",
  "board_member",
  // Legacy board roles
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
];

// Roles that can access the member portal
export const MEMBER_ROLES: string[] = [
  "super_admin",
  "admin",
  "board_member",
  "member",
  // Legacy board roles
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
];

// Helper to check dashboard access
export function canAccessAdmin(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

// Helper to check member portal access
export function canAccessMemberPortal(roles: string[]): boolean {
  return roles.some((r) => MEMBER_ROLES.includes(r));
}

// Helper to check board member privileges
export function hasBoardPrivileges(roles: string[]): boolean {
  return roles.some((r) => BOARD_ROLES.includes(r));
}

// Helper to check if user is pending approval
export function isPendingUser(roles: string[]): boolean {
  if (!roles.length) return true;
  return !canAccessMemberPortal(roles);
}
