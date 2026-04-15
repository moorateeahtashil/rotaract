import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getHomepageSections, getFeaturedProjects, getUpcomingEvents, getBoardMembers, getPosts, getSponsorClub, getSiteSettings, getRotaryHighlights } from "@/lib/db/queries";
import { ArrowRight, Users, Calendar, Heart, MapPin, Clock, Rss, Globe, FolderKanban, Sparkles } from "lucide-react";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchRotaryRSSFeed, formatRSSDate, type RotaryNewsItem } from "@/lib/utils/rss-parser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home",
};

// ─── HERO SECTION ───
function HeroSection({ section, tagline, clubName, heroBannerUrl }: { section: any; tagline?: string; clubName?: string; heroBannerUrl?: string }) {
  const bannerImage = heroBannerUrl || section?.image_url;
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-rotary-gold/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-sky-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {bannerImage && (
        <img src={bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-rotary-blue/40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{tagline || "Service Above Self"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            {clubName || "Empowering Young Leaders"}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl">
            {tagline || section?.body || "Join a global network of 1.4 million members creating lasting change through community service, fellowship, and professional development."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {section?.cta_label && (
              <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90 font-semibold px-8 h-12">
                <Link href={section.cta_href || "/join"}>
                  {section.cta_label} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            {!section?.cta_label && (
              <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90 font-semibold px-8 h-12">
                <Link href="/join">Join Us <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            )}
            {section?.secondary_cta_label && (
              <Button asChild size="lg" className="bg-white text-rotary-blue hover:bg-white/90 font-semibold px-8 h-12">
                <Link href={section.secondary_cta_href || "/projects"}>{section.secondary_cta_label}</Link>
              </Button>
            )}
            {!section?.secondary_cta_label && (
              <Button asChild size="lg" className="bg-white text-rotary-blue hover:bg-white/90 font-semibold px-8 h-12">
                <Link href="/about">Learn More</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── UPCOMING EVENTS ───
async function UpcomingEventsSection({ section }: { section: any }) {
  const events = await getUpcomingEvents(3);
  if (events.length === 0) return null; // Hide if empty

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">{section?.title || "Upcoming Events"}</h2>
            {section?.subtitle && <p className="text-pewter mt-2">{section.subtitle}</p>}
          </div>
          <Button asChild variant="outline" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5">
            <Link href="/events">View All Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-200 border-border/50 group">
              <div className="h-44 bg-gradient-to-br from-rotary-blue/20 via-azure/15 to-rotary-blue/20 flex items-center justify-center relative">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Calendar className="h-14 w-14 text-rotary-blue/30" />
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <p className="text-xs font-bold text-rotary-blue">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {event.is_featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-rotary-gold text-black text-xs">Featured</Badge>
                  </div>
                )}
              </div>
              <CardContent className="pt-4 pb-4">
                <h3 className="font-bold text-charcoal mb-1.5 line-clamp-1 group-hover:text-rotary-blue transition-colors">{event.title}</h3>
                <p className="text-sm text-pewter mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-pewter flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(event.date)}
                  </span>
                  <Button asChild size="sm" variant="outline" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5">
                    <Link href={`/events/${event.slug}`}>Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Hardcoded Five Avenues of Service
const HARDCODED_AVENUES = [
  { slug: "club-service", name: "Club Service", description: "Strengthen the club through member development, fellowship, and leadership.", icon: "🤝" },
  { slug: "community-service", name: "Community Service", description: "Address local needs through hands-on projects in education, health, and environment.", icon: "❤️" },
  { slug: "international-service", name: "International Service", description: "Foster international understanding, peace, and goodwill across borders.", icon: "🌍" },
  { slug: "professional-development", name: "Professional Development", description: "Grow careers, leadership skills, and apply professional expertise in service.", icon: "💼" },
  { slug: "service-to-clubs", name: "Service to Clubs", description: "Strengthen relationships with Rotary clubs and the broader Rotaract network.", icon: "🌐" },
];

// ─── AVENUES ───
function AvenuesSection({ section }: { section: any }) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal mb-3">{section?.title || "Avenues of Service"}</h2>
          {section?.subtitle ? (
            <p className="text-pewter mt-2 max-w-2xl mx-auto">{section.subtitle}</p>
          ) : (
            <p className="text-pewter mt-2 max-w-2xl mx-auto">
              Five pathways through which Rotaractors serve their communities and grow as leaders
            </p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HARDCODED_AVENUES.map((avenue) => (
            <Link
              key={avenue.slug}
              href={`/avenues-of-service/${avenue.slug}`}
              className="group p-6 rounded-xl border-2 border-border/50 hover:border-rotary-blue/40 hover:shadow-xl transition-all duration-200 bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center flex-shrink-0 group-hover:from-rotary-blue/20 group-hover:to-azure/20 transition-colors">
                  <span className="text-2xl">{avenue.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-charcoal mb-1 group-hover:text-rotary-blue transition-colors truncate">
                    {avenue.name}
                  </h3>
                  <p className="text-sm text-pewter line-clamp-2 leading-relaxed">{avenue.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED PROJECTS ───
async function FeaturedProjectsSection({ section }: { section: any }) {
  const projects = await getFeaturedProjects(3);
  if (projects.length === 0) return null; // Hide if empty

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">{section?.title || "Featured Projects"}</h2>
            {section?.subtitle && <p className="text-pewter mt-1">{section.subtitle}</p>}
          </div>
          <Button asChild variant="outline" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5">
            <Link href="/projects">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="block h-full">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 border-border/50 h-full group">
                <div className="h-44 bg-gradient-to-br from-rotary-blue/15 via-azure/10 to-turquoise/15 flex items-center justify-center">
                  <FolderKanban className="h-12 w-12 text-rotary-blue/25" />
                </div>
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-bold text-charcoal mb-1.5 line-clamp-1 group-hover:text-rotary-blue transition-colors">{project.title}</h3>
                  <p className="text-sm text-pewter mb-3 line-clamp-2 leading-relaxed">{project.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-medium capitalize">{project.status}</Badge>
                    {project.avenue && (
                      <Badge variant="outline" className="text-xs">{project.avenue.name}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BOARD PREVIEW ───
async function BoardPreviewSection({ section }: { section: any }) {
  const boardMembers = await getBoardMembers({ current: true });
  if (boardMembers.length === 0) return null; // Hide if empty

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">{section?.title || "Our Leadership"}</h2>
            {section?.subtitle && <p className="text-pewter mt-1">{section.subtitle}</p>}
          </div>
          <Button asChild variant="outline" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5">
            <Link href="/leadership">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {boardMembers.slice(0, 5).map((bm: any) => {
            const profile = bm.member?.profile;
            const name = profile ? `${profile.first_name} ${profile.last_name}` : "Unknown";
            return (
              <div key={bm.id} className="text-center group">
                <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-border group-hover:ring-rotary-blue/30 transition-colors">
                  <AvatarImage src={bm.photo_url || profile?.avatar_url || ""} alt={name} />
                  <AvatarFallback className="bg-gradient-to-br from-rotary-blue to-azure text-white font-bold text-lg">
                    {profile ? getInitials(profile.first_name, profile.last_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-sm font-bold text-charcoal line-clamp-1 mb-0.5">{name}</h3>
                <p className="text-xs text-pewter font-medium">{bm.custom_title || bm.position?.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── NEWS PREVIEW ───
async function NewsPreviewSection({ section }: { section: any }) {
  const rotaryNews = await fetchRotaryRSSFeed(20);

  const rotaryItems = rotaryNews.map((item: RotaryNewsItem) => ({
    title: item.title,
    link: item.link,
    description: item.description,
    date: item.pubDate,
    imageUrl: item.imageUrl,
    source: item.source,
    isLocal: false,
  }));

  if (rotaryItems.length === 0) return null; // Hide if empty

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">{section?.title || "News & Updates"}</h2>
            {section?.subtitle ? (
              <p className="text-pewter mt-1">{section.subtitle}</p>
            ) : (
              <p className="text-pewter mt-1">
                Latest news from Rotary International
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5 whitespace-nowrap h-9">
              <Link href="https://www.rotary.org/en/news" target="_blank" rel="noopener noreferrer">
                <Rss className="mr-1.5 h-3.5 w-3.5" /> Rotary News
              </Link>
            </Button>
          </div>
        </div>

        {/* Horizontally scrollable Rotary news cards */}
        <div className="px-6">
          <HorizontalScroll>
            {rotaryItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start flex-shrink-0 w-72 sm:w-80"
              >
                <Card className="hover:shadow-lg transition-shadow h-full group border-border">
                  <div className="relative bg-gradient-to-br from-rotary-blue/10 to-azure/10">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full aspect-video object-contain" />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center">
                        <Globe className="h-10 w-10 text-rotary-blue/30" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 text-xs bg-rotary-blue text-white">
                      Rotary International
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-charcoal mb-2 line-clamp-2 group-hover:text-rotary-blue transition-colors">{item.title}</h3>
                    <p className="text-xs text-pewter mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-pewter">{formatRSSDate(item.date)}</span>
                      <ArrowRight className="h-4 w-4 text-rotary-blue group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </HorizontalScroll>
        </div>
      </div>
    </section>
  );
}

// ─── WHAT IS ROTARY? ───
async function WhatIsRotarySection() {
  const highlights = await getRotaryHighlights();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rotary-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-blue rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Since 1905</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">What is Rotary?</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            Rotary International is a global network of <strong className="text-white">1.4 million members</strong> across{" "}
            <strong className="text-white">46,000+ clubs</strong> in <strong className="text-white">200+ countries</strong> —{" "}
            united by a belief in the power of service to create lasting change.
          </p>
        </div>

        {/* Horizontally scrollable highlight cards */}
        {highlights.length > 0 && (
          <div className="px-6">
            <HorizontalScroll>
              {highlights.map((h: any) => (
                <div
                  key={h.id}
                  className="snap-start flex-shrink-0 w-64 sm:w-72 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-colors duration-200"
                >
                  {h.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.image_url}
                      alt={h.title}
                      className="w-full aspect-video object-contain bg-white/5"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-white/5 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-white text-lg mb-2">{h.title}</h3>
                    {h.body && (
                      <p className="text-white/70 text-sm leading-relaxed">{h.body}</p>
                    )}
                  </div>
                </div>
              ))}
            </HorizontalScroll>
          </div>
        )}

        {/* Footer links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Button asChild className="bg-rotary-gold text-black hover:bg-rotary-gold/90 font-semibold px-6">
            <Link href="/about/rotary">
              Explore Rotary History <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="bg-white text-rotary-blue hover:bg-white/90 font-semibold px-6">
            <Link href="https://www.rotary.org/en" target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" /> Visit Rotary.org
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── GET INVOLVED ───
function GetInvolvedSection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">Get Involved</h2>
          <p className="text-pewter max-w-2xl mx-auto">
            There are many ways to take action and support our mission of Service Above Self
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="overflow-hidden hover:shadow-xl transition-shadow border-border/50">
            <CardContent className="pt-6">
              <Users className="h-10 w-10 text-rotary-blue mb-4" />
              <h3 className="text-xl font-bold text-charcoal mb-2">Join Our Club</h3>
              <p className="text-pewter mb-6 leading-relaxed">Become part of a global network of young leaders creating positive change</p>
              <Button asChild className="w-full bg-rotary-blue hover:bg-rotary-blue/90">
                <Link href="/join">
                  Apply for Membership <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow border-border/50">
            <CardContent className="pt-6">
              <Heart className="h-10 w-10 text-rotary-blue mb-4" />
              <h3 className="text-xl font-bold text-charcoal mb-2">Volunteer</h3>
              <p className="text-pewter mb-6 leading-relaxed">Join our service projects and make a direct impact in your community</p>
              <Button asChild className="w-full bg-rotary-blue hover:bg-rotary-blue/90">
                <Link href="/projects">
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── SPONSOR SECTION ───
async function SponsorSection({ section }: { section: any }) {
  const sponsors = await getSponsorClub();
  if (sponsors.length === 0) return null; // Hide if empty

  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-4">{section?.title || "Our Sponsor Club"}</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {sponsors.map((s: any) => (
            <div key={s.id} className="bg-white rounded-lg p-6 border border-border max-w-xs">
              <h3 className="font-semibold text-charcoal mb-1">{s.name}</h3>
              {s.description && <p className="text-sm text-pewter line-clamp-2">{s.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ───
function CTASection({ section }: { section: any }) {
  return (
    <section className="py-20 bg-gradient-to-r from-rotary-blue to-azure text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{section?.title || "Ready to Make a Difference?"}</h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          {section?.body || "Join a global network of young leaders committed to creating positive change in their communities."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90 font-semibold px-8">
            <Link href={section?.cta_href || "/join"}>{section?.cta_label || "Apply for Membership"}</Link>
          </Button>
          {section?.secondary_cta_label && (
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold px-8">
              <Link href={section.secondary_cta_href || "/contact"}>{section.secondary_cta_label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── MEETING INFO ───
async function MeetingInfoSection({ section }: { section: any }) {
  const settings = await getSiteSettings();
  const getSetting = (key: string) => (settings as any[]).find((s: any) => s.key === key)?.value || "";
  const meetingDay = getSetting("meeting_day") || "Every other Monday";
  const meetingTime = getSetting("meeting_time") || "7:00 PM";
  const meetingLocation = getSetting("meeting_location") || "TBD";

  return (
    <section className="py-12 bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-border/50 p-6 shadow-sm">
            <div className="text-center mb-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rotary-blue to-azure text-white mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-charcoal">{section?.title || "Next Meeting"}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-rotary-blue" />
                </div>
                <div>
                  <p className="text-xs text-pewter font-medium uppercase tracking-wide">Day</p>
                  <p className="font-bold text-charcoal text-sm">{meetingDay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-rotary-gold/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-rotary-gold" />
                </div>
                <div>
                  <p className="text-xs text-pewter font-medium uppercase tracking-wide">Time</p>
                  <p className="font-bold text-charcoal text-sm">{meetingTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-azure/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-azure" />
                </div>
                <div>
                  <p className="text-xs text-pewter font-medium uppercase tracking-wide">Location</p>
                  <p className="font-bold text-charcoal text-sm">{meetingLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ───
export default async function HomePage() {
  const sections = await getHomepageSections();
  const settings = await getSiteSettings();
  const getS = (key: string) => (settings as any[]).find((s: any) => s.key === key)?.value || "";
  const clubName = getS("club_name") || "Rotaract Club";
  const tagline = getS("club_tagline");
  const heroBannerUrl = getS("hero_banner_url");

  // If no sections exist in DB, show default layout
  if (sections.length === 0) {
    return (
      <>
        <HeroSection section={null} tagline={tagline} clubName={clubName} heroBannerUrl={heroBannerUrl} />
        <MeetingInfoSection section={null} />
        <WhatIsRotarySection />
        <UpcomingEventsSection section={null} />
        <AvenuesSection section={null} />
        <FeaturedProjectsSection section={null} />
        <BoardPreviewSection section={null} />
        <NewsPreviewSection section={null} />
        <GetInvolvedSection />
        <SponsorSection section={null} />
        <CTASection section={null} />
      </>
    );
  }

  return (
    <>
      {sections.map((section: any) => {
        switch (section.section_type) {
          case 'hero':
            return <HeroSection key={section.id} section={section} tagline={tagline} clubName={clubName} heroBannerUrl={heroBannerUrl} />;
          case 'meeting_info':
            return <MeetingInfoSection key={section.id} section={section} />;
          case 'stats':
            return null; // Removed impact stats
          case 'upcoming_events':
            return <UpcomingEventsSection key={section.id} section={section} />;
          case 'avenues':
            return <AvenuesSection key={section.id} section={section} />;
          case 'featured_projects':
            return <FeaturedProjectsSection key={section.id} section={section} />;
          case 'board_preview':
            return <BoardPreviewSection key={section.id} section={section} />;
          case 'news_preview':
            return <NewsPreviewSection key={section.id} section={section} />;
          case 'sponsor':
            return <SponsorSection key={section.id} section={section} />;
          case 'cta':
            return <CTASection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
