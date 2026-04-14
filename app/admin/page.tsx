import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FolderKanban,
  Calendar,
  TrendingUp,
  Activity,
  Mail,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Placeholder data — replace with actual DB queries
const CHART_DATA = [
  { month: "Jan", members: 40, events: 5 },
  { month: "Feb", members: 42, events: 3 },
  { month: "Mar", members: 45, events: 7 },
  { month: "Apr", members: 47, events: 4 },
  { month: "May", members: 50, events: 6 },
  { month: "Jun", members: 52, events: 8 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-pewter mt-1">Overview of your Rotaract club</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Members", value: "52", change: "+3 this month" },
          { icon: Calendar, label: "Active Events", value: "6", change: "2 upcoming" },
          { icon: FolderKanban, label: "Projects", value: "8", change: "3 active" },
          { icon: TrendingUp, label: "Service Hours", value: "2,500+", change: "+120 this month" },
        ].map((stat) => (
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CHART_DATA}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="members" fill="#17458f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CHART_DATA}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="events" fill="#f7a81b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-rotary-blue" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-rotary-blue" />
              <span className="text-charcoal">New member joined: John Doe</span>
              <span className="text-pewter ml-auto">2 hours ago</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-rotary-gold" />
              <span className="text-charcoal">Event "Cleanliness Drive" published</span>
              <span className="text-pewter ml-auto">5 hours ago</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-turquoise" />
              <span className="text-charcoal">3 new event registrations</span>
              <span className="text-pewter ml-auto">1 day ago</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
