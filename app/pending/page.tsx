import { createServerClient } from "@/lib/db/server";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, CheckCircle, Mail, ArrowRight } from "lucide-react";

export const metadata = { title: "Application Pending" };

export default async function PendingPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const supabase = await createServerClient() as any;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("user_id", session.user.id)
    .single();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("is_active", true);

  const ROLE_HIERARCHY: Record<string, number> = {
    super_admin: 0, admin: 1, president: 2, secretary: 3,
    public_image_director: 4, membership_director: 5,
    project_director: 6, event_manager: 7, board_member: 8,
    member: 9, applicant: 10, public: 11,
  };

  const roleNames = roles?.map((r: any) => r.role) ?? [];
  const highestRole = roleNames.length
    ? roleNames.reduce((min: string, r: string) =>
        (ROLE_HIERARCHY[r] ?? 99) < (ROLE_HIERARCHY[min] ?? 99) ? r : min,
        roleNames[0])
    : "applicant";

  const isAdmin = ROLE_HIERARCHY[highestRole] <= ROLE_HIERARCHY["board_member"];
  const isMember = highestRole === "member";

  if (isAdmin) return redirect("/admin");
  if (isMember) return redirect("/member");

  const firstName = profile?.first_name || "there";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full bg-rotary-blue flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Rotaract Club</h1>
        </div>

        <Card className="border-rotary-gold/30 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-rotary-gold/10 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-rotary-gold" />
            </div>
            <h2 className="text-xl font-bold text-charcoal mb-2">
              Hi {firstName}, your application is under review
            </h2>
            <p className="text-pewter mb-6">
              Thank you for applying to join our Rotaract club. Our membership team will review your application and get in touch shortly.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Application submitted</p>
                  <p className="text-xs text-pewter">Your account has been created</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-rotary-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Awaiting admin review</p>
                  <p className="text-xs text-pewter">An admin will approve your membership</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 text-pewter mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal opacity-50">Access member portal</p>
                  <p className="text-xs text-pewter">Once approved, you&apos;ll have full access</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-pewter mb-6">
              Registered as: <strong className="text-charcoal">{profile?.email}</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" /> Contact Us
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">View Website</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-pewter mt-6">
          Not you?{" "}
          <Link href="/api/auth/signout" className="text-rotary-blue hover:underline">
            Sign out
          </Link>
        </p>
      </div>
    </div>
  );
}
