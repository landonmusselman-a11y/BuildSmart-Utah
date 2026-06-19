import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for BuildSmart Utah — the terms governing your use of our site and buyer representation services.',
};

export default function TermsOfServicePage() {
  const email = process.env.NEXT_PUBLIC_AGENT_EMAIL || 'Buildsmartutah@gmail.com';
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 231-7565';
  const updated = 'June 17, 2025';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500 mb-3">Legal</p>
            <h1 className="text-4xl font-bold font-serif text-navy-900 tracking-tight mb-3">Terms of Service</h1>
            <p className="text-sm text-navy-400">Last updated: {updated}</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-8 text-navy-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the BuildSmart Utah website at <strong>utahnewconstruction.com</strong> ("Site"),
                or by submitting any form or requesting our services, you agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use the Site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">2. About Our Services</h2>
              <p>
                BuildSmart Utah provides free buyer representation services for new construction home purchases
                in Utah. Our agent is compensated by the builder at closing — there is no cost to the buyer
                for our representation.
              </p>
              <p className="mt-3">
                By submitting a contact form or requesting representation, you are expressing interest in
                working with BuildSmart Utah as your buyer's agent. No agency relationship is created until
                a written Buyer Representation Agreement is signed by both parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">3. Information Accuracy</h2>
              <p>
                We make every effort to keep builder, community, pricing, and incentive information
                current and accurate. However:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Builder pricing, availability, and incentives change frequently and without notice</li>
                <li>Community information is provided for general reference only and is not a guarantee of availability</li>
                <li>All pricing, lot availability, floor plan offerings, and incentives must be confirmed directly with the builder at time of purchase</li>
                <li>BuildSmart Utah is not responsible for errors or omissions in builder-provided information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">4. No Solicitation of Represented Buyers</h2>
              <p>
                If you are currently represented by another licensed real estate agent, please disclose this
                before submitting a form. We respect existing agency relationships and will not solicit
                represented buyers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">5. Communications Consent</h2>
              <p>
                By submitting your contact information through any form on this Site, you consent to be
                contacted by BuildSmart Utah via phone, text message (SMS), and email regarding your
                home search and related real estate services. Standard message and data rates may apply
                to text messages. You may opt out at any time by:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Replying STOP to any text message</li>
                <li>Clicking the unsubscribe link in any email</li>
                <li>Contacting us directly at {email}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">6. Calculators and Financial Tools</h2>
              <p>
                The calculators and financial tools on this Site are provided for general educational
                purposes only. Results are estimates based on the inputs you provide and general
                assumptions. They do not constitute financial, mortgage, tax, or legal advice.
                Consult a licensed mortgage professional for actual loan qualification and payment information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">7. Intellectual Property</h2>
              <p>
                All content on this Site — including text, graphics, logos, and code — is the property
                of BuildSmart Utah or its content suppliers and is protected by applicable intellectual
                property laws. You may not reproduce, distribute, or create derivative works without
                express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">8. Third-Party Links</h2>
              <p>
                Our Site may contain links to builder websites and third-party resources. These links
                are provided for convenience only. BuildSmart Utah has no control over and assumes no
                responsibility for the content, privacy policies, or practices of third-party sites.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, BuildSmart Utah shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from your
                use of this Site or our services, including but not limited to reliance on information
                provided on this Site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">10. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Utah. Any disputes arising from
                these Terms or your use of the Site shall be resolved in the courts of Utah County,
                Utah.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">11. Changes to These Terms</h2>
              <p>
                We reserve the right to update these Terms at any time. Changes take effect immediately
                upon posting. Your continued use of the Site after any changes constitutes acceptance
                of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">12. Contact Us</h2>
              <p>Questions about these Terms? Reach us at:</p>
              <div className="mt-3 bg-white border border-gray-100 rounded-xl p-5 text-sm space-y-1">
                <div className="font-bold text-navy-900">BuildSmart Utah</div>
                <div>Utah New Construction Buyer Representation</div>
                <div>
                  Email:{' '}
                  <a href={`mailto:${email}`} className="text-navy-900 underline">{email}</a>
                </div>
                <div>
                  Phone: <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-navy-900 underline">{phone}</a>
                </div>
                <div>Website: utahnewconstruction.com</div>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 text-sm">
            <Link href="/privacy" className="text-navy-500 hover:text-navy-900 underline">
              Privacy Policy
            </Link>
            <Link href="/" className="text-navy-500 hover:text-navy-900 underline">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
