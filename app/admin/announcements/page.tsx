"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/browser-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "urgent";
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

const EMPTY_FORM = {
  title: "",
  body: "",
  priority: "normal" as Announcement["priority"],
  is_published: true,
  expires_at: "",
};

export default function AdminAnnouncementsPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, body, priority, is_published, published_at, expires_at, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(a: Announcement) {
    setEditing(a);
    setForm({
      title: a.title,
      body: a.body,
      priority: a.priority,
      is_published: a.is_published,
      expires_at: a.expires_at ? a.expires_at.slice(0, 10) : "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ variant: "destructive", title: "Title and message are required." });
      return;
    }
    setSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const payload: any = {
        title: form.title.trim(),
        body: form.body.trim(),
        priority: form.priority,
        is_published: form.is_published,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        updated_at: nowIso,
      };

      if (editing) {
        // Set published_at the first time it goes live
        if (form.is_published && !editing.published_at) payload.published_at = nowIso;
        if (!form.is_published) payload.published_at = null;
        const { error } = await supabase.from("announcements").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "Announcement updated" });
      } else {
        payload.published_at = form.is_published ? nowIso : null;
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "Announcement posted" });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(a: Announcement) {
    const next = !a.is_published;
    const { error } = await supabase
      .from("announcements")
      .update({
        is_published: next,
        published_at: next ? (a.published_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", a.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: next ? "Published" : "Unpublished" });
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase
      .from("announcements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ variant: "success", title: "Deleted" });
      load();
    }
  }

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Announcements</h1>
          <p className="text-sm text-pewter mt-1">
            Posted to the member portal dashboard &amp; announcements page.
          </p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> New Announcement
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <Megaphone className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No announcements yet. Post the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const expired = a.expires_at && new Date(a.expires_at) < new Date();
            return (
              <Card key={a.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-charcoal">{a.title}</p>
                        <Badge variant="outline" className={PRIORITY_COLORS[a.priority]}>
                          {a.priority}
                        </Badge>
                        {a.is_published ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">Draft</Badge>
                        )}
                        {expired && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Expired</Badge>
                        )}
                      </div>
                      <p className="text-sm text-pewter mt-1 line-clamp-2 whitespace-pre-line">{a.body}</p>
                      <p className="text-xs text-pewter mt-2">
                        {a.published_at ? `Published ${formatDate(a.published_at)}` : "Not published"}
                        {a.expires_at ? ` · Expires ${formatDate(a.expires_at)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => togglePublish(a)} title={a.is_published ? "Unpublish" : "Publish"}>
                        {a.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Monthly meeting moved to Thursday"
              />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                className="mt-1"
                rows={5}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write the announcement details..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Announcement["priority"] }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expires (optional)</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-charcoal">Publish now</Label>
                <p className="text-xs text-pewter">Visible to members immediately</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Post Announcement")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
