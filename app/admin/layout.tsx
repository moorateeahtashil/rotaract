import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: enforce admin access at the layout level too,
  // not just in middleware. Covers every /admin/* sub-page.
  const guard = await requireAdmin();
  if ("redirectTo" in guard) redirect(guard.redirectTo as string);

  return <AdminShell>{children}</AdminShell>;
}
