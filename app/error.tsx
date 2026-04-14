"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-cranberry mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-charcoal mb-2">
          Something Went Wrong
        </h1>
        <p className="text-pewter mb-2">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-smoke mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
