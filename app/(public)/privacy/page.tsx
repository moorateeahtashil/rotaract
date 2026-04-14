export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-white/80">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-lg">
          <h2 className="text-2xl font-bold text-charcoal">1. Introduction</h2>
          <p className="text-pewter">This Privacy Policy explains how our Rotaract club collects, uses, stores, and protects your personal information when you use our website or participate in our activities.</p>

          <h2 className="text-2xl font-bold text-charcoal">2. Information We Collect</h2>
          <p className="text-pewter">We collect information you provide directly, including:</p>
          <ul className="text-pewter list-disc pl-6 space-y-1">
            <li>Name, email address, and phone number when you register or contact us</li>
            <li>Membership application details</li>
            <li>Event registration information</li>
            <li>Photos from events and activities</li>
            <li>Communications you send to us</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal">3. How We Use Your Information</h2>
          <p className="text-pewter">We use the information we collect to:</p>
          <ul className="text-pewter list-disc pl-6 space-y-1">
            <li>Manage membership and communicate with members</li>
            <li>Organize and manage events and projects</li>
            <li>Send newsletters and updates</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal">4. Data Sharing</h2>
          <p className="text-pewter">We do not sell your personal information. We may share information with Rotary International and our sponsor clubs as part of the Rotaract network, or when required by law.</p>

          <h2 className="text-2xl font-bold text-charcoal">5. Data Security</h2>
          <p className="text-pewter">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2 className="text-2xl font-bold text-charcoal">6. Your Rights</h2>
          <p className="text-pewter">You have the right to access, correct, or delete your personal information. Contact us at the email address below to exercise these rights.</p>

          <h2 className="text-2xl font-bold text-charcoal">7. Cookies</h2>
          <p className="text-pewter">Our website uses essential cookies for authentication and functionality. We do not use third-party tracking cookies without consent.</p>

          <h2 className="text-2xl font-bold text-charcoal">8. Contact</h2>
          <p className="text-pewter">For privacy-related inquiries, please contact us through our contact page.</p>
        </div>
      </section>
    </div>
  );
}
