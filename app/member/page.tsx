import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FolderKanban, Users, Bell } from "lucide-react";

export default function MemberDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Welcome back!</h1>
        <p className="text-pewter mt-1">Here's what's happening with your club</p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Upcoming Events", value: "3", color: "text-rotary-blue" },
          { icon: Clock, label: "Service Hours", value: "42", color: "text-azure" },
          { icon: FolderKanban, label: "Projects", value: "5", color: "text-turquoise" },
          { icon: Users, label: "Club Members", value: "50", color: "text-rotary-gold" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pewter">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-rotary-blue" />
            <CardTitle>Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-pewter">No new announcements</p>
          {/* TODO: Dynamic announcements */}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Link
            href="/member/events"
            className="text-sm text-rotary-blue hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-pewter">No upcoming events</p>
          {/* TODO: Dynamic events */}
        </CardContent>
      </Card>
    </div>
  );
}
