import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { RotaractLogo } from "./rotary-logo";
import { getSiteSettings } from "@/lib/db/queries";

const FOOTER_LINKS = {
  about: [
    { label: "About Rotaract", href: "/about" },
    { label: "About Rotary", href: "/about/rotary" },
    { label: "Our Club", href: "/about/our-club" },
    { label: "Leadership", href: "/leadership" },
    { label: "Members", href: "/members" },
  ],
  service: [
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "Avenues of Service", href: "/avenues-of-service" },
    { label: "News", href: "/news" },
    { label: "Gallery", href: "/gallery" },
  ],
  connect: [
    { label: "Join Us", href: "/join" },
    { label: "Contact", href: "/contact" },
    { label: "Sponsors", href: "/sponsors" },
    { label: "FAQ", href: "/faq" },
  ],
  rotary: [
    { label: "Rotary International", href: "https://www.rotary.org", external: true },
    { label: "Rotary Brand Center", href: "https://brandcenter.rotary.org", external: true },
    { label: "The Rotary Foundation", href: "https://www.rotary.org/en/ways-give/rotary-foundation", external: true },
    { label: "Rotary RSS News", href: "https://www.rotary.org/rss.xml", external: true },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

async function FooterContent() {
  const settings = await getSiteSettings();
  const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || "";
  
  const meetingDay = getSetting("meeting_day") || "Every other Monday";
  const meetingTime = getSetting("meeting_time") || "7:00 PM";
  const meetingLocation = getSetting("meeting_location") || "TBD";
  const contactEmail = getSetting("contact_email") || "";
  const contactPhone = getSetting("contact_phone") || "";
  const siteLogo = getSetting("site_logo_url") || "";
  const siteClubName = getSetting("club_name") || "Rotaract Club";

  return (
    <footer className="bg-gradient-to-b from-charcoal to-black text-silver">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand & Logo */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <RotaractLogo 
              clubName={siteClubName}
              logoUrl={siteLogo || undefined}
              className="mb-4" 
              href="/" 
            />
            <p className="text-sm text-pewter leading-relaxed mb-4">
              Service Above Self — connecting young leaders through community
              service, fellowship, and professional development.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-pewter hover:text-rotary-gold transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">About</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pewter hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Service</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.service.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pewter hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Connect</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pewter hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rotary Resources */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Rotary</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.rotary.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-pewter hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ArrowRight className="h-3 w-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meeting Info & Contact */}
        <div className="mt-10 pt-6 border-t border-charcoal/50 grid md:grid-cols-3 gap-6">
          {/* Meeting Info */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-rotary-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Meetings</p>
              <p className="text-sm text-pewter">{meetingDay}</p>
              <p className="text-sm text-pewter">{meetingTime}</p>
              <p className="text-sm text-pewter">{meetingLocation}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-rotary-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Contact Us</p>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="text-sm text-pewter hover:text-white block">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="text-sm text-pewter hover:text-white flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-rotary-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Location</p>
              <p className="text-sm text-pewter">{meetingLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-pewter text-center sm:text-left">
            © {new Date().getFullYear()} Rotaract Club. All rights reserved. | 
            Part of <a href="https://www.rotary.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Rotary International
            </a>
          </p>
          <div className="flex gap-4">
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-pewter hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicFooter() {
  return <FooterContent />;
}
