import { createServerClient } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, UserPlus, Calendar, FolderKanban, Newspaper, Megaphone,
  ClipboardList, Image as ImageIcon, HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

async function count(supabase: any, table: string, build: (q: any) => any) {
  const { count } = await build(
    supabase.from(table).select("*", { count: "exact", head: true })
  );
  return count ?? 0;
}

export default async function AdminAnalyticsPage() {
  const guard = await requireAdmin();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;
  const today = new Date().toISOString().split("T")[0];
  const nowIso = new Date().toISOString();

  const [
    activeMembers, prospective, upcomingEvents, pastEvents,
    activeProjects, publishedPosts, publishedAnnouncements,
    pendingApplications, albums, faqs,
  ] = await Promise.all([
    count(supabase, "members", (q) => q.eq("status", "active").is("deleted_at", null)),
    count(supabase, "user_roles", (q) => q.eq("role", "prospective_member").eq("is_active", true)),
    count(supabase, "events", (q) => q.gte("date", today).is("deleted_at", null)),
    count(supabase, "events", (q) => q.lt("date", today).is("deleted_at", null)),
    count(supabase, "projects", (q) => q.in("status", ["planned", "active"]).is("deleted_at", null)),
    count(supabase, "posts", (q) => q.eq("is_published", true).is("deleted_at", null)),
    count(supabase, "announcements", (q) => q.eq("is_published", true).is("deleted_at", null)),
    count(supabase, "membership_applications", (q) => q.is("reviewed_by", null)),
    count(supabase, "albums", (q) => q.is("deleted_at", null)),
    count(supabase, "faqs", (q) => q.eq("is_visible", true).is("deleted_at", null)),
  ]);

  const sections: { title: string; cards: { icon: any; label: string; value: number; note?: string }[] }[] = [
    {
      title: "People",
      cards: [
        { icon: Users, label: "Active Members", value: activeMembers },
        { icon: UserPlus, label: "Prospective Members", value: prospective },
        { icon: ClipboardList, label: "Pending Applications", value: pendingApplications, note: "awaiting review" },
      ],
    },
    {
      title: "Program",
      cards: [
        { icon: Calendar, label: "Upcoming Events", value: upcomingEvents },
        { icon: Calendar, label: "Past Events", value: pastEvents },
        { icon: FolderKanban, label: "Active Projects", value: activeProjects },
      ],
    },
    {
      title: "Content",
      cards: [
        { icon: Newspaper, label: "Published Posts", value: publishedPosts },
        { icon: Megaphone, label: "Live Announcements", value: publishedAnnouncements },
        { icon: ImageIcon, label: "Gallery Albums", value: albums },
        { icon: HelpCircle, label: "Visible FAQs", value: faqs },
      ],
    },
  ];

  // Recent sign-ups
  const { data: recent } = await supabase
    .from("profiles")
    .select("first_name, last_name, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Analytics</h1>
        <p className="text-pewter mt-1">A live snapshot of your club&apos;s activity as of {new Date(nowIso).toLocaleDateString()}.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm font-semibold text-pewter uppercase tracking-wider mb-3">{section.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.cards.map((c) => (
              <Card key={c.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-pewter">{c.label}</CardTitle>
                  <c.icon className="h-4 w-4 text-rotary-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal">{c.value}</div>
                  {c.note && <p className="text-xs text-pewter mt-1">{c.note}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Sign-Ups</CardTitle></CardHeader>
        <CardContent>
          {recent && recent.length > 0 ? (
            <ul className="space-y-3">
              {recent.map((m: any, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-rotary-blue" />
                  <span className="text-charcoal">{m.first_name} {m.last_name}</span>
                  <span className="text-pewter ml-auto">{new Date(m.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-pewter">No recent sign-ups.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
