"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CHART_DATA = [
  { month: "Jan", members: 40, events: 5 },
  { month: "Feb", members: 42, events: 3 },
  { month: "Mar", members: 45, events: 7 },
  { month: "Apr", members: 47, events: 4 },
  { month: "May", members: 50, events: 6 },
  { month: "Jun", members: 52, events: 8 },
];

export function AdminCharts() {
  return (
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
  );
}
