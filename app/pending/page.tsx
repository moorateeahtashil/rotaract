import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin, canAccessMemberPortal } from "@/lib/auth/roles";
import {
  isProjectLeadRole, computeProgress, normalizeRequirements,
} from "@/lib/membership";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, CheckCircle, Mail, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application Pending" };

// Compute a prospective member's progress toward the membership requirements.
async function getProgress(userId: string) {
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
      for (const e of events || []) {
        if (e.event_type) byType[e.event_type] = (byType[e.event_type] || 0) + 1;
      }
    }
    projectLeads = (leads || []).filter((l: any) => isProjectLeadRole(l.role_in_project)).length;
  }
  return computeProgress(byType, projectLeads, requirements);
}

export default async function PendingPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const supabase = await createServerClient() as any;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("user_id", session.user.id)
    .single();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("is_active", true);

  const roleNames: string[] = roles?.map((r: any) => r.role) ?? [];

  if (canAccessAdmin(roleNames)) return redirect("/admin");
  if (canAccessMemberPortal(roleNames)) return redirect("/member");

  const firstName = profile?.first_name || "there";
  const progress = await getProgress(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-rotary-blue flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Rotaract Club</h1>
        </div>

        <Card className="border-rotary-gold/30 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-rotary-gold/10 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-rotary-gold" />
            </div>
            <h2 className="text-xl font-bold text-charcoal mb-2">
              Hi {firstName}, your application is under review
            </h2>
            <p className="text-pewter mb-6">
              Thank you for applying to join our Rotaract club. Our membership team will review your application and get in touch shortly.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Application submitted</p>
                  <p className="text-xs text-pewter">Your account has been created</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-rotary-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Awaiting admin review</p>
                  <p className="text-xs text-pewter">An admin will approve your membership</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 text-pewter mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal opacity-50">Access member portal</p>
                  <p className="text-xs text-pewter">Once approved, you&apos;ll have full access</p>
                </div>
              </div>
            </div>

            {progress.items.length > 0 && (
              <div className="bg-white border border-border rounded-xl p-4 text-left mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-charcoal">Your path to membership</p>
                  {progress.allMet ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <CheckCircle className="h-3.5 w-3.5" /> All requirements met
                    </span>
                  ) : (
                    <span className="text-xs text-pewter">In progress</span>
                  )}
                </div>
                <div className="space-y-2">
                  {progress.items.map((it) => (
                    <div key={it.key} className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full flex-shrink-0 ${it.met ? "bg-green-500" : "bg-gray-200"}`} />
                      <span className="text-sm text-charcoal flex-1">{it.label}</span>
                      <span className={`text-xs font-medium ${it.met ? "text-green-700" : "text-pewter"}`}>{Math.min(it.have, it.need)}/{it.need}</span>
                    </div>
                  ))}
                </div>
                {progress.allMet && (
                  <p className="text-xs text-green-700 mt-3">You&apos;ve met all the requirements! An admin will review and confirm your membership shortly.</p>
                )}
              </div>
            )}

            <p className="text-sm text-pewter mb-6">
              Registered as: <strong className="text-charcoal">{profile?.email}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" /> Contact Us
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">View Website</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-pewter mt-6">
          Not you?{" "}
          <Link href="/api/auth/signout" className="text-rotary-blue hover:underline">
            Sign out
          </Link>
        </p>
      </div>
    </div>
  );
}
