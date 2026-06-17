import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminTopbar />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
