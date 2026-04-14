import { Suspense } from "react";
import Link from "next/link";
import { getProjects, getAvenues } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FolderKanban, ArrowRight, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Our Projects",
  description: "Explore the impactful projects our Rotaract club has undertaken to serve the community.",
};

async function ProjectsGrid({ searchParams }: { searchParams: { status?: string; avenue?: string } }) {
  const status = searchParams.status;
  const avenueId = searchParams.avenue;
  const projects = await getProjects({ status, avenueId });
  const avenues = await getAvenues();

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderKanban className="h-12 w-12 text-pewter mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">No projects found</h3>
        <p className="text-pewter">Check back later for upcoming projects.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/projects"
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !status && !avenueId
              ? "bg-rotary-blue text-white border-rotary-blue"
              : "border-border text-charcoal hover:border-rotary-blue"
          }`}
        >
          All
        </Link>
        {["active", "completed", "planned"].map((s) => (
          <Link
            key={s}
            href={`/projects?status=${s}`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize ${
              status === s
                ? "bg-rotary-blue text-white border-rotary-blue"
                : "border-border text-charcoal hover:border-rotary-blue"
            }`}
          >
            {s}
          </Link>
        ))}
        {avenues.map((a) => (
          <Link
            key={a.id}
            href={`/projects?avenue=${a.id}`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              avenueId === a.id
                ? "bg-rotary-blue text-white border-rotary-blue"
                : "border-border text-charcoal hover:border-rotary-blue"
            }`}
          >
            {a.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="h-48 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative overflow-hidden">
              {project.images?.find((img: any) => img.is_primary)?.image_url ? (
                <img
                  src={project.images.find((img: any) => img.is_primary)?.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <FolderKanban className="h-12 w-12 text-rotary-blue/30" />
              )}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"}
                >
                  {project.status}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <h3 className="font-semibold text-charcoal group-hover:text-rotary-blue transition-colors line-clamp-1">
                <Link href={`/projects/${project.slug}`}>{project.title}</Link>
              </h3>
              {project.avenue && (
                <Badge variant="outline" className="text-xs">
                  {project.avenue.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-pewter line-clamp-2">{project.description}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-xs text-pewter">
              <div className="flex items-center gap-3">
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </span>
                )}
                {project.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(project.start_date)}
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage({ searchParams }: { searchParams: { status?: string; avenue?: string } }) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Discover the initiatives and projects through which our members create lasting impact in our community and beyond.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }
          >
            <ProjectsGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">Want to Get Involved?</h2>
          <p className="text-pewter mb-6 max-w-xl mx-auto">
            Join us as a volunteer and help make a difference through our projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/join">
                Join Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
