// ============================================================
// SHARED ROLE DEFINITIONS — edge-safe (no server imports)
// Single source of truth for role hierarchy + access predicates.
// Imported by both middleware.ts (edge runtime) and session.ts.
// ============================================================

// Lower number = MORE privilege
export const ROLE_HIERARCHY: Record<string, number> = {
  // System roles
  super_admin: 0,
  admin: 1,
  // Org roles
  board_member: 2,
  member: 3,
  prospective_member: 4,
  normal: 5,
  // Legacy org roles (treated as board_member)
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

// Roles that can access the Admin Dashboard
export const ADMIN_ROLES: string[] = ["super_admin", "admin"];

// Roles that have board/elevated privileges
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

// Roles that can access the member portal.
// prospective_member IS included — prospective members get the portal
// (dashboard, profile, events, attendance, announcements, directory, resources)
// while awaiting approval/promotion to full member.
export const MEMBER_ROLES: string[] = [
  "super_admin",
  "admin",
  "board_member",
  "member",
  "prospective_member",
  // Legacy board roles
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
];

// Roles considered "prospective" (awaiting approval / not yet full members).
export const PROSPECTIVE_ROLES: string[] = ["prospective_member", "applicant"];

// True when the user ONLY holds prospective/applicant roles (no member+).
export function isProspectiveOnly(roles: string[]): boolean {
  return roles.length > 0 && roles.every((r) => PROSPECTIVE_ROLES.includes(r));
}

// Every role that can be assigned through admin tooling.
export const ASSIGNABLE_ROLES: string[] = [
  "super_admin",
  "admin",
  "board_member",
  "member",
  "prospective_member",
  "normal",
  "president",
  "secretary",
  "public_image_director",
  "membership_director",
  "project_director",
  "event_manager",
];

export function canAccessAdmin(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

export function canAccessMemberPortal(roles: string[]): boolean {
  return roles.some((r) => MEMBER_ROLES.includes(r));
}

export function hasBoardPrivileges(roles: string[]): boolean {
  return roles.some((r) => BOARD_ROLES.includes(r));
}

// Privilege level of the highest (most privileged) role a user holds.
// Returns a hierarchy number; 5 (public) if none.
export function highestRoleLevel(roles: string[]): number {
  if (!roles.length) return ROLE_HIERARCHY.public;
  return roles.reduce(
    (best, r) => Math.min(best, ROLE_HIERARCHY[r] ?? ROLE_HIERARCHY.public),
    ROLE_HIERARCHY.public
  );
}
