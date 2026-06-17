import { createServerClient } from "@/lib/db/server";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit Log" };

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700 border-green-200",
  update: "bg-blue-100 text-blue-700 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  login: "bg-gray-100 text-gray-700 border-gray-200",
  approve: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reject: "bg-amber-100 text-amber-700 border-amber-200",
};

export default async function AdminAuditLogPage() {
  const guard = await requireAdmin();
  if ("redirectTo" in guard) return redirect(guard.redirectTo as string);

  const supabase = await createServerClient() as any;

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Resolve actor names
  const userIds = Array.from(new Set((logs || []).map((l: any) => l.user_id).filter(Boolean)));
  const nameById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", userIds);
    for (const p of profiles || []) {
      nameById.set(p.user_id, `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Audit Log</h1>
        <p className="text-sm text-pewter mt-1">Administrative activity across the platform (most recent 200 entries).</p>
      </div>

      {!logs || logs.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <ScrollText className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No audit activity recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <Badge variant="outline" className={ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}>
                    {log.action}
                  </Badge>
                  <span className="text-charcoal font-medium capitalize">{log.entity_type?.replace(/_/g, " ")}</span>
                  <span className="text-pewter truncate">
                    by {log.user_id ? (nameById.get(log.user_id) || "Unknown") : "System"}
                  </span>
                  <span className="text-pewter ml-auto whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
