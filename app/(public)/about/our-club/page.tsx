import { getSiteSettings } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Target, Heart, ArrowRight, Globe } from "lucide-react";

export const metadata = {
  title: "About Our Club",
  description: "Learn about our Rotaract club's history, mission, and commitment to community service.",
};

export default async function AboutOurClubPage() {
  const settings = await getSiteSettings();
  const getSetting = (key: string) => (settings as any[]).find((s: any) => s.key === key)?.value || "";

  const clubName = getSetting("club_name") || "Rotaract Club";
  const clubTagline = getSetting("club_tagline") || "Service Above Self";
  const meetingLocation = getSetting("meeting_location") || "TBD";
  const meetingDay = getSetting("meeting_day") || "Every other Monday";
  const meetingTime = getSetting("meeting_time") || "7:00 PM";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About {clubName}</h1>
          <p className="text-lg text-white/80 max-w-3xl">{clubTagline}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 border border-border">
              <Target className="h-8 w-8 text-rotary-blue mb-4" />
              <h2 className="text-xl font-bold text-charcoal mb-3">Our Mission</h2>
              <p className="text-pewter leading-relaxed">
                To empower young leaders in our community to create meaningful change through service 
                projects, professional development, and international understanding — all while building 
                lasting friendships and growing as individuals.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <Heart className="h-8 w-8 text-cranberry mb-4" />
              <h2 className="text-xl font-bold text-charcoal mb-3">Our Vision</h2>
              <p className="text-pewter leading-relaxed">
                To be a catalyst for positive change in our community, developing the next generation 
                of leaders who are committed to service, integrity, and global understanding.
              </p>
            </div>
          </div>

          {/* Club Story */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Our Story</h2>
            <p className="text-pewter leading-relaxed mb-4">
              Our Rotaract club was chartered to bring together young professionals and students 
              who share a passion for service. As part of the global Rotaract network, we are 
              connected to over 450,000 members across 184 countries and geographic areas.
            </p>
            <p className="text-pewter leading-relaxed mb-4">
              Since our founding, we have undertaken numerous service projects addressing local 
              community needs — from education and health initiatives to environmental conservation 
              and community development. Our members have contributed thousands of service hours 
              and raised funds for causes that matter.
            </p>
            <p className="text-pewter leading-relaxed">
              Beyond service, we are a community. Our fellowship events, workshops, and leadership 
              opportunities help members grow both personally and professionally. Many of our alumni 
              have gone on to leadership roles in Rotary and their respective fields.
            </p>
          </div>
        </div>
      </section>

      {/* Meeting Details */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-8">Meeting Details</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-border">
                <Calendar className="h-8 w-8 text-rotary-blue mx-auto mb-3" />
                <h3 className="font-semibold text-charcoal mb-1">When</h3>
                <p className="text-sm text-pewter">{meetingDay}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <Clock className="h-8 w-8 text-rotary-blue mx-auto mb-3" />
                <h3 className="font-semibold text-charcoal mb-1">Time</h3>
                <p className="text-sm text-pewter">{meetingTime}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-border">
                <MapPin className="h-8 w-8 text-rotary-blue mx-auto mb-3" />
                <h3 className="font-semibold text-charcoal mb-1">Where</h3>
                <p className="text-sm text-pewter">{meetingLocation}</p>
              </div>
            </div>
            <p className="text-sm text-pewter mt-6">
              Visitors and prospective members are always welcome. Come see what we're about!
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">What We Do</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              Our club engages in a variety of activities that serve the community and develop our members.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Service Projects", desc: "Hands-on projects addressing community needs in education, health, environment, and more." },
              { icon: Users, title: "Fellowship", desc: "Social events, dinners, and recreational activities that build lasting friendships." },
              { icon: Target, title: "Professional Development", desc: "Workshops, skill-building sessions, and networking opportunities for career growth." },
              { icon: Globe, title: "International Service", desc: "Global partnerships and exchanges that promote cross-cultural understanding." },
              { icon: Calendar, title: "Community Events", desc: "Organizing and participating in community-wide events and awareness campaigns." },
              { icon: Users, title: "Leadership Training", desc: "Developing the next generation of community and organizational leaders." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-lg p-6 border border-border">
                <item.icon className="h-7 w-7 text-rotary-blue mb-3" />
                <h3 className="font-semibold text-charcoal mb-2">{item.title}</h3>
                <p className="text-sm text-pewter">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* District Info */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal mb-4">District Information</h2>
            <p className="text-pewter leading-relaxed mb-4">
              Our club is part of the Rotary International district structure. Districts provide 
              support, training, and resources to clubs and their members. They organize district-level 
              conferences, training events, and service initiatives.
            </p>
            <p className="text-pewter leading-relaxed">
              Through the district, we connect with other Rotaract and Rotary clubs, participate 
              in district-wide projects, and access the full network of Rotary resources and support.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-rotary-blue to-azure text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Come to Our Next Meeting</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            The best way to learn about us is to experience it firsthand. You're always welcome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/join">
                Join Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
