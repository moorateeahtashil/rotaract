"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Search, Shield, UserCheck, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-700" },
  { value: "admin", label: "Admin", color: "bg-orange-100 text-orange-700" },
  { value: "president", label: "President", color: "bg-blue-100 text-blue-700" },
  { value: "secretary", label: "Secretary", color: "bg-blue-100 text-blue-700" },
  { value: "board_member", label: "Board Member", color: "bg-green-100 text-green-700" },
  { value: "member", label: "Member", color: "bg-gray-100 text-gray-700" },
  { value: "applicant", label: "Prospective Member", color: "bg-yellow-100 text-yellow-700" },
];

// Sample data — will be replaced with real data from Supabase
const SAMPLE_USERS = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "super_admin", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "member", status: "active" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "applicant", status: "pending" },
];

export default function AdminMembersPage() {
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "member" });
  const { toast } = useToast();

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    // In production: call API/Supabase to create/update user role
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, role: formData.role } : u));
      toast({ title: "Updated", description: `${formData.name}'s role has been updated.` });
    } else {
      toast({ title: "Created", description: `${formData.name} has been added.` });
    }
    setDialogOpen(false);
    setEditUser(null);
    setFormData({ name: "", email: "", role: "member" });
  };

  const getRoleBadge = (role: string) => {
    const r = ALL_ROLES.find(x => x.value === role);
    if (!r) return <Badge variant="outline">{role}</Badge>;
    return <Badge className={r.color}>{r.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">User & Role Management</h1>
          <p className="text-sm text-pewter">Manage user accounts and assign roles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rotary-blue hover:bg-rotary-blue/90">
              <Plus className="mr-2 h-4 w-4" /> Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? "Edit User Role" : "Assign Role to User"}</DialogTitle>
              <DialogDescription>
                {editUser ? "Update the role for this user." : "Select a user and assign a role."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <Input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(role.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-pewter">
                <p className="font-medium text-charcoal mb-1">Role Permissions:</p>
                <ul className="space-y-1">
                  {formData.role === "super_admin" && <li>• Full access to everything</li>}
                  {formData.role === "admin" && <li>• Full access to admin dashboard</li>}
                  {formData.role === "board_member" && <li>• Admin dashboard access, content management</li>}
                  {formData.role === "member" && <li>• Member portal access only</li>}
                  {formData.role === "applicant" && <li>• Limited access, pending approval</li>}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-rotary-blue hover:bg-rotary-blue/90">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1.5"><Users className="h-4 w-4" /> All Users</TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Admins</TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5"><UserCheck className="h-4 w-4" /> Members</TabsTrigger>
          <TabsTrigger value="applicants" className="flex items-center gap-1.5"><User className="h-4 w-4" /> Prospective</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
                <Input
                  className="pl-9 max-w-sm"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-rotary-blue/10 flex items-center justify-center font-bold text-rotary-blue">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{user.name}</p>
                        <p className="text-sm text-pewter">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(user.role)}
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => { setEditUser(user); setFormData({ name: user.name, email: user.email, role: user.role }); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-pewter">Users with admin-level roles (super_admin, admin, president, secretary)</p>
              {/* Filter and show only admins */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-pewter">Active members with portal access</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicants">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-pewter">Prospective members awaiting approval</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
