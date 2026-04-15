"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SetupAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users/role");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function assignRole(userId: string, role: string, userName: string) {
    setProcessing(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ variant: "success", title: "Role Assigned", description: `${userName} is now a ${role.replace("_", " ")}.` });
      loadUsers();
    } catch (error: any) {
      toast({ variant: "success", title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-rotary-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-charcoal">Admin Setup</h1>
          <p className="text-pewter mt-2">Assign admin roles to users. Only existing admins can access this page.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>Click a role button to assign that role to a user.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-10 w-10 text-pewter mx-auto mb-3" />
                  <p className="text-pewter">No users found. Users must sign up first at /signup</p>
                  <Button className="mt-4" onClick={() => router.push("/signup")}>
                    <UserPlus className="mr-2 h-4 w-4" /> Go to Signup
                  </Button>
                </div>
              )}

              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-charcoal">{user.name || "Unnamed User"}</p>
                    <p className="text-sm text-pewter">{user.email}</p>
                    <div className="flex gap-1 mt-2">
                      {user.roles.length > 0 ? (
                        user.roles.map((role: string) => (
                          <Badge key={role} variant="secondary">{role.replace("_", " ")}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline">No role assigned</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={user.highestRole === "super_admin" ? "default" : "outline"}
                      disabled={processing === user.id}
                      onClick={() => assignRole(user.user_id, "super_admin", user.name)}
                      className={user.highestRole === "super_admin" ? "bg-red-600" : ""}
                    >
                      Super Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={user.highestRole === "admin" ? "default" : "outline"}
                      disabled={processing === user.id}
                      onClick={() => assignRole(user.user_id, "admin", user.name)}
                    >
                      Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={user.highestRole === "member" ? "default" : "outline"}
                      disabled={processing === user.id}
                      onClick={() => assignRole(user.user_id, "member", user.name)}
                    >
                      Member
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
