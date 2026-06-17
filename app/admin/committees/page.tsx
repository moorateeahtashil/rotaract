"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/db/browser-client";

type Committee = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  chair_member_id?: string;
  is_active: boolean;
  chair_name?: string;
};

type BoardMemberOption = {
  member_id: string;
  name: string;
};


const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  chair_member_id: "",
  is_active: true,
};

export default function AdminCommitteesPage() {
  const { toast } = useToast();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient() as any;

    const [
      { data: committeesData },
      { data: boardData },
    ] = await Promise.all([
      supabase
        .from("committees")
        .select(`
          id, name, slug, description, chair_member_id, is_active,
          chair:members!chair_member_id(
            id,
            profile:profiles(first_name, last_name)
          )
        `)
        .is("deleted_at", null)
        .order("name"),

      supabase
        .from("board_members")
        .select(`
          member_id,
          custom_title,
          position:board_positions(title),
          member:members(
            id,
            profile:profiles(first_name, last_name)
          )
        `)
        .is("deleted_at", null)
        .eq("is_visible", true),
    ]);

    setCommittees(
      (committeesData || []).map((c: any) => ({
        ...c,
        chair_name: c.chair?.profile
          ? `${c.chair.profile.first_name} ${c.chair.profile.last_name}`
          : undefined,
      }))
    );

    // Deduplicate board members
    const seen = new Set<string>();
    setBoardMembers(
      (boardData || [])
        .filter((b: any) => {
          if (seen.has(b.member_id)) return false;
          seen.add(b.member_id);
          return true;
        })
        .map((b: any) => ({
          member_id: b.member_id,
          name: b.member?.profile
            ? `${b.member.profile.first_name} ${b.member.profile.last_name} — ${b.custom_title || b.position?.title || "Board Member"}`
            : b.member_id,
        }))
    );

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(c: Committee) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      chair_member_id: c.chair_member_id || "",
      is_active: c.is_active,
    });
    setDialogOpen(true);
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Name required" });
      return;
    }

    setSaving(true);
    const supabase = createClient() as any;

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || autoSlug(form.name),
      description: form.description.trim() || null,
      chair_member_id: form.chair_member_id || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("committees")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Updated", description: `${payload.name} has been updated.` });
      } else {
        const { error } = await supabase.from("committees").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Created", description: `${payload.name} has been created.` });
      }
      setDialogOpen(false);
      await loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteDialog.id) return;
    setSaving(true);
    const supabase = createClient() as any;
    try {
      const { error } = await supabase
        .from("committees")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", deleteDialog.id);
      if (error) throw error;
      toast({ variant: "success", title: "Deleted", description: `${deleteDialog.name} has been removed.` });
      setDeleteDialog({ open: false });
      await loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Committees</h1>
          <p className="text-sm text-pewter">Manage club committees, their chairs, and linked avenues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-rotary-blue hover:bg-rotary-blue/90" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Committee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-pewter text-center py-8">Loading...</p>
          ) : committees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-pewter mx-auto mb-3" />
              <p className="text-charcoal font-medium">No committees yet</p>
              <p className="text-sm text-pewter">Create a committee to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {committees.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-rotary-blue" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-charcoal">{c.name}</p>
                        {!c.is_active && (
                          <Badge variant="outline" className="text-xs text-pewter">Inactive</Badge>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-sm text-pewter mt-0.5 truncate max-w-md">{c.description}</p>
                      )}
                      {c.chair_name && (
                        <p className="text-xs text-rotary-blue mt-1 font-medium">Chair: {c.chair_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialog({ open: true, id: c.id, name: c.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Committee" : "New Committee"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update committee details." : "Add a new committee to your club."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Committee Name *</Label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: form.slug || autoSlug(name),
                    });
                  }}
                  placeholder="e.g. Community Service Committee"
                />
              </div>
              <div className="col-span-2">
                <Label>Slug</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="community-service-committee"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the committee's purpose..."
              />
            </div>

            <div>
              <Label>Chair <span className="text-pewter text-xs font-normal">(must be a current Board Member)</span></Label>
              <Select
                value={form.chair_member_id}
                onValueChange={(v) => setForm({ ...form, chair_member_id: v === "__none" ? "" : v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select board member as chair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— No chair assigned —</SelectItem>
                  {boardMembers.map((b) => (
                    <SelectItem key={b.member_id} value={b.member_id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-rotary-blue hover:bg-rotary-blue/90"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Committee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Committee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.name}</strong>? This will remove the committee record. Members will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
