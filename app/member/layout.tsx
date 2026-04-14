import { getSession, getUserRoles, getHighestRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/layout/member-shell";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session is guaranteed by middleware for /member/* routes
  const session = await getSession();
  if (!session) return redirect("/login");

  const roles = await getUserRoles(session.user.id);
  const highestRole = await getHighestRole(roles);

  return (
    <MemberShell roles={roles} highestRole={highestRole}>
      {children}
    </MemberShell>
  );
}
