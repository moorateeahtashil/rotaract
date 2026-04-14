"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/db/browser-client";

type Row = { month: string; members: number; events: number };

function getLastSixMonths(): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const label = start.toLocaleString(undefined, { month: "short" });
    months.push({ label, start, end });
  }
  return months;
}

export function AdminCharts() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    const supabase = createClient() as any;
    async function load() {
      const months = getLastSixMonths();
      const rows: Row[] = [];

      for (const m of months) {
        // Cumulative active members up to end of month
        const { count: memberCount } = await supabase
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .is("deleted_at", null)
          .lte("join_date", m.end.toISOString());

        // Events within month (published or ongoing)
        const monthStartIso = m.start.toISOString();
        const nextMonth = new Date(m.end);
        nextMonth.setDate(m.end.getDate() + 1);
        const monthEndIso = nextMonth.toISOString();

        const { count: eventsCount } = await supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .in("status", ["published", "ongoing"])
          .gte("date", monthStartIso)
          .lt("date", monthEndIso);

        rows.push({ month: m.label, members: memberCount ?? 0, events: eventsCount ?? 0 });
      }

      setData(rows);
    }
    load();
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Member Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
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
            <BarChart data={data}>
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
