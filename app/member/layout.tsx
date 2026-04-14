import { MemberHeader } from "@/components/layout/member-header";
import { MemberSidebar } from "@/components/layout/member-sidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader />
      <div className="flex">
        <MemberSidebar />
        <main className="flex-1 lg:ml-64 py-6">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
