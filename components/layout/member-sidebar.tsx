"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Calendar,
  KeyRound,
  Megaphone,
  Users,
  FileText,
  LogOut,
} from "lucide-react";

const MEMBER_NAV = [
  { label: "Dashboard", href: "/member", icon: LayoutDashboard },
  { label: "My Profile", href: "/member/profile", icon: User },
  { label: "My Events", href: "/member/events", icon: Calendar },
  { label: "My Bookings", href: "/member/bookings", icon: KeyRound },
  {
    label: "Announcements",
    href: "/member/announcements",
    icon: Megaphone,
  },
  { label: "Directory", href: "/member/directory", icon: Users },
  { label: "Resources", href: "/member/resources", icon: FileText },
];

export function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-white">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/member" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-rotary-blue flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-semibold text-charcoal">Member Portal</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MEMBER_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/member" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-rotary-blue/10 text-rotary-blue"
                  : "text-charcoal hover:bg-gray-100 hover:text-rotary-blue"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-charcoal hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}
