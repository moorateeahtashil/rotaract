export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-rotary-blue via-azure to-rotary-blue text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms of Use</h1>
          <p className="text-lg text-white/80">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-lg">
          <h2 className="text-2xl font-bold text-charcoal">1. Acceptance of Terms</h2>
          <p className="text-pewter">By accessing and using this website, you accept and agree to be bound by these Terms of Use.</p>

          <h2 className="text-2xl font-bold text-charcoal">2. Use of Website</h2>
          <p className="text-pewter">This website is provided for informational and community purposes. You may not use this website for any unlawful purpose or in a way that damages the reputation of our club, Rotary International, or Rotaract.</p>

          <h2 className="text-2xl font-bold text-charcoal">3. Content</h2>
          <p className="text-pewter">Content on this website is provided by our club members and administrators. While we strive for accuracy, we make no guarantees about the completeness or accuracy of information.</p>

          <h2 className="text-2xl font-bold text-charcoal">4. Intellectual Property</h2>
          <p className="text-pewter">The Rotaract name and logo are trademarks of Rotary International. Photos and content created by our club remain the property of the club and its members.</p>

          <h2 className="text-2xl font-bold text-charcoal">5. User Accounts</h2>
          <p className="text-pewter">Members are responsible for maintaining the confidentiality of their account credentials and for all activities under their account.</p>

          <h2 className="text-2xl font-bold text-charcoal">6. Limitation of Liability</h2>
          <p className="text-pewter">Our club, its officers, and members shall not be liable for any damages arising from the use of this website or participation in club activities.</p>

          <h2 className="text-2xl font-bold text-charcoal">7. Changes to Terms</h2>
          <p className="text-pewter">We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of updated terms.</p>

          <h2 className="text-2xl font-bold text-charcoal">8. Contact</h2>
          <p className="text-pewter">Questions about these terms should be directed to our club administration through the contact page.</p>
        </div>
      </section>
    </div>
  );
}
