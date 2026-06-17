import { getHighestRole } from "@/lib/auth/session";
import { requireMember } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/layout/member-shell";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: re-verify member portal access at the layout level.
  // Non-members (e.g. unapproved) are sent to /pending; this includes
  // prospective_member as portal-eligible per lib/auth/roles.ts.
  const guard = await requireMember();
  if ("redirectTo" in guard) redirect(guard.redirectTo as string);

  const roles = guard.roles;
  const highestRole = await getHighestRole(roles);

  return (
    <MemberShell roles={roles} highestRole={highestRole}>
      {children}
    </MemberShell>
  );
}
