import { getSiteSettings } from "@/lib/db/queries";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with our Rotaract club. We'd love to hear from you.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const getSetting = (key: string) => (settings as any[]).find((s) => s.key === key)?.value || "";

  const contactEmail = getSetting("contact_email") || "contact@rotaract.org";
  const contactPhone = getSetting("contact_phone") || "";
  const meetingLocation = getSetting("meeting_location") || "TBD";
  const meetingDay = getSetting("meeting_day") || "";
  const meetingTime = getSetting("meeting_time") || "";
  const mapsUrl = getSetting("google_maps_embed_url") || "";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Have a question or want to learn more? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">Email</p>
                      <a href={`mailto:${contactEmail}`} className="text-sm text-rotary-blue hover:underline">
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                  {contactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Phone</p>
                        <a href={`tel:${contactPhone}`} className="text-sm text-rotary-blue hover:underline">
                          {contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  {meetingLocation && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Meeting Location</p>
                        <p className="text-sm text-pewter">{meetingLocation}</p>
                      </div>
                    </div>
                  )}
                  {(meetingDay || meetingTime) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-rotary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-charcoal">Meeting Schedule</p>
                        <p className="text-sm text-pewter">
                          {meetingDay && `${meetingDay}`}
                          {meetingDay && meetingTime && " at "}
                          {meetingTime && `${meetingTime}`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              {mapsUrl && (
                <Card>
                  <CardContent className="pt-2">
                    <iframe
                      src={mapsUrl}
                      width="100%"
                      height="250"
                      style={{ border: 0, borderRadius: "0.5rem" }}
                      allowFullScreen
                      loading="lazy"
                      title="Club Location"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-charcoal mb-4">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
