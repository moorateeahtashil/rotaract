import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-rotary-blue animate-spin mx-auto mb-4" />
        <p className="text-pewter text-sm">Loading...</p>
      </div>
    </div>
  );
}
