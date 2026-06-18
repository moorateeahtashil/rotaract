"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Shield, User } from "lucide-react";

type BoardPosition = {
  id: string;
  position_key: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type BoardMember = {
  id: string;
  member_id: string;
  position_id: string;
  custom_title: string | null;
  photo_url: string | null;
  term_start: string;
  term_end: string | null;
  sort_order: number;
  is_visible: boolean;
  position?: BoardPosition;
  member?: {
    profile?: {
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
    };
  };
};

type MemberOption = {
  id: string;
  profile: { first_name: string; last_name: string; email: string } | null;
};

export default function AdminBoardPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [positions, setPositions] = useState<BoardPosition[]>([]);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BoardMember | null>(null);
  const [form, setForm] = useState({
    member_id: "",
    position_id: "",
    custom_title: "",
    term_start: new Date().toISOString().split("T")[0],
    term_end: "",
    sort_order: 0,
    is_visible: true,
  });
  const [saving, setSaving] = useState(false);
  const [posDialogOpen, setPosDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const [savingPos, setSavingPos] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: bm }, { data: pos }, { data: members }] = await Promise.all([
      supabase
        .from("board_members")
        .select(`*, position:board_positions(*), member:members(id, user_id)`)
        .is("deleted_at", null)
        .order("sort_order"),
      supabase
        .from("board_positions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("members")
        .select("id, user_id")
        .eq("status", "active")
        .is("deleted_at", null),
    ]);

    // Manual join: members.user_id → profiles (the PostgREST embed doesn't resolve).
    const bmRows = bm || [];
    const memRows = members || [];
    const userIds = [
      ...bmRows.map((b: any) => b.member?.user_id),
      ...memRows.map((m: any) => m.user_id),
    ].filter(Boolean);
    const profByUser = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, avatar_url")
        .in("user_id", userIds);
      for (const p of profiles || []) profByUser.set(p.user_id, p);
    }
    for (const b of bmRows) if (b.member) b.member.profile = profByUser.get(b.member.user_id) || null;
    const memWithProfiles = memRows.map((m: any) => ({ ...m, profile: profByUser.get(m.user_id) || null }));

    setBoardMembers(bmRows);
    setPositions(pos || []);
    setMemberOptions(memWithProfiles);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({
      member_id: "",
      position_id: "",
      custom_title: "",
      term_start: new Date().toISOString().split("T")[0],
      term_end: "",
      sort_order: boardMembers.length,
      is_visible: true,
    });
    setDialogOpen(true);
  }

  function openEdit(bm: BoardMember) {
    setEditing(bm);
    setForm({
      member_id: bm.member_id,
      position_id: bm.position_id,
      custom_title: bm.custom_title || "",
      term_start: bm.term_start,
      term_end: bm.term_end || "",
      sort_order: bm.sort_order,
      is_visible: bm.is_visible,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.member_id || !form.position_id || !form.term_start) {
      toast({ variant: "destructive", title: "Required fields missing", description: "Member, position, and term start are required." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        member_id: form.member_id,
        position_id: form.position_id,
        custom_title: form.custom_title || null,
        term_start: form.term_start,
        term_end: form.term_end || null,
        sort_order: form.sort_order,
        is_visible: form.is_visible,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase
          .from("board_members")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated", description: "Board member updated." });
      } else {
        const { error } = await supabase
          .from("board_members")
          .insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Added", description: "Board member added." });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this board member?")) return;
    const { error } = await supabase
      .from("board_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Removed", description: "Board member removed." });
      load();
    }
  }

  function getMemberName(option: MemberOption) {
    const p = option.profile;
    return p ? `${p.first_name} ${p.last_name}` : option.id;
  }

  // ─── Manage positions ───
  async function addPosition() {
    const title = newPosition.trim();
    if (!title) return;
    setSavingPos(true);
    try {
      const key = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const { error } = await supabase.from("board_positions").insert({
        title,
        position_key: `${key}-${Date.now().toString(36)}`,
        sort_order: positions.length + 1,
        is_active: true,
      });
      if (error) throw error;
      toast({ variant: "success", title: "Position added" });
      setNewPosition("");
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSavingPos(false);
    }
  }

  async function removePosition(p: BoardPosition) {
    const inUse = boardMembers.some((bm) => bm.position_id === p.id);
    if (inUse) {
      toast({ variant: "destructive", title: "Position in use", description: "Remove board members in this position first." });
      return;
    }
    if (!confirm(`Remove the "${p.title}" position?`)) return;
    const { error } = await supabase.from("board_positions").update({ is_active: false }).eq("id", p.id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ variant: "success", title: "Position removed" }); load(); }
  }

  if (loading) {
    return <div className="text-pewter text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Board Members</h1>
          <p className="text-sm text-pewter mt-1">Manage board positions and current term members.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPosDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" /> Manage Positions
          </Button>
          <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
            <Plus className="mr-2 h-4 w-4" /> Add Board Member
          </Button>
        </div>
      </div>

      {boardMembers.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Shield className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No board members yet. Add the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardMembers.map((bm) => {
            const profile = bm.member?.profile;
            const name = profile ? `${profile.first_name} ${profile.last_name}` : "Unknown Member";
            return (
              <Card key={bm.id} className="relative">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-rotary-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal truncate">{name}</p>
                      <p className="text-sm text-rotary-blue font-medium truncate">
                        {bm.custom_title || bm.position?.title}
                      </p>
                      {profile?.email && (
                        <p className="text-xs text-pewter truncate">{profile.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          From {bm.term_start}
                        </Badge>
                        {!bm.is_visible && (
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(bm)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(bm.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Board Member" : "Add Board Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Member *</Label>
              <Select value={form.member_id} onValueChange={(v) => setForm((f) => ({ ...f, member_id: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{getMemberName(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position *</Label>
              <Select value={form.position_id} onValueChange={(v) => setForm((f) => ({ ...f, position_id: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Custom Title <span className="text-pewter text-xs">(optional — overrides position title)</span></Label>
              <Input
                className="mt-1"
                value={form.custom_title}
                onChange={(e) => setForm((f) => ({ ...f, custom_title: e.target.value }))}
                placeholder="e.g. Club President 2024–25"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Term Start *</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.term_start}
                  onChange={(e) => setForm((f) => ({ ...f, term_start: e.target.value }))}
                />
              </div>
              <div>
                <Label>Term End</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.term_end}
                  onChange={(e) => setForm((f) => ({ ...f, term_end: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_visible"
                checked={form.is_visible}
                onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_visible">Visible on public leadership page</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : (editing ? "Save Changes" : "Add Board Member")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Positions */}
      <Dialog open={posDialogOpen} onOpenChange={setPosDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Positions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="New position title (e.g. Treasurer)"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPosition(); } }}
              />
              <Button onClick={addPosition} disabled={savingPos || !newPosition.trim()} className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {positions.length === 0 ? (
              <p className="text-sm text-pewter text-center py-4">No positions yet. Add the first one above.</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {positions.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-sm text-charcoal">{p.title}</span>
                    <Button size="sm" variant="ghost" className="text-cranberry hover:bg-cranberry/5" onClick={() => removePosition(p)} title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-pewter">Removing a position hides it from the dropdown. You can&apos;t remove a position that currently has a board member assigned.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
