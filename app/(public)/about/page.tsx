import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, GraduationCap, ArrowRight, Briefcase, Building2 } from "lucide-react";

export const metadata = {
  title: "About Rotaract",
  description: "Learn about Rotaract — a global program of Rotary International for young leaders ages 18-30.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About Rotaract</h1>
          <p className="text-lg text-white/80 max-w-3xl">
            Rotaract brings together people ages 18-30 to exchange ideas with leaders in the community,
            develop management and leadership skills, and explore the opportunity to serve people in need.
          </p>
        </div>
      </section>

      {/* What is Rotaract */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-charcoal mb-4">What is Rotaract?</h2>
              <p className="text-pewter leading-relaxed mb-4">
                Rotaract is a global service organization for young adults, sponsored by Rotary International.
                The name &quot;Rotaract&quot; represents <strong className="text-charcoal">Rotary in Action</strong> — and that&apos;s exactly what members do.
              </p>
              <p className="text-pewter leading-relaxed mb-4">
                Founded in 1968, Rotaract has grown to more than 15,000 clubs in 184 countries and
                geographic areas, with over 450,000 members worldwide.
              </p>
              <p className="text-pewter leading-relaxed">
                Rotaract clubs are community service clubs for young women and men. Each club is
                sponsored by a local Rotary club which serves as a mentor and guide. Rotaract members
                (called Rotaractors) develop leadership skills while making a real difference in their communities.
              </p>
            </div>
            <div className="bg-gradient-to-br from-rotary-blue/5 to-azure/5 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-rotary-blue">184+</div>
                  <div className="text-sm text-pewter">Countries & Areas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rotary-blue">15,000+</div>
                  <div className="text-sm text-pewter">Clubs Worldwide</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rotary-blue">450,000+</div>
                  <div className="text-sm text-pewter">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rotary-blue">1968</div>
                  <div className="text-sm text-pewter">Year Founded</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Mission & Values</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              Rotaract is built on the foundation of Rotary&apos;s Four-Way Test and the motto &quot;Service Above Self.&quot;
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "Service", desc: "We serve others through meaningful projects that address community needs." },
              { icon: Users, title: "Fellowship", desc: "We build lasting friendships through shared experiences and mutual support." },
              { icon: GraduationCap, title: "Development", desc: "We develop leadership skills and professional excellence." },
              { icon: Globe, title: "International Understanding", desc: "We promote peace and understanding across cultures and borders." },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-lg p-6 border border-border">
                <value.icon className="h-8 w-8 text-rotary-blue mb-4" />
                <h3 className="font-semibold text-charcoal mb-2">{value.title}</h3>
                <p className="text-sm text-pewter">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Five Avenues of Service */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Five Avenues of Service</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              Rotary&apos;s ideal of service is based on the Five Avenues of Service — Club, Vocational, Community, International and New Generations — that comprise Rotary International&apos;s philosophical cornerstone.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, name: "Club Service", desc: "Strengthening fellowship and ensuring effective club functioning through member engagement, training, and social activities that build genuine bonds among members." },
              { icon: Briefcase, name: "Vocational Service", desc: "Promoting high ethical standards and encouraging members to serve others through their vocations, education, skills, and expertise." },
              { icon: Heart, name: "Community Service", desc: "Improving the quality of life in our community through service projects that address local needs and create lasting positive change." },
              { icon: Globe, name: "International Service", desc: "Expanding humanitarian efforts worldwide, promoting global understanding and peace through cross-border partnerships and projects." },
              { icon: Users, name: "New Generations Service", desc: "Engaging youth and young adults in leadership roles through programs like Rotaract, Interact, and Rotary Youth Leadership Awards (RYLA)." },
            ].map((avenue) => (
              <div key={avenue.name} className="p-6 rounded-lg border border-border bg-white hover:shadow-md transition-shadow">
                <avenue.icon className="h-8 w-8 text-rotary-blue mb-4" />
                <h3 className="font-semibold text-charcoal mb-2">{avenue.name}</h3>
                <p className="text-sm text-pewter">{avenue.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/avenues-of-service">
                Explore Avenues <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Connection to Rotary */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Connection to Rotary</h2>
            <p className="text-pewter leading-relaxed mb-6">
              Rotaract is an official program of Rotary International. Every Rotaract club is sponsored by
              at least one Rotary club, which provides guidance, mentorship, and support. This relationship
              ensures that Rotaract clubs are connected to the broader Rotary network and its 1.4 million members worldwide.
            </p>
            <p className="text-pewter leading-relaxed">
              Rotaractors are encouraged to become members of Rotary as they advance in their careers,
              creating a pipeline of engaged young leaders who carry forward the spirit of service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild className="bg-rotary-blue hover:bg-rotary-blue/90">
                <Link href="/about/rotary">Learn About Rotary</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/join">Join Rotaract</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
