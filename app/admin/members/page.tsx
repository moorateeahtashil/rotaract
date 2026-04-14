"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Shield, UserCheck, User, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/db/browser-client";

const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "admin", label: "Admin", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "president", label: "President", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "secretary", label: "Secretary", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "public_image_director", label: "PI Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "membership_director", label: "Membership Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "project_director", label: "Project Director", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "event_manager", label: "Event Manager", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "board_member", label: "Board Member", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "member", label: "Member", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "applicant", label: "Applicant", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
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
  return <Badge variant="outline" className={r.color}>{r.label}</Badge>;
}

export default function AdminMembersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; user?: UserRecord }>({ open: false });
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState("member");
  const [createForm, setCreateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "member",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createClient() as any;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!profiles) {
      setLoading(false);
      return;
    }

    const { data: allRoles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("is_active", true);

    const { data: members } = await supabase
      .from("members")
      .select("user_id, status")
      .is("deleted_at", null);

    const roleMap: Record<string, string[]> = {};
    allRoles?.forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const memberMap: Record<string, string> = {};
    members?.forEach((m: any) => {
      memberMap[m.user_id] = m.status;
    });

    setUsers(
      profiles.map((p: any) => ({
        user_id: p.user_id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        roles: roleMap[p.user_id] || [],
        member_status: memberMap[p.user_id],
        created_at: p.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function assignRole() {
    if (!selectedUser) return;
    setSaving(true);
    const supabase = createClient() as any;
    try {
      const { error } = await supabase.from("user_roles").upsert(
        { user_id: selectedUser.user_id, role: newRole, is_active: true },
        { onConflict: "user_id,role" }
      );
      if (error) throw error;
      toast({ title: "Role assigned", description: `${selectedUser.first_name} is now a ${newRole}` });
      setRoleDialogOpen(false);
      await loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function approveApplicant(user: UserRecord) {
    setSaving(true);
    const supabase = createClient() as any;
    try {
      // Upgrade role to member
      await supabase
        .from("user_roles")
        .update({ is_active: false })
        .eq("user_id", user.user_id)
        .eq("role", "applicant");

      const { error } = await supabase.from("user_roles").upsert(
        { user_id: user.user_id, role: "member", is_active: true },
        { onConflict: "user_id,role" }
      );
      if (error) throw error;

      // Create member record if it doesn't exist
      const { data: existingMember } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.user_id)
        .single();

      if (!existingMember) {
        await supabase.from("members").insert({
          user_id: user.user_id,
          join_date: new Date().toISOString().split("T")[0],
          status: "active",
        });
      } else {
        await supabase
          .from("members")
          .update({ status: "active" })
          .eq("user_id", user.user_id);
      }

      toast({ title: "Approved!", description: `${user.first_name} ${user.last_name} is now a member.` });
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
    const supabase = createClient() as any;
    try {
      // We use the admin API endpoint to invite user
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create member");

      toast({ title: "Invited!", description: `An invitation has been sent to ${createForm.email}` });
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

  const admins = filtered.filter((u) =>
    u.roles.some((r) => ["super_admin", "admin", "president", "secretary", "board_member", "event_manager", "project_director", "membership_director", "public_image_director"].includes(r))
  );
  const members = filtered.filter((u) => u.roles.includes("member") && !admins.includes(u));
  const applicants = filtered.filter((u) => u.roles.includes("applicant") && !members.includes(u) && !admins.includes(u));

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
              {user.roles.slice(0, 2).map((r) => getRoleBadge(r))}
              {user.roles.length > 2 && (
                <Badge variant="outline" className="text-xs">+{user.roles.length - 2}</Badge>
              )}
              {user.roles.includes("applicant") && !user.roles.includes("member") && (
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
                  setNewRole(user.roles[0] || "member");
                  setRoleDialogOpen(true);
                }}
              >
                <Shield className="h-4 w-4" />
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
                  <Label>Initial Role</Label>
                  <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
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
          <TabsTrigger value="admins" className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Admins ({admins.length})
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" /> Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="applicants" className="flex items-center gap-1.5">
            <User className="h-4 w-4" /> Applicants ({applicants.length})
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

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board Members & Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable list={admins} />
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

        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Pending Applicants
                {applicants.length > 0 && (
                  <Badge className="bg-rotary-gold text-black">{applicants.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicants.length === 0 ? (
                <p className="text-sm text-pewter text-center py-6">No pending applicants</p>
              ) : (
                <UserTable list={applicants} />
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
              Assign a role to {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUser?.roles.map((r) => getRoleBadge(r))}
                {selectedUser?.roles.length === 0 && <span className="text-sm text-pewter">No roles assigned</span>}
              </div>
            </div>
            <div>
              <Label>Add Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
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
