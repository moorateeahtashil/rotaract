import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getFeaturedProjects } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Users, ArrowLeft, ArrowRight, FolderKanban } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.seo_title || project.title,
    description: project.seo_description || project.description,
    openGraph: {
      title: project.seo_title || project.title,
      description: project.seo_description || project.description,
      images: project.og_image_url ? [{ url: project.og_image_url }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getFeaturedProjects(3);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] bg-charcoal overflow-hidden">
        {project.images?.find((img: any) => img.is_primary)?.image_url ? (
          <img
            loading="lazy"
            decoding="async"
            src={project.images.find((img: any) => img.is_primary)?.image_url}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rotary-blue to-azure" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white">
            <Link href="/projects" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-rotary-gold text-black">{project.status}</Badge>
              {project.avenue && (
                <Badge variant="outline" className="border-white/30 text-white">
                  {project.avenue.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {project.subtitle && (
                <p className="text-xl text-charcoal/80 leading-relaxed">{project.subtitle}</p>
              )}

              <div className="prose max-w-none">
                <p className="text-charcoal leading-relaxed whitespace-pre-wrap">{project.description}</p>
                {project.long_description && (
                  <div className="mt-4 text-charcoal/80 leading-relaxed whitespace-pre-wrap">
                    {project.long_description}
                  </div>
                )}
              </div>

              {/* Gallery */}
              {project.images && project.images.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-charcoal mb-4">Gallery</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.images.map((img: any) => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img.image_url} alt={img.caption || project.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {project.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-rotary-blue mt-0.5" />
                      <div>
                        <p className="font-medium text-charcoal">Location</p>
                        <p className="text-sm text-pewter">{project.location}</p>
                      </div>
                    </div>
                  )}
                  {project.start_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-rotary-blue mt-0.5" />
                      <div>
                        <p className="font-medium text-charcoal">Timeline</p>
                        <p className="text-sm text-pewter">
                          {formatDate(project.start_date)}
                          {project.end_date && ` — ${formatDate(project.end_date)}`}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.budget_amount && (
                    <div>
                      <p className="font-medium text-charcoal">Budget</p>
                      <p className="text-sm text-pewter">₹{project.budget_amount.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team */}
              {project.team && project.team.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-rotary-blue" />
                      <h3 className="font-semibold text-charcoal">Project Team</h3>
                    </div>
                    <ul className="space-y-3">
                      {project.team.map((t: any) => (
                        <li key={t.member?.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-rotary-blue/10 flex items-center justify-center text-rotary-blue text-xs font-semibold">
                            {t.member?.profile ? `${t.member.profile.first_name[0]}${t.member.profile.last_name[0]}` : "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal">
                              {t.member?.profile
                                ? `${t.member.profile.first_name} ${t.member.profile.last_name}`
                                : "Unknown"}
                            </p>
                            {t.role_in_project && (
                              <p className="text-xs text-pewter">{t.role_in_project}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <Card className="bg-rotary-blue text-white">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">Get Involved</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Want to contribute to this project?
                  </p>
                  <Button asChild className="bg-rotary-gold text-black hover:bg-rotary-gold/90 w-full">
                    <Link href="/join">
                      Volunteer <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {related.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal">Related Projects</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/projects">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related
                .filter((p: any) => p.id !== project.id)
                .slice(0, 3)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="block p-4 bg-white rounded-lg border border-border hover:border-rotary-blue/30 transition-colors"
                  >
                    <h3 className="font-medium text-charcoal mb-1 line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-pewter line-clamp-2">{p.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
