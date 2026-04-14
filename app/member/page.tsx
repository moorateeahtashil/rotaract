import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FolderKanban, Users, Bell, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function MemberDashboardPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;

  const [
    { data: member },
    { data: announcements },
    { data: upcomingEvents },
    { count: totalMembers },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*, profile:profiles(first_name, last_name)")
      .eq("user_id", guard.userId)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("announcements")
      .select("id, title, priority, published_at")
      .eq("is_published", true)
      .is("deleted_at", null)
      .or("expires_at.is.null,expires_at.gte." + new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id, title, slug, date, location, is_featured")
      .gte("date", new Date().toISOString())
      .in("status", ["published", "ongoing"])
      .is("deleted_at", null)
      .order("date", { ascending: true })
      .limit(4),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  const profile = (member as any)?.profile;
  const firstName = profile?.first_name || "Member";

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Welcome back, {firstName}!</h1>
        <p className="text-pewter mt-1">Here&apos;s what&apos;s happening with your club</p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Calendar,
            label: "Upcoming Events",
            value: String(upcomingEvents?.length ?? 0),
            color: "text-rotary-blue",
          },
          {
            icon: Clock,
            label: "Service Hours",
            value: String(member?.total_service_hours ?? 0),
            color: "text-azure",
          },
          {
            icon: FolderKanban,
            label: "Projects Joined",
            value: String(member?.total_projects ?? 0),
            color: "text-turquoise",
          },
          {
            icon: Users,
            label: "Club Members",
            value: String(totalMembers ?? 0),
            color: "text-rotary-gold",
          },
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-rotary-blue" />
              <CardTitle>Announcements</CardTitle>
            </div>
            <Link href="/member/announcements" className="text-sm text-rotary-blue hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!announcements || announcements.length === 0 ? (
            <p className="text-sm text-pewter">No new announcements</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a: any) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-sm text-charcoal">{a.title}</span>
                  <Badge variant="outline" className={`text-xs flex-shrink-0 ${priorityColors[a.priority] ?? priorityColors.normal}`}>
                    {a.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Events</CardTitle>
          <Link href="/member/events" className="text-sm text-rotary-blue hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!upcomingEvents || upcomingEvents.length === 0 ? (
            <p className="text-sm text-pewter">No upcoming events</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingEvents.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block p-4 border border-border rounded-lg hover:border-rotary-blue/40 hover:bg-rotary-blue/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-charcoal text-sm leading-tight">{event.title}</h3>
                    {event.is_featured && (
                      <Badge className="bg-rotary-gold text-black text-xs flex-shrink-0">Featured</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-pewter">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
