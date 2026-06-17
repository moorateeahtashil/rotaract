"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, RefreshCw } from "lucide-react";

type UserRow = {
  user_id: string;
  name: string;
  email: string;
  roles: string[];
};

const SYSTEM_ROLES = ["super_admin", "admin"];
const ORG_ROLES = ["board_member", "member", "prospective_member"];
const ALL_ASSIGNABLE = [...SYSTEM_ROLES, ...ORG_ROLES, "normal"];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  board_member: "Board Member",
  member: "Member",
  prospective_member: "Prospective",
  normal: "No role",
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogUser, setDialogUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState<string>("member");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/role${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      if (res.ok) setUsers(Array.isArray(data) ? data : []);
      else toast({ variant: "destructive", title: "Error", description: data.error });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function openChange(u: UserRow) {
    setDialogUser(u);
    const current = [...SYSTEM_ROLES, ...ORG_ROLES].find((r) => u.roles.includes(r)) || "member";
    setNewRole(current);
  }

  async function saveRole() {
    if (!dialogUser) return;
    setSaving(true);
    try {
      // Deactivate every other assignable role, then set the chosen one.
      const toDeactivate = [...SYSTEM_ROLES, ...ORG_ROLES, "applicant"].filter((r) => r !== newRole);
      if (newRole === "normal") {
        const res = await fetch("/api/admin/users/role", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: dialogUser.user_id, roles: [...SYSTEM_ROLES, ...ORG_ROLES, "applicant"] }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed");
      } else {
        const res = await fetch("/api/admin/users/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: dialogUser.user_id,
            role: newRole,
            deactivateRoles: toDeactivate,
            ensureMemberRecord: ORG_ROLES.includes(newRole) && newRole !== "prospective_member",
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed");
      }
      toast({ variant: "success", title: "Role updated", description: `${dialogUser.name} is now ${ROLE_LABELS[newRole]}.` });
      setDialogUser(null);
      load(search);
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
          <h1 className="text-2xl font-bold text-charcoal">Users &amp; Roles</h1>
          <p className="text-sm text-pewter mt-1">Manage every platform user&apos;s access level.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(search)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <form
        className="relative max-w-sm"
        onSubmit={(e) => { e.preventDefault(); load(search); }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
        <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>

      {loading ? (
        <p className="text-sm text-pewter">Loading...</p>
      ) : users.length === 0 ? (
        <Card><CardContent className="pt-10 pb-10 text-center text-sm text-pewter">No users found.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.user_id}>
              <CardContent className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-charcoal truncate">{u.name}</p>
                  <p className="text-xs text-pewter truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {u.roles.length > 0 ? u.roles.map((r) => (
                      <Badge key={r} variant="outline">{ROLE_LABELS[r] || r}</Badge>
                    )) : <Badge variant="outline" className="bg-gray-100 text-gray-600">No role</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openChange(u)}>
                    <Shield className="h-3.5 w-3.5 mr-1" /> Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!dialogUser} onOpenChange={(o) => !o && setDialogUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set role — {dialogUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_ASSIGNABLE.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r] || r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-pewter">
              This sets the user&apos;s primary role and removes conflicting roles. Assigning a member/board role also creates their member record.
            </p>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1 bg-rotary-blue hover:bg-rotary-blue/90" onClick={saveRole} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setDialogUser(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
