"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  FileText,
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
  PanelLeftClose,
  PanelLeftOpen,
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
      { label: "Legal Pages", href: "/admin/content", icon: ScrollText },
    ],
  },
  {
    category: "People",
    items: [
      { label: "Members", href: "/admin/members", icon: Users },
      { label: "Board Members", href: "/admin/board", icon: Shield },
      { label: "Committees", href: "/admin/committees", icon: Users },
    ],
  },
  {
    category: "Program",
    items: [
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "News", href: "/admin/news", icon: Newspaper },
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

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-rotary-blue flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-charcoal text-sm">
              Admin Panel
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-pewter"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {ADMIN_NAV.map((section) => (
          <div key={section.category}>
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-semibold text-pewter uppercase tracking-wider">
                {section.category}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-rotary-blue text-white"
                          : "text-charcoal hover:bg-gray-100 hover:text-rotary-blue",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
