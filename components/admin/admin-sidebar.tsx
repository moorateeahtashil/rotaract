"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  FolderKanban,
  Newspaper,
  Image,
  HelpCircle,
  Handshake,
  Download,
  BarChart3,
  Shield,
  ScrollText,
  Globe,
  ClipboardList,
  Tag,
  Megaphone,
  CalendarCheck,
  X,
} from "lucide-react";

const ADMIN_NAV = [
  {
    category: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    category: "Content",
    items: [
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
      { label: "Rotary Highlights", href: "/admin/highlights", icon: Globe },
      { label: "Legal Pages", href: "/admin/content", icon: ScrollText },
    ],
  },
  {
    category: "People",
    items: [
      { label: "Members", href: "/admin/members", icon: Users },
      { label: "Applications", href: "/admin/applications", icon: ClipboardList },
      { label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
      { label: "Board Members", href: "/admin/board", icon: Shield },
      { label: "Committees", href: "/admin/committees", icon: Users },
    ],
  },
  {
    category: "Program",
    items: [
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "Event Types", href: "/admin/event-types", icon: Tag },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "News", href: "/admin/news", icon: Newspaper },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    category: "Media & Resources",
    items: [
      { label: "Gallery", href: "/admin/gallery", icon: Image },
      { label: "Resources", href: "/admin/resources", icon: Download },
      { label: "FAQs", href: "/admin/faq", icon: HelpCircle },
      { label: "Sponsors", href: "/admin/sponsors", icon: Handshake },
    ],
  },
  {
    category: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    category: "System",
    items: [
      { label: "Users & Roles", href: "/admin/users", icon: Shield },
      { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
    ],
  },
];

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
      {ADMIN_NAV.map((section) => (
        <div key={section.category}>
          <p className="px-3 mb-1 text-xs font-semibold text-pewter uppercase tracking-wider">
            {section.category}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-rotary-blue text-white"
                        : "text-charcoal hover:bg-gray-100 hover:text-rotary-blue"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  const Brand = (
    <div className="flex h-16 items-center justify-between border-b border-border px-4">
      <Link href="/admin" className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-rotary-blue flex items-center justify-center">
          <span className="text-white font-bold text-xs">R</span>
        </div>
        <span className="font-semibold text-charcoal text-sm">Admin Panel</span>
      </Link>
      {onClose && (
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-pewter" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-border bg-white">
        {Brand}
        <SidebarNav pathname={pathname} />
      </aside>

      {/* Mobile: off-canvas drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] flex flex-col border-r border-border bg-white shadow-xl">
            {Brand}
            <SidebarNav pathname={pathname} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
