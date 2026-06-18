import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for BuildSmart Utah — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const email = process.env.NEXT_PUBLIC_AGENT_EMAIL || 'Buildsmartutah@gmail.com';
  const updated = 'June 17, 2025';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500 mb-3">Legal</p>
            <h1 className="text-4xl font-bold font-serif text-navy-900 tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-sm text-navy-400">Last updated: {updated}</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-8 text-navy-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">1. Who We Are</h2>
              <p>
                BuildSmart Utah ("we," "us," or "our") is a real estate buyer representation service
                operating at <strong>newconstructionutah.com</strong>. We help buyers navigate Utah's
                new construction market at no cost to them. Our licensed agent is based in Utah and
                serves buyers across the Wasatch Front and Back.
              </p>
              <p className="mt-3">
                Questions about this policy? Email us at{' '}
                <a href={`mailto:${email}`} className="text-navy-900 underline">{email}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">2. What Information We Collect</h2>
              <p>When you submit a form on our site, we collect:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Contact information:</strong> First name, last name, email address, phone number</li>
                <li><strong>Homebuying preferences:</strong> Builder interest, community interest, price range, desired timeline</li>
                <li><strong>Optional details:</strong> Any message or notes you include in the free-form field</li>
              </ul>
              <p className="mt-3">
                We also automatically collect standard web analytics data (page views, referral source,
                browser type, IP address) through Google Analytics when you visit our site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the information you provide to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Contact you about buyer representation services via phone, text, or email</li>
                <li>Match you with Utah new construction builders and communities that fit your criteria</li>
                <li>Answer your questions about the home buying process</li>
                <li>Send relevant updates about new communities, builder incentives, or market changes (you can unsubscribe at any time)</li>
              </ul>
              <p className="mt-3">
                We will never use your information for purposes unrelated to real estate services without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">4. How We Store Your Information</h2>
              <p>
                Your submitted information is stored securely in two places:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Supabase</strong> — a secure, encrypted cloud database (supabase.com). Your data
                  is stored on servers located in the United States and protected by industry-standard
                  security practices.
                </li>
                <li>
                  <strong>Brevo</strong> — a CRM and email platform used to manage client communications
                  and follow-up. Brevo stores your contact information to enable ongoing communication
                  about your home search.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">5. Who We Share Your Information With</h2>
              <p>
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
              <p className="mt-3">We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>With your consent:</strong> If you ask us to connect you with a specific builder
                  or lender, we will share only what is necessary to facilitate that introduction.
                </li>
                <li>
                  <strong>Service providers:</strong> Our technology partners (Supabase, Brevo, Google)
                  process your data only to provide services on our behalf.
                </li>
                <li>
                  <strong>Legal requirements:</strong> If required by law or to protect the rights and
                  safety of our users or the public.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">6. Cookies and Tracking</h2>
              <p>
                Our site uses cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Understand how visitors use our site (Google Analytics)</li>
                <li>Measure the effectiveness of our advertising campaigns (Meta/Facebook Pixel, Google Ads)</li>
                <li>Remember your preferences during your visit</li>
              </ul>
              <p className="mt-3">
                You can opt out of Google Analytics tracking by using the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                . You can manage Facebook data preferences through your{' '}
                <a
                  href="https://www.facebook.com/ads/preferences"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 underline"
                >
                  Facebook Ad Preferences
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Request a copy of the personal information we hold about you</li>
                <li>Ask us to correct inaccurate information</li>
                <li>Ask us to delete your information (subject to legal retention requirements)</li>
                <li>Opt out of marketing communications at any time by replying STOP to any text, clicking unsubscribe in any email, or contacting us directly</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{' '}
                <a href={`mailto:${email}`} className="text-navy-900 underline">{email}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">8. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13. We do not knowingly collect personal
                information from children. If you believe we have inadvertently collected such information,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the
                "last updated" date at the top of this page. Continued use of our site after any changes
                constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-navy-900 mb-3">10. Contact Us</h2>
              <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
              <div className="mt-3 bg-white border border-gray-100 rounded-xl p-5 text-sm space-y-1">
                <div className="font-bold text-navy-900">BuildSmart Utah</div>
                <div>Utah New Construction Buyer Representation</div>
                <div>
                  Email:{' '}
                  <a href={`mailto:${email}`} className="text-navy-900 underline">{email}</a>
                </div>
                <div>Website: newconstructionutah.com</div>
              </div>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 text-sm">
            <Link href="/terms" className="text-navy-500 hover:text-navy-900 underline">
              Terms of Service
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
