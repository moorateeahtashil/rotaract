import { requireMember } from "@/lib/auth/guards";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import { isProspectiveOnly } from "@/lib/auth/roles";
import { isProjectLeadRole, computeProgress, normalizeRequirements } from "@/lib/membership";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FolderKanban, Users, Bell, MapPin, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { QuickScan } from "@/components/member/quick-scan";

export const metadata = { title: "Dashboard" };

// Prospective member progress toward membership requirements (dynamic by event type).
async function getProspectiveProgress(userId: string) {
  const service = createServiceRoleClient() as any;
  const { data: reqRow } = await service.from("membership_requirements").select("*").eq("id", 1).maybeSingle();
  const requirements = normalizeRequirements(reqRow);
  const { data: member } = await service.from("members").select("id").eq("user_id", userId).maybeSingle();
  const byType: Record<string, number> = {};
  let projectLeads = 0;
  if (member) {
    const [{ data: recs }, { data: scans }, { data: leads }] = await Promise.all([
      service.from("attendance_records").select("event_id, attended").eq("member_id", member.id),
      service.from("attendance_scan_logs").select("event_id").eq("member_id", member.id),
      service.from("project_team").select("role_in_project").eq("member_id", member.id),
    ]);
    const evIds = new Set<string>();
    for (const r of recs || []) if (r.attended) evIds.add(r.event_id);
    for (const s of scans || []) evIds.add(s.event_id);
    if (evIds.size) {
      const { data: events } = await service.from("events").select("id, event_type").in("id", Array.from(evIds));
      for (const e of events || []) if (e.event_type) byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    }
    projectLeads = (leads || []).filter((l: any) => isProjectLeadRole(l.role_in_project)).length;
  }
  return computeProgress(byType, projectLeads, requirements);
}

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
      .select("*")
      .eq("user_id", guard.userId)
      .is("deleted_at", null)
      .maybeSingle(),
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", guard.userId)
    .maybeSingle();
  const firstName = profile?.first_name || "Member";

  const prospective = isProspectiveOnly(guard.roles as string[]);
  const progress = prospective ? await getProspectiveProgress(guard.userId) : null;

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

      {/* Prospective member: progress toward becoming a full member */}
      {prospective && (
        <Card className={progress?.allMet ? "border-green-400" : "border-rotary-gold/40"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your path to membership</CardTitle>
              {progress?.allMet ? (
                <Badge className="bg-green-600 text-white"><CheckCircle className="h-3.5 w-3.5 mr-1" /> All requirements met</Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In progress</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {progress && progress.items.length > 0 ? (
              <>
                <div className="space-y-2">
                  {progress.items.map((it) => (
                    <div key={it.key} className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full flex-shrink-0 ${it.met ? "bg-green-500" : "bg-gray-200"}`} />
                      <span className="text-sm text-charcoal flex-1">{it.label}</span>
                      <span className={`text-xs font-medium ${it.met ? "text-green-700" : "text-pewter"}`}>{Math.min(it.have, it.need)}/{it.need}</span>
                    </div>
                  ))}
                </div>
                {progress.allMet
                  ? <p className="text-xs text-green-700 mt-3">You&apos;ve met all requirements! An admin will confirm your membership soon.</p>
                  : <p className="text-xs text-pewter mt-3">Attend club activities to complete your requirements and become a full member.</p>}
              </>
            ) : (
              <p className="text-sm text-pewter">Welcome! Attend club events and activities — your membership progress will appear here.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick check-in */}
      <QuickScan />

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
