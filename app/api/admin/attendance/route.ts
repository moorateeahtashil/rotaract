import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/db/server";
import {
  isProjectLeadRole, computeProgress, normalizeRequirements,
} from "@/lib/membership";

const ATT_ADMIN = ["super_admin", "admin", "president", "secretary", "event_manager", "membership_director"];
const ROSTER_ROLES = ["member", "board_member", "prospective_member",
  "president", "secretary", "public_image_director", "membership_director", "project_director", "event_manager"];

async function authAdmin() {
  const supabase = await createServerClient() as any;
  const service = createServiceRoleClient() as any;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: roleRows } = await service
    .from("user_roles").select("role").eq("user_id", user.id).eq("is_active", true);
  const roles = (roleRows || []).map((r: any) => r.role);
  if (!roles.some((r: string) => ATT_ADMIN.includes(r))) {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  return { user, service };
}

async function getRequirements(service: any) {
  const { data } = await service.from("membership_requirements").select("*").eq("id", 1).maybeSingle();
  return normalizeRequirements(data);
}

// Ensure every member/prospective user has a members row; return maps.
async function ensureRoster(service: any) {
  const { data: roleRows } = await service
    .from("user_roles").select("user_id, role").eq("is_active", true).in("role", ROSTER_ROLES);
  const rolesByUser = new Map<string, string[]>();
  for (const r of roleRows || []) {
    if (!rolesByUser.has(r.user_id)) rolesByUser.set(r.user_id, []);
    rolesByUser.get(r.user_id)!.push(r.role);
  }
  const userIds = Array.from(rolesByUser.keys());
  const memberByUser = new Map<string, string>();
  if (userIds.length === 0) return { rolesByUser, memberByUser };

  const { data: existing } = await service.from("members").select("id, user_id").in("user_id", userIds);
  for (const m of existing || []) memberByUser.set(m.user_id, m.id);

  const missing = userIds.filter((u) => !memberByUser.has(u));
  for (const uid of missing) {
    const prospectiveOnly = !rolesByUser.get(uid)!.some((r) => r !== "prospective_member" && r !== "applicant");
    const { data: created } = await service.from("members").insert({
      user_id: uid,
      join_date: new Date().toISOString().split("T")[0],
      status: prospectiveOnly ? "pending" : "active",
    }).select("id").single();
    if (created) memberByUser.set(uid, created.id);
  }
  return { rolesByUser, memberByUser };
}

function roleLabel(roles: string[]): "prospective" | "board" | "member" {
  if (roles.includes("member")) return "member";
  if (roles.some((r) => r !== "prospective_member" && r !== "applicant")) return "board";
  return "prospective";
}

// GET — roster with progress, events list, event types, requirements.
// Or ?eventId= → attended member_ids for one event.
export async function GET(req: NextRequest) {
  const auth = await authAdmin();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const eventId = new URL(req.url).searchParams.get("eventId");
  if (eventId) {
    const { data: recs } = await service
      .from("attendance_records").select("member_id, attended").eq("event_id", eventId);
    const { data: scans } = await service
      .from("attendance_scan_logs").select("member_id").eq("event_id", eventId);
    const attended = new Set<string>();
    for (const r of recs || []) if (r.attended) attended.add(r.member_id);
    for (const s of scans || []) attended.add(s.member_id);
    return NextResponse.json({ attended: Array.from(attended) });
  }

  const requirements = await getRequirements(service);
  const { rolesByUser, memberByUser } = await ensureRoster(service);

  const { data: eventTypes } = await service
    .from("event_types").select("name").order("name", { ascending: true });
  const typeNames = (eventTypes || []).map((t: any) => t.name);

  const memberIds = Array.from(memberByUser.values());
  const { data: profiles } = await service
    .from("profiles").select("user_id, first_name, last_name, email")
    .in("user_id", Array.from(rolesByUser.keys()));
  const profByUser = new Map<string, any>();
  for (const p of profiles || []) profByUser.set(p.user_id, p);

  const { data: events } = await service
    .from("events").select("id, title, date, event_type").is("deleted_at", null).order("date", { ascending: false });
  const typeByEvent = new Map<string, string | null>();
  for (const e of events || []) typeByEvent.set(e.id, e.event_type);

  const { data: recs } = memberIds.length
    ? await service.from("attendance_records").select("member_id, event_id, attended").in("member_id", memberIds)
    : { data: [] };
  const { data: scans } = memberIds.length
    ? await service.from("attendance_scan_logs").select("member_id, event_id").in("member_id", memberIds)
    : { data: [] };
  const { data: leads } = memberIds.length
    ? await service.from("project_team").select("member_id, role_in_project").in("member_id", memberIds)
    : { data: [] };

  const attendedByMember = new Map<string, Set<string>>();
  const add = (mid: string, eid: string) => {
    if (!attendedByMember.has(mid)) attendedByMember.set(mid, new Set());
    attendedByMember.get(mid)!.add(eid);
  };
  for (const r of recs || []) if (r.attended) add(r.member_id, r.event_id);
  for (const s of scans || []) add(s.member_id, s.event_id);

  const leadCount = new Map<string, number>();
  for (const l of leads || []) {
    if (isProjectLeadRole(l.role_in_project)) leadCount.set(l.member_id, (leadCount.get(l.member_id) || 0) + 1);
  }

  const people = Array.from(rolesByUser.entries()).map(([uid, roles]) => {
    const memberId = memberByUser.get(uid)!;
    const prof = profByUser.get(uid);
    const evIds = attendedByMember.get(memberId) || new Set<string>();
    const byType: Record<string, number> = {};
    for (const eid of evIds) {
      const t = typeByEvent.get(eid);
      if (t) byType[t] = (byType[t] || 0) + 1;
    }
    const label = roleLabel(roles);
    const leadsN = leadCount.get(memberId) || 0;
    const progress = label === "prospective" ? computeProgress(byType, leadsN, requirements) : null;
    return {
      user_id: uid,
      member_id: memberId,
      name: prof ? `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "Unknown" : "Unknown",
      email: prof?.email || "",
      role: label,
      byType,
      totalAttended: evIds.size,
      project_leads: leadsN,
      progress,
    };
  });

  people.sort((a, b) => {
    const order = { prospective: 0, board: 1, member: 2 } as any;
    if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ events: events || [], eventTypes: typeNames, requirements, people });
}

// POST — mark/unmark attendance for a member at an event
export async function POST(req: NextRequest) {
  const auth = await authAdmin();
  if ("error" in auth) return auth.error;
  const { user, service } = auth;

  const { eventId, memberId, attended } = await req.json();
  if (!eventId || !memberId || typeof attended !== "boolean") {
    return NextResponse.json({ error: "eventId, memberId, attended required" }, { status: 400 });
  }
  const { data: existing } = await service
    .from("attendance_records").select("id").eq("event_id", eventId).eq("member_id", memberId).maybeSingle();
  if (existing) {
    const { error } = await service.from("attendance_records")
      .update({ attended, marked_by: user.id, marked_at: new Date().toISOString() }).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await service.from("attendance_records")
      .insert({ event_id: eventId, member_id: memberId, attended, marked_by: user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PATCH — update dynamic requirement thresholds
export async function PATCH(req: NextRequest) {
  const auth = await authAdmin();
  if ("error" in auth) return auth.error;
  const { service } = auth;

  const body = await req.json();
  const patch: any = { id: 1, updated_at: new Date().toISOString() };
  if (body.type_requirements && typeof body.type_requirements === "object") {
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(body.type_requirements)) {
      const n = Number(v);
      if (k && Number.isFinite(n) && n > 0) clean[k] = n;
    }
    patch.type_requirements = clean;
  }
  if ("required_project_leads" in body) patch.required_project_leads = Number(body.required_project_leads) || 0;

  const { error } = await service.from("membership_requirements").upsert(patch, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
