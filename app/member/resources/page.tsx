import { requireMember } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, File } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Resources" };

export default async function MemberResourcesPage() {
  const guard = await requireMember();
  if ("redirect" in guard) return redirect(guard.redirectTo);

  const supabase = createServerClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .in("access_level", ["public", "member_only"])
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const fileTypeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    doc: File,
    docx: File,
    xls: File,
    xlsx: File,
    ppt: File,
    pptx: File,
  };

  function getFileIcon(fileType: string | null) {
    if (!fileType) return FileText;
    return fileTypeIcons[fileType.toLowerCase()] || FileText;
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Resources</h1>
        <p className="text-pewter mt-1">Download documents and materials</p>
      </div>

      {!resources || resources.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No resources available</h3>
            <p className="text-sm text-pewter">Check back later for new resources.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {resources.map((resource: any) => {
            const Icon = getFileIcon(resource.file_type);
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-rotary-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-pewter line-clamp-1">{resource.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-pewter">
                        {resource.file_type && <span className="uppercase">{resource.file_type}</span>}
                        {resource.file_size_bytes && <span>{formatFileSize(resource.file_size_bytes)}</span>}
                        <span>{formatDate(resource.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.access_level === "member_only" && (
                        <Badge variant="outline" className="text-xs">Members Only</Badge>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <a href={resource.file_url} download>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
