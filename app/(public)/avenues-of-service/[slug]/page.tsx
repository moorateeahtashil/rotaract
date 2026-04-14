import { notFound } from "next/navigation";
import Link from "next/link";
import { getAvenueBySlug, getProjects, getEvents } from "@/lib/db/queries";
import { getAvenues } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FolderKanban, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const avenue = await getAvenueBySlug(params.slug);
  if (!avenue) return { title: "Avenue Not Found" };
  return {
    title: avenue.name,
    description: avenue.description,
  };
}

export default async function AvenueDetailPage({ params }: { params: { slug: string } }) {
  const avenue = await getAvenueBySlug(params.slug);
  if (!avenue) notFound();

  const [projects, events, allAvenues] = await Promise.all([
    getProjects({ avenueId: avenue.id, limit: 6 }),
    getEvents({ avenueId: avenue.id, limit: 4 }),
    getAvenues(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-[40vh] min-h-[300px] overflow-hidden"
        style={{ backgroundColor: avenue.color_hex || "#17458f" }}
      >
        {avenue.image_url && (
          <img src={avenue.image_url} alt={avenue.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="text-white">
            <Link href="/avenues-of-service" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Avenues
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">{avenue.name}</h1>
            <p className="text-lg text-white/80 max-w-2xl">{avenue.description}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {avenue.long_description && (
                <div className="prose max-w-none">
                  <p className="text-charcoal leading-relaxed whitespace-pre-wrap">{avenue.long_description}</p>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-rotary-blue" />
                    Projects
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {projects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className="block p-4 bg-white rounded-lg border border-border hover:border-rotary-blue/30 transition-colors"
                      >
                        <h3 className="font-medium text-charcoal mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-pewter line-clamp-2">{project.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{project.status}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {events.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-rotary-blue" />
                    Events
                  </h2>
                  <div className="space-y-3">
                    {events.map((event: any) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="block p-4 bg-white rounded-lg border border-border hover:border-rotary-blue/30 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium text-charcoal">{event.title}</h3>
                          <p className="text-sm text-pewter">{formatDate(event.date)}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-pewter" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Other Avenues */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-charcoal">Other Avenues</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allAvenues
                    .filter((a: any) => a.id !== avenue.id)
                    .map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/avenues-of-service/${a.slug}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-charcoal">{a.name}</p>
                        <p className="text-xs text-pewter line-clamp-1">{a.description}</p>
                      </Link>
                    ))}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-rotary-blue text-white">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">Get Involved</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Join us in making an impact through this avenue.
                  </p>
                  <Button asChild className="bg-rotary-gold text-black hover:bg-rotary-gold/90 w-full">
                    <Link href="/join">
                      Join Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
