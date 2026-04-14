import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Announcements" };

export default async function MemberAnnouncementsPage() {
  const guard = await requireMember();
  if ("redirectTo" in guard) return redirect(guard.redirectTo);

  const supabase = await createServerClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .is("deleted_at", null)
    .or("expires_at.is.null,expires_at.gte." + new Date().toISOString())
    .order("published_at", { ascending: false });

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const priorityIcons: Record<string, typeof Bell> = {
    urgent: Bell,
    high: Bell,
    normal: Bell,
    low: Bell,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Announcements</h1>
        <p className="text-pewter mt-1">Stay updated with the latest club news</p>
      </div>

      {!announcements || announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bell className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No announcements</h3>
            <p className="text-sm text-pewter">There are no announcements at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement: any) => {
            const Icon = priorityIcons[announcement.priority] || Bell;
            return (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-rotary-blue" />
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={priorityColors[announcement.priority] || priorityColors.normal}
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-charcoal whitespace-pre-line">{announcement.body}</p>
                  <div className="flex items-center gap-4 text-xs text-pewter">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {announcement.published_at ? formatDate(announcement.published_at) : "Unpublished"}
                    </span>
                    {announcement.expires_at && (
                      <span>Expires: {formatDate(announcement.expires_at)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
