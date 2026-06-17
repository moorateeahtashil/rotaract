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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, HelpCircle, Eye, EyeOff } from "lucide-react";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_visible: boolean;
};

const EMPTY_FORM = { question: "", answer: "", category: "", sort_order: 0, is_visible: true };

export default function AdminFaqPage() {
  const supabase = createClient() as any;
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("faqs")
      .select("id, question, answer, category, sort_order, is_visible")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    setFaqs(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const categories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))) as string[];

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: faqs.length + 1 });
    setDialogOpen(true);
  }

  function openEdit(f: Faq) {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category || "",
      sort_order: f.sort_order,
      is_visible: f.is_visible,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ variant: "destructive", title: "Question and answer are required." });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_visible: form.is_visible,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("faqs").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ variant: "success", title: "FAQ updated" });
      } else {
        const { error } = await supabase.from("faqs").insert(payload);
        if (error) throw error;
        toast({ variant: "success", title: "FAQ added" });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(f: Faq) {
    const { error } = await supabase
      .from("faqs")
      .update({ is_visible: !f.is_visible, updated_at: new Date().toISOString() })
      .eq("id", f.id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ variant: "success", title: f.is_visible ? "Hidden" : "Now visible" }); load(); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase
      .from("faqs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else { toast({ variant: "success", title: "Deleted" }); load(); }
  }

  if (loading) return <div className="text-pewter text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">FAQs</h1>
          <p className="text-sm text-pewter mt-1">Shown on the public Frequently Asked Questions page.</p>
        </div>
        <Button onClick={openAdd} className="bg-rotary-blue hover:bg-rotary-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <HelpCircle className="h-10 w-10 text-pewter mx-auto mb-3" />
            <p className="text-pewter text-sm">No FAQs yet. Add the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <Card key={f.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-charcoal">{f.question}</p>
                      {f.category && <Badge variant="outline">{f.category}</Badge>}
                      {!f.is_visible && <Badge variant="outline" className="bg-gray-100 text-gray-600">Hidden</Badge>}
                      <span className="text-xs text-pewter">#{f.sort_order}</span>
                    </div>
                    <p className="text-sm text-pewter mt-1 line-clamp-2">{f.answer}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => toggleVisible(f)} title={f.is_visible ? "Hide" : "Show"}>
                      {f.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(f)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-cranberry border-cranberry/30 hover:bg-cranberry/5" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Question *</Label>
              <Input
                className="mt-1"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="e.g. Who can join?"
              />
            </div>
            <div>
              <Label>Answer *</Label>
              <Textarea
                className="mt-1"
                rows={4}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Write the answer..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  className="mt-1"
                  list="faq-categories"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Membership"
                />
                <datalist id="faq-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label className="text-charcoal">Visible</Label>
                <p className="text-xs text-pewter">Show on the public FAQ page</p>
              </div>
              <Switch
                checked={form.is_visible}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Save Changes" : "Add FAQ")}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
