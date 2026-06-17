"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Shield, UserCheck, User, Users, CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── System Roles (Dashboard Access) ──
const SYSTEM_ROLES = [
  { value: "super_admin", label: "Super Admin", style: { background: "#fee2e2", color: "#b91c1c", borderColor: "#fca5a5" } },
  { value: "admin",       label: "Admin",       style: { background: "#ffedd5", color: "#c2410c", borderColor: "#fdba74" } },
];

// ── Org Roles (Membership Status) ──
const ORG_ROLES = [
  { value: "board_member",       label: "Board Member",       style: { background: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd" } },
  { value: "member",             label: "Member",             style: { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" } },
  { value: "prospective_member", label: "Prospective Member", style: { background: "#fef9c3", color: "#a16207", borderColor: "#fde047" } },
];

// All roles for badge display (includes legacy + normal)
const ALL_ROLES = [
  ...SYSTEM_ROLES,
  { value: "normal", label: "Normal", style: { background: "#f3f4f6", color: "#4b5563", borderColor: "#d1d5db" } },
  ...ORG_ROLES,
  { value: "president",             label: "President",           style: { background: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd" } },
  { value: "secretary",             label: "Secretary",           style: { background: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd" } },
  { value: "public_image_director", label: "PI Director",         style: { background: "#f3e8ff", color: "#7e22ce", borderColor: "#d8b4fe" } },
  { value: "membership_director",   label: "Membership Dir.",     style: { background: "#f3e8ff", color: "#7e22ce", borderColor: "#d8b4fe" } },
  { value: "project_director",      label: "Project Dir.",        style: { background: "#f3e8ff", color: "#7e22ce", borderColor: "#d8b4fe" } },
  { value: "event_manager",         label: "Event Manager",       style: { background: "#ccfbf1", color: "#0f766e", borderColor: "#5eead4" } },
  { value: "applicant",             label: "Applicant",           style: { background: "#fef9c3", color: "#a16207", borderColor: "#fde047" } },
];

type UserRecord = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  member_status?: string;
  created_at: string;
};

function getRoleBadge(role: string) {
  const r = ALL_ROLES.find((x) => x.value === role);
  if (!r) return <Badge variant="outline">{role}</Badge>;
  return (
    <Badge variant="outline" style={r.style}>
      {r.label}
    </Badge>
  );
}

export default function AdminMembersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; user?: UserRecord }>({ open: false });
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newSystemRole, setNewSystemRole] = useState<string>("");
  const [newOrgRole, setNewOrgRole] = useState<string>("member");
  const [createForm, setCreateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "member",
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user?: UserRecord }>({ open: false });
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members");
      if (!res.ok) throw new Error("Failed to load members");
      const data = await res.json();
      setUsers(data);
    } catch {
      // silently fail — table stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function assignRole() {
    if (!selectedUser) return;
    setSaving(true);

    const SYSTEM_ROLE_VALUES = ["super_admin", "admin"];
    const ORG_ROLE_VALUES = ["board_member", "member", "prospective_member"];

    const oldSystemRoles = selectedUser.roles.filter((r) => SYSTEM_ROLE_VALUES.includes(r));
    const oldOrgRoles = selectedUser.roles.filter((r) => ORG_ROLE_VALUES.includes(r));

    const isNoSystemRole = !newSystemRole || newSystemRole === "none" || newSystemRole === "normal";

    try {
      // ── System role ──────────────────────────────────────────
      if (isNoSystemRole) {
        // Remove any existing system roles
        if (oldSystemRoles.length > 0) {
          const res = await fetch("/api/admin/users/role", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser.user_id, roles: oldSystemRoles }),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Failed to remove system role");
          }
        }
      } else {
        // Assign new system role, deactivate old ones
        const res = await fetch("/api/admin/users/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.user_id,
            role: newSystemRole,
            deactivateRoles: oldSystemRoles.filter((r) => r !== newSystemRole),
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || `Failed to assign ${newSystemRole}`);
      }

      // ── Org role (exclusive — only one at a time) ────────────
      const res2 = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          role: newOrgRole,
          deactivateRoles: oldOrgRoles.filter((r) => r !== newOrgRole),
        }),
      });
      const d2 = await res2.json();
      if (!res2.ok) throw new Error(d2.error || `Failed to assign ${newOrgRole}`);

      toast({ variant: "success", title: "Roles saved", description: `${selectedUser.first_name}'s roles have been updated.` });
      setRoleDialogOpen(false);
      await loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: UserRecord) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      toast({ variant: "success", title: "User deleted", description: `${user.first_name} ${user.last_name} has been removed.` });
      setDeleteDialog({ open: false });
      await loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function approveApplicant(user: UserRecord) {
    setSaving(true);
    try {
      // Route through the server API (service role) — browser writes to
      // user_roles/members are blocked by RLS. This assigns the member role,
      // deactivates the pending roles, and creates the members record.
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.user_id,
          role: "member",
          deactivateRoles: ["prospective_member", "applicant"],
          ensureMemberRecord: true,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to approve applicant");

      toast({ variant: "success", title: "Approved!", description: `${user.first_name} ${user.last_name} is now a member.` });
      setApproveDialog({ open: false });
      await loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function createMember() {
    setSaving(true);
    try {
      // We use the admin API endpoint to invite user
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create member");

      if (data.warning) {
        toast({ variant: "default", title: "Member added", description: data.message });
      } else {
        toast({ variant: "success", title: "Invitation sent!", description: data.message || `Invite sent to ${createForm.email}` });
      }
      setCreateDialogOpen(false);
      setCreateForm({ first_name: "", last_name: "", email: "", role: "member" });
      await loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const BOARD_ROLES_LIST = ["super_admin", "admin", "board_member", "president", "secretary",
    "public_image_director", "membership_director", "project_director", "event_manager"];
  const boardAndAdmins = filtered.filter((u) =>
    u.roles.some((r) => BOARD_ROLES_LIST.includes(r))
  );
  const members = filtered.filter((u) =>
    u.roles.includes("member") && !boardAndAdmins.includes(u)
  );
  const prospectives = filtered.filter((u) =>
    (u.roles.includes("prospective_member") || u.roles.includes("applicant")) &&
    !members.includes(u) && !boardAndAdmins.includes(u)
  );

  function UserTable({ list }: { list: UserRecord[] }) {
    return (
      <div className="space-y-2">
        {list.length === 0 && (
          <p className="text-sm text-pewter text-center py-6">No users found</p>
        )}
        {list.map((user) => (
          <div key={user.user_id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-rotary-blue/10 flex items-center justify-center font-bold text-rotary-blue flex-shrink-0 text-sm">
                {user.first_name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-charcoal text-sm">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-pewter truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              {user.roles.slice(0, 2).map((r) => (
                <Fragment key={r}>{getRoleBadge(r)}</Fragment>
              ))}
              {user.roles.length > 2 && (
                <Badge variant="outline" className="text-xs">+{user.roles.length - 2}</Badge>
              )}
              {(user.roles.includes("prospective_member") || user.roles.includes("applicant")) &&
                !user.roles.includes("member") && !user.roles.some((r) => BOARD_ROLES_LIST.includes(r)) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => setApproveDialog({ open: true, user })}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  const sysRole = user.roles.find(r => SYSTEM_ROLES.map(s => s.value).includes(r)) || "";
                  const orgRole = user.roles.find(r => ORG_ROLES.map(o => o.value).includes(r)) || "member";
                  setNewSystemRole(sysRole);
                  setNewOrgRole(orgRole);
                  setRoleDialogOpen(true);
                }}
              >
                <Shield className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setDeleteDialog({ open: true, user })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Members & Roles</h1>
          <p className="text-sm text-pewter">Manage members, approve applicants, and assign roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>Send an email invitation to add a new member to the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      placeholder="John"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      placeholder="Doe"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="member@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Initial Org Role</Label>
                  <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={createMember}
                  disabled={saving || !createForm.email || !createForm.first_name}
                  className="bg-rotary-blue hover:bg-rotary-blue/90"
                >
                  {saving ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
        <Input
          className="pl-9"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" /> All ({filtered.length})
          </TabsTrigger>
          <TabsTrigger value="board" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Board & Admins ({boardAndAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" /> Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="prospective" className="flex items-center gap-1.5">
            <User className="h-4 w-4" /> Prospective ({prospectives.length})
            {prospectives.length > 0 && (
              <Badge className="bg-rotary-gold text-black ml-1 text-xs">{prospectives.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <p className="text-sm text-pewter text-center py-6">Loading...</p>
              ) : (
                <UserTable list={filtered} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board Members & Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable list={boardAndAdmins} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable list={members} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospective">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Prospective Members
                {prospectives.length > 0 && (
                  <Badge className="bg-rotary-gold text-black">{prospectives.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prospectives.length === 0 ? (
                <p className="text-sm text-pewter text-center py-6">No prospective members</p>
              ) : (
                <UserTable list={prospectives} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              {selectedUser?.first_name} {selectedUser?.last_name} &mdash; {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current roles */}
            <div>
              <Label className="text-xs font-semibold uppercase text-pewter tracking-wide">Current Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUser?.roles.map((r) => (
                  <Fragment key={r}>{getRoleBadge(r)}</Fragment>
                ))}
                {selectedUser?.roles.length === 0 && <span className="text-sm text-pewter">No roles assigned</span>}
              </div>
            </div>

            {/* System role */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase text-pewter tracking-wide">System Role</p>
                <p className="text-xs text-pewter mt-0.5">Controls dashboard access</p>
              </div>
              <Select value={newSystemRole} onValueChange={setNewSystemRole}>
                <SelectTrigger>
                  <SelectValue placeholder="No system role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No system role</SelectItem>
                  {SYSTEM_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Org role */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div>
                <p className="text-xs font-semibold uppercase text-pewter tracking-wide">Org Role</p>
                <p className="text-xs text-pewter mt-0.5">Membership status. Board Member automatically includes Member.</p>
              </div>
              <Select value={newOrgRole} onValueChange={setNewOrgRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={assignRole} disabled={saving} className="bg-rotary-blue hover:bg-rotary-blue/90">
              {saving ? "Saving..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.user?.first_name} {deleteDialog.user?.last_name}</strong> ({deleteDialog.user?.email}) and all their data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.user && deleteUser(deleteDialog.user)}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Applicant Dialog */}
      <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Membership</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve {approveDialog.user?.first_name} {approveDialog.user?.last_name} as a full member, giving them access to the member portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveDialog.user && approveApplicant(approveDialog.user)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
