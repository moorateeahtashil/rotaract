import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata = { title: "Access Denied" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="h-20 w-20 rounded-full bg-cranberry/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="h-10 w-10 text-cranberry" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h1>
        <p className="text-pewter mb-8">
          You don't have permission to access this page. If you believe this is an error, please contact an administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
