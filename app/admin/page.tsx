import { createServerClient } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCharts } from "@/components/admin/admin-charts";
import {
  Users,
  FolderKanban,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const guard = await requireAdmin();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient();

  // Fetch real stats
  const [
    { count: totalMembers },
    { count: activeEvents },
    { count: totalProjects },
    { count: pendingApplicants },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .in("status", ["published", "ongoing"])
      .gte("end_date", new Date().toISOString().split("T")[0])
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ["planned", "active"])
      .is("deleted_at", null),
    supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "applicant")
      .eq("is_active", true),
  ]);

  const stats = [
    { icon: Users, label: "Active Members", value: String(totalMembers ?? 0), change: "Total active" },
    { icon: Calendar, label: "Active Events", value: String(activeEvents ?? 0), change: "Published & ongoing" },
    { icon: FolderKanban, label: "Projects", value: String(totalProjects ?? 0), change: "Planned & active" },
    { icon: TrendingUp, label: "Pending Applications", value: String(pendingApplicants ?? 0), change: "Awaiting approval" },
  ];

  // Recent activity
  const { data: recentMembers } = await supabase
    .from("profiles")
    .select("first_name, last_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-pewter mt-1">Overview of your Rotaract club</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pewter">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-rotary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal">{stat.value}</div>
              <p className="text-xs text-pewter mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts — client component */}
      <AdminCharts />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-rotary-blue" />
            <CardTitle className="text-lg">Recent Sign-Ups</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentMembers && recentMembers.length > 0 ? (
            <ul className="space-y-3">
              {recentMembers.map((m: any, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-rotary-blue" />
                  <span className="text-charcoal">
                    {m.first_name} {m.last_name} joined
                  </span>
                  <span className="text-pewter ml-auto">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-pewter">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
