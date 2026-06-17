"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, CheckCircle2, Settings, Search } from "lucide-react";

type EventLite = { id: string; title: string; date: string; event_type: string | null };
type ProgressItem = { key: string; label: string; have: number; need: number; met: boolean };
type Person = {
  user_id: string; member_id: string; name: string; email: string;
  role: "prospective" | "board" | "member";
  byType: Record<string, number>;
  totalAttended: number;
  project_leads: number;
  progress: { items: ProgressItem[]; allMet: boolean } | null;
};
type Requirements = { type_requirements: Record<string, number>; required_project_leads: number };

const ROLE_BADGE: Record<string, string> = {
  prospective: "bg-amber-100 text-amber-700 border-amber-200",
  board: "bg-purple-100 text-purple-700 border-purple-200",
  member: "bg-green-100 text-green-700 border-green-200",
};

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventLite[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [reqs, setReqs] = useState<Requirements>({ type_requirements: {}, required_project_leads: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [eventId, setEventId] = useState<string>("");
  const [attended, setAttended] = useState<Set<string>>(new Set());
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState<Requirements>({ type_requirements: {}, required_project_leads: 0 });
  const [savingReq, setSavingReq] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attendance");
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
        setEventTypes(data.eventTypes || []);
        setPeople(data.people || []);
        setReqs(data.requirements || { type_requirements: {}, required_project_leads: 0 });
      } else toast({ variant: "destructive", title: "Error", description: data.error });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const loadEvent = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingEvent(true);
    try {
      const res = await fetch(`/api/admin/attendance?eventId=${id}`);
      const data = await res.json();
      if (res.ok) setAttended(new Set(data.attended || []));
    } finally { setLoadingEvent(false); }
  }, []);

  useEffect(() => { if (eventId) loadEvent(eventId); }, [eventId, loadEvent]);

  async function toggle(memberId: string, present: boolean) {
    setAttended((prev) => { const n = new Set(prev); present ? n.add(memberId) : n.delete(memberId); return n; });
    const res = await fetch("/api/admin/attendance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, memberId, attended: present }),
    });
    if (!res.ok) {
      setAttended((prev) => { const n = new Set(prev); present ? n.delete(memberId) : n.add(memberId); return n; });
      toast({ variant: "destructive", title: "Error", description: (await res.json()).error });
    }
  }

  async function promote(p: Person) {
    if (!confirm(`Promote ${p.name} to full member?`)) return;
    const res = await fetch("/api/admin/users/role", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: p.user_id, role: "member", deactivateRoles: ["prospective_member", "applicant"], ensureMemberRecord: true }),
    });
    if (!res.ok) toast({ variant: "destructive", title: "Error", description: (await res.json()).error });
    else { toast({ variant: "success", title: "Promoted", description: `${p.name} is now a member.` }); load(); }
  }

  function openReqs() {
    setReqForm({ type_requirements: { ...reqs.type_requirements }, required_project_leads: reqs.required_project_leads });
    setReqOpen(true);
  }
  function setTypeReq(type: string, val: number) {
    setReqForm((r) => ({ ...r, type_requirements: { ...r.type_requirements, [type]: val } }));
  }
  async function saveReqs() {
    setSavingReq(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reqForm),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ variant: "success", title: "Requirements updated" });
      setReqOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally { setSavingReq(false); }
  }

  const q = search.trim().toLowerCase();
  const filtered = !q ? people : people.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  const prospects = filtered.filter((p) => p.role === "prospective");
  const others = filtered.filter((p) => p.role !== "prospective");

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Attendance</h1>
          <p className="text-sm text-pewter mt-1">Mark who attended each event and track prospective members&apos; progress.</p>
        </div>
        <Button variant="outline" onClick={openReqs}><Settings className="h-4 w-4 mr-2" /> Requirements</Button>
      </div>

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark" className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4" /> Mark Attendance</TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> By Person</TabsTrigger>
        </TabsList>

        {/* MARK */}
        <TabsContent value="mark" className="mt-4 space-y-4">
          <div className="max-w-md">
            <Label>Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose an event..." /></SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} — {new Date(e.date).toLocaleDateString()}{e.event_type ? ` (${e.event_type})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!eventId ? (
            <Card><CardContent className="pt-10 pb-10 text-center text-sm text-pewter">Pick an event to mark attendance.</CardContent></Card>
          ) : loadingEvent ? (
            <p className="text-sm text-pewter">Loading roster...</p>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {people.map((p) => {
                  const present = attended.has(p.member_id);
                  return (
                    <label key={p.member_id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={present} onChange={(e) => toggle(p.member_id, e.target.checked)} className="h-4 w-4 accent-rotary-blue" />
                      <span className="text-sm text-charcoal flex-1">{p.name}</span>
                      <Badge variant="outline" className={ROLE_BADGE[p.role]}>{p.role}</Badge>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BY PERSON */}
        <TabsContent value="people" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
            <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {prospects.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-pewter uppercase tracking-wider mb-2">Prospective Members</h2>
              <div className="space-y-3">
                {prospects.map((p) => (
                  <Card key={p.member_id} className={p.progress?.allMet ? "border-green-400" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-charcoal">{p.name}</p>
                          <p className="text-xs text-pewter">{p.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.progress?.allMet ? (
                            <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Ready</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In progress</Badge>
                          )}
                          <Button size="sm" className={p.progress?.allMet ? "bg-green-600 hover:bg-green-700" : "bg-rotary-blue hover:bg-rotary-blue/90"} onClick={() => promote(p)}>
                            Promote
                          </Button>
                        </div>
                      </div>
                      {p.progress && p.progress.items.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {p.progress.items.map((it) => (
                            <span key={it.key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${it.met ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                              {it.met && <CheckCircle2 className="h-3 w-3" />}
                              {it.label}: {it.have}/{it.need}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-pewter mt-2">No requirements configured yet. Set them with the Requirements button.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-pewter uppercase tracking-wider mb-2">Members &amp; Board</h2>
            {others.length === 0 ? (
              <Card><CardContent className="pt-6 pb-6 text-center text-sm text-pewter">No members yet.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {others.map((p) => {
                  const summary = Object.entries(p.byType).map(([t, n]) => `${n} ${t}`).join(" · ");
                  return (
                    <Card key={p.member_id}>
                      <CardContent className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal truncate">{p.name}</p>
                          <p className="text-xs text-pewter truncate">{summary || "No attendance yet"}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-pewter">{p.totalAttended} total</span>
                          <Badge variant="outline" className={ROLE_BADGE[p.role]}>{p.role}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Membership Requirements</DialogTitle></DialogHeader>
          <p className="text-xs text-pewter">Set how many of each event type a prospective member must attend before they qualify. Set 0 to ignore a type.</p>
          <div className="space-y-3 mt-2">
            {eventTypes.length === 0 ? (
              <p className="text-sm text-pewter">No event types defined yet. Add them in Event Types.</p>
            ) : eventTypes.map((t) => (
              <div key={t} className="flex items-center justify-between gap-4">
                <Label className="text-charcoal">{t}</Label>
                <Input type="number" min={0} className="w-24"
                  value={reqForm.type_requirements[t] ?? 0}
                  onChange={(e) => setTypeReq(t, Number(e.target.value))} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <Label className="text-charcoal">Project lead roles</Label>
              <Input type="number" min={0} className="w-24"
                value={reqForm.required_project_leads}
                onChange={(e) => setReqForm((r) => ({ ...r, required_project_leads: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={saveReqs} disabled={savingReq}>
                {savingReq ? "Saving..." : "Save Requirements"}
              </Button>
              <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
