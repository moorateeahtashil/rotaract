import Link from "next/link";
import { Button } from "@/components/ui/button";
import MembershipForm from "@/components/join/membership-form";
import { CheckCircle, Users, Heart, Globe, GraduationCap, ArrowRight, Calendar } from "lucide-react";

export const metadata = {
  title: "Join Our Club",
  description: "Become a member of our Rotaract club and start making a difference in your community.",
};

const BENEFITS = [
  { icon: Users, title: "Leadership Development", desc: "Build leadership skills through hands-on experience, committee work, and board positions." },
  { icon: Heart, title: "Community Impact", desc: "Make a real difference through service projects that address local needs." },
  { icon: Globe, title: "Global Network", desc: "Connect with 200,000+ Rotaractors across 109 countries worldwide." },
  { icon: GraduationCap, title: "Professional Growth", desc: "Develop skills through workshops, conferences, and mentorship opportunities." },
];

const STEPS = [
  { step: 1, title: "Submit Inquiry", desc: "Fill out the form below or attend one of our meetings." },
  { step: 2, title: "Orientation Meeting", desc: "Meet with our membership director to learn more about Rotaract." },
  { step: 3, title: "Application Review", desc: "Your application is reviewed by our board members." },
  { step: 4, title: "Welcome & Induction", desc: "Join the club and start making an impact in the community!" },
];

const FAQS = [
  { q: "Who can join Rotaract?", a: "Rotaract is open to young people ages 18-30 who are interested in community service and leadership development." },
  { q: "Is there a membership fee?", a: "Most clubs have a nominal fee that covers Rotary International dues and club activities. Contact us for specific details." },
  { q: "How often do you meet?", a: "We typically meet bi-weekly, with additional project meetings and social events throughout the month." },
  { q: "Do I need to be a student?", a: "No, Rotaract is open to both students and young professionals." },
  { q: "What is the time commitment?", a: "We recommend attending at least one meeting per month and participating in a few projects per year." },
];

export default function JoinPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Club</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Become part of a global movement of young leaders creating positive change in communities worldwide.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Why Join Rotaract?</h2>
            <p className="text-pewter max-w-2xl mx-auto">
              Rotaract offers unique opportunities for personal growth, community impact, and global connection.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center p-6 rounded-lg border border-border bg-white">
                <div className="h-12 w-12 rounded-full bg-rotary-blue/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-rotary-blue" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">{benefit.title}</h3>
                <p className="text-sm text-pewter">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Membership Process</h2>
            <p className="text-pewter max-w-2xl mx-auto">Four simple steps to becoming a member.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-rotary-gold text-black font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold text-charcoal mb-1">{s.title}</h3>
                <p className="text-sm text-pewter">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal mb-6 text-center">Eligibility & Expectations</h2>
            <div className="space-y-4">
              {[
                "Be between 18-30 years of age",
                "Have a genuine interest in community service",
                "Be willing to attend meetings and participate in projects",
                "Uphold the values and principles of Rotaract",
                "Be open to leadership development and personal growth",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Submit Your Inquiry</h2>
            <p className="text-pewter max-w-xl mx-auto">
              Fill out the form below and our membership director will reach out to you.
            </p>
          </div>
          <MembershipForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-2">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group border border-border rounded-lg bg-white [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-charcoal font-medium hover:bg-gray-50 rounded-lg">
                  <span>{faq.q}</span>
                  <span className="shrink-0 text-pewter transition duration-300 group-open:-rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-pewter leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-rotary-blue to-azure text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Take the First Step?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Book an orientation meeting or attend our next club meeting to learn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rotary-gold text-black hover:bg-rotary-gold/90">
              <Link href="/contact">
                <Calendar className="mr-2 h-4 w-4" />
                Book a Meeting
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
