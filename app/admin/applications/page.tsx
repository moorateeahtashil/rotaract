"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, FileText, CheckCircle, Clock, XCircle, RefreshCw, Eye, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/db/browser-client";

type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  company: string | null;
  education: string | null;
  why_join: string | null;
  how_heard: string | null;
  social_links: Record<string, string> | null;
  additional_answers: Record<string, string> | null;
  status: "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  invite_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_CONFIG = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileText },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

function StatusBadge({ status }: { status: Application["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.color}>
      <config.icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; app?: Application; action?: "approve" | "reject" }>({ open: false });
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadApplications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient() as any;

    const { data, error } = await supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = applications.filter(
    (app) =>
      app.first_name.toLowerCase().includes(search.toLowerCase()) ||
      app.last_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingApps = filtered.filter((a) => !a.reviewed_by);
  const reviewedApps = filtered.filter((a) => a.reviewed_by);

  async function handleReview(action: "approve" | "reject") {
    if (!reviewDialog.app) return;
    setSaving(true);
    const supabase = createClient() as any;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      let inviteWarning = "";

      // On approval, actually onboard the applicant: invite them so an account
      // is created with the `member` role + members record, and a welcome email
      // is sent. The invite API is idempotent for already-existing users.
      if (action === "approve") {
        try {
          const res = await fetch("/api/admin/users/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: reviewDialog.app.first_name,
              last_name: reviewDialog.app.last_name,
              email: reviewDialog.app.email,
              role: "member",
            }),
          });
          const d = await res.json();
          if (!res.ok) inviteWarning = d.error || "could not send invite";
          else if (d.warning) inviteWarning = d.message || "";
        } catch (e: any) {
          inviteWarning = e.message || "could not send invite";
        }
      }

      const { error } = await supabase
        .from("membership_applications")
        .update({
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes || null,
          status: action === "approve" ? "approved" : "rejected",
          ...(action === "approve" && !inviteWarning ? { invite_sent_at: new Date().toISOString() } : {}),
        })
        .eq("id", reviewDialog.app.id);

      if (error) throw error;

      toast({
        variant: inviteWarning ? "default" : "success",
        title: action === "approve" ? "Application Approved" : "Application Rejected",
        description:
          action === "approve"
            ? inviteWarning
              ? `Approved, but the invite needs attention: ${inviteWarning}`
              : `${reviewDialog.app.first_name} ${reviewDialog.app.last_name} has been approved and invited to the portal.`
            : `${reviewDialog.app.first_name} ${reviewDialog.app.last_name}'s application has been rejected.`,
      });

      setReviewDialog({ open: false });
      setReviewNotes("");
      await loadApplications();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  function openReviewDialog(app: Application, action: "approve" | "reject") {
    setSelectedApp(app);
    setReviewNotes("");
    setReviewDialog({ open: true, app, action });
  }

  function openDetailDialog(app: Application) {
    setSelectedApp(app);
    setDetailDialogOpen(true);
  }

  function ApplicationCard({ app }: { app: Application }) {
    return (
      <div className="border border-border rounded-lg bg-white hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-rotary-blue/10 flex items-center justify-center font-bold text-rotary-blue flex-shrink-0">
                {app.first_name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-charcoal">{app.first_name} {app.last_name}</p>
                <p className="text-xs text-pewter truncate">{app.email}</p>
                {app.phone && <p className="text-xs text-pewter">{app.phone}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge status={app.status} />
              <span className="text-xs text-pewter">
                {new Date(app.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {app.occupation && (
            <p className="text-sm text-pewter mt-3">
              {app.occupation}{app.company ? ` at ${app.company}` : ""}
            </p>
          )}

          {app.why_join && (
            <p className="text-sm text-charcoal mt-2 line-clamp-2">
              <span className="font-medium">Why join:</span> {app.why_join}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDetailDialog(app)}
            >
              <Eye className="h-4 w-4 mr-1" /> View Details
            </Button>

            {!app.reviewed_by && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => openReviewDialog(app, "reject")}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => openReviewDialog(app, "approve")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            )}

            {app.reviewed_by && (
              <span className="text-xs text-pewter">
                Reviewed {new Date(app.reviewed_at!).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Membership Applications</h1>
          <p className="text-sm text-pewter">Review and manage membership inquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadApplications} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
        <Input
          className="pl-9"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Pending Review ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-1.5">
            <CheckCheck className="h-4 w-4" /> Reviewed ({reviewedApps.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> All ({filtered.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Pending Applications
                {pendingApps.length > 0 && (
                  <Badge className="bg-rotary-gold text-black">{pendingApps.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-pewter text-center py-6">Loading...</p>
              ) : pendingApps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-charcoal font-medium">All caught up!</p>
                  <p className="text-sm text-pewter">No pending applications to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApps.map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reviewed Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-pewter text-center py-6">Loading...</p>
              ) : reviewedApps.length === 0 ? (
                <p className="text-sm text-pewter text-center py-6">No reviewed applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviewedApps.map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <p className="text-sm text-pewter text-center py-6">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-pewter text-center py-6">No applications found.</p>
              ) : (
                <div className="space-y-4">
                  {filtered.map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedApp ? new Date(selectedApp.created_at).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">First Name</Label>
                  <p className="text-charcoal font-medium">{selectedApp.first_name}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Last Name</Label>
                  <p className="text-charcoal font-medium">{selectedApp.last_name}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Email</Label>
                  <p className="text-charcoal">{selectedApp.email}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Phone</Label>
                  <p className="text-charcoal">{selectedApp.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Date of Birth</Label>
                  <p className="text-charcoal">{selectedApp.date_of_birth ? new Date(selectedApp.date_of_birth).toLocaleDateString() : "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Occupation</Label>
                  <p className="text-charcoal">{selectedApp.occupation || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Company</Label>
                  <p className="text-charcoal">{selectedApp.company || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Education</Label>
                  <p className="text-charcoal">{selectedApp.education || "Not provided"}</p>
                </div>
              </div>

              {selectedApp.why_join && (
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Why do you want to join?</Label>
                  <p className="text-charcoal mt-1">{selectedApp.why_join}</p>
                </div>
              )}

              {selectedApp.how_heard && (
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">How did you hear about us?</Label>
                  <p className="text-charcoal mt-1">{selectedApp.how_heard}</p>
                </div>
              )}

              {selectedApp.social_links && Object.keys(selectedApp.social_links).length > 0 && (
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Social Links</Label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(selectedApp.social_links).map(([platform, url]) => (
                      <p key={platform} className="text-charcoal">
                        <span className="capitalize">{platform}:</span> {url}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.additional_answers && Object.keys(selectedApp.additional_answers).length > 0 && (
                <div>
                  <Label className="text-pewter text-xs uppercase tracking-wide">Additional Information</Label>
                  <div className="mt-1 space-y-2">
                    {Object.entries(selectedApp.additional_answers).map(([question, answer]) => (
                      <div key={question}>
                        <p className="text-sm text-pewter">{question}</p>
                        <p className="text-charcoal">{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-pewter text-xs uppercase tracking-wide">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedApp.status} />
                    </div>
                  </div>
                  {selectedApp.reviewed_by && (
                    <div className="text-right">
                      <Label className="text-pewter text-xs uppercase tracking-wide">Reviewed</Label>
                      <p className="text-charcoal text-sm">
                        {new Date(selectedApp.reviewed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedApp.admin_notes && (
                  <div className="mt-4">
                    <Label className="text-pewter text-xs uppercase tracking-wide">Review Notes</Label>
                    <p className="text-charcoal mt-1">{selectedApp.admin_notes}</p>
                  </div>
                )}
              </div>

              {!selectedApp.reviewed_by && (
                <div className="flex gap-2 justify-end border-t border-border pt-4">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      openReviewDialog(selectedApp, "reject");
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      openReviewDialog(selectedApp, "approve");
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={reviewDialog.open} onOpenChange={(open) => !open && setReviewDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewDialog.action === "approve" ? "Approve Application" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewDialog.action === "approve"
                ? `Are you sure you want to approve ${reviewDialog.app?.first_name} ${reviewDialog.app?.last_name}'s membership application?`
                : `Are you sure you want to reject ${reviewDialog.app?.first_name} ${reviewDialog.app?.last_name}'s membership application?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="review-notes" className="text-charcoal">Review Notes (optional)</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about your decision..."
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewDialog({ open: false })}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reviewDialog.action && handleReview(reviewDialog.action)}
              className={reviewDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {reviewDialog.action === "approve" ? (
                <><CheckCircle className="h-4 w-4 mr-1" /> Approve</>
              ) : (
                <><XCircle className="h-4 w-4 mr-1" /> Reject</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
