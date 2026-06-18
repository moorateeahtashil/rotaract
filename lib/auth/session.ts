import { createServerClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types";
import {
  ROLE_HIERARCHY,
  ADMIN_ROLES,
  BOARD_ROLES,
  MEMBER_ROLES,
  canAccessAdmin,
  canAccessMemberPortal,
  hasBoardPrivileges,
} from "@/lib/auth/roles";

type UserRole = Database["public"]["Enums"]["user_role_type"];

// ─── Simplified RBAC ───
// Role hierarchy + access predicates now live in lib/auth/roles.ts
// (edge-safe, shared with middleware) and are re-exported below for
// backwards compatibility with existing imports.
export { ROLE_HIERARCHY, ADMIN_ROLES, BOARD_ROLES, MEMBER_ROLES };
export { canAccessAdmin, canAccessMemberPortal, hasBoardPrivileges };

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
    .select("*")
    .eq("user_id", session.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!member) return null;

  // Attach profile manually (members→profiles embed returns null).
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return { ...member, profile: profile ?? null };
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

// Helper to check if user is pending approval
export function isPendingUser(roles: string[]): boolean {
  if (!roles.length) return true;
  return !canAccessMemberPortal(roles);
}
