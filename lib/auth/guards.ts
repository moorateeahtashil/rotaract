import {
  getSession,
  getUserRoles,
  getHighestRole,
  canAccessAdmin,
  canAccessMemberPortal,
  hasBoardPrivileges,
} from "./session";

export async function requireAuth(redirectTo: string = "/login") {
  const session = await getSession();
  if (!session) {
    return { redirectTo };
  }
  return { session, userId: session.user.id };
}

export async function requireMember() {
  const session = await getSession();
  if (!session) return { redirectTo: "/login" };

  const roles = await getUserRoles(session.user.id);
  if (!canAccessMemberPortal(roles)) {
    return { redirectTo: "/pending" };
  }

  const highestRole = await getHighestRole(roles);
  return { session, userId: session.user.id, roles, highestRole };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return { redirectTo: "/login" };

  const roles = await getUserRoles(session.user.id);
  if (!canAccessAdmin(roles)) {
    return { redirectTo: "/unauthorized" };
  }

  const highestRole = await getHighestRole(roles);
  return { session, userId: session.user.id, roles, highestRole };
}

export async function requireBoardMember() {
  const session = await getSession();
  if (!session) return { redirectTo: "/login" };

  const roles = await getUserRoles(session.user.id);
  if (!hasBoardPrivileges(roles)) {
    return { redirectTo: "/unauthorized" };
  }

  const highestRole = await getHighestRole(roles);
  return { session, userId: session.user.id, roles, highestRole };
}
