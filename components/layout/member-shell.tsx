"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/db/browser-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  User,
  Calendar,
  Megaphone,
  Users,
  FileText,
  LogOut,
  Bell,
  Settings,
  Shield,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = string;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin:        { label: "Super Admin",        color: "bg-red-100 text-red-700" },
  admin:              { label: "Admin",              color: "bg-orange-100 text-orange-700" },
  board_member:       { label: "Board Member",       color: "bg-blue-100 text-blue-700" },
  member:             { label: "Member",             color: "bg-green-100 text-green-700" },
  prospective_member: { label: "Prospective Member", color: "bg-yellow-100 text-yellow-700" },
  normal:             { label: "Member",             color: "bg-gray-100 text-gray-700" },
  // Legacy
  president:             { label: "President",          color: "bg-blue-100 text-blue-700" },
  secretary:             { label: "Secretary",          color: "bg-blue-100 text-blue-700" },
  event_manager:         { label: "Event Manager",      color: "bg-teal-100 text-teal-700" },
  membership_director:   { label: "Membership Director",color: "bg-purple-100 text-purple-700" },
  project_director:      { label: "Project Director",   color: "bg-purple-100 text-purple-700" },
  public_image_director: { label: "PI Director",        color: "bg-purple-100 text-purple-700" },
  applicant:             { label: "Applicant",          color: "bg-yellow-100 text-yellow-700" },
};

const DASHBOARD_ROLES = ["super_admin", "admin"];

function isAdminRole(role: string) {
  return DASHBOARD_ROLES.includes(role);
}

export function MemberShell({
  children,
  roles,
  highestRole,
}: {
  children: React.ReactNode;
  roles: UserRole[];
  highestRole: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = isAdminRole(highestRole);

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/member", icon: LayoutDashboard },
    { label: "My Profile", href: "/member/profile", icon: User },
    { label: "Events", href: "/member/events", icon: Calendar },
    { label: "Attendance", href: "/member/attendance", icon: QrCode },
    { label: "Announcements", href: "/member/announcements", icon: Megaphone },
    { label: "Directory", href: "/member/directory", icon: Users },
    { label: "Resources", href: "/member/resources", icon: FileText },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const roleInfo = ROLE_LABELS[highestRole] || { label: highestRole, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-white flex items-center justify-between px-4 lg:px-6">
        <div className="lg:hidden">
          <Link href="/member" className="font-semibold text-charcoal">
            Member Portal
          </Link>
        </div>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
              <Link href="/admin">
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-pewter" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-rotary-blue text-white text-xs">
                    M
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block text-sm font-medium">My Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2 border-b border-border">
                <Badge className={`text-xs ${roleInfo.color}`}>{roleInfo.label}</Badge>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/member/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Website
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-cranberry"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 top-16 w-64 flex-col border-r border-border bg-white">
          <div className="flex h-14 items-center border-b border-border px-5">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-rotary-blue flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <div>
                <span className="font-semibold text-charcoal text-sm block leading-tight">Member Portal</span>
                <Badge className={`text-[10px] mt-0.5 ${roleInfo.color}`}>{roleInfo.label}</Badge>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
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
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rotary-blue hover:bg-rotary-blue/10 transition-colors"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-charcoal hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 py-6 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
