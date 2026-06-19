'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface LeadCaptureSectionProps {
  onBookCall: () => void;
}

const bullets = [
  'Side-by-side comparison of every active builder in your area',
  'Current incentives, upgrade margins, and lot premiums — real numbers',
  'Which builders are delivering right now and which to watch out for',
  'No out-of-pocket fees — builders pay our representation fee',
];

export default function LeadCaptureSection({ onBookCall }: LeadCaptureSectionProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const nameParts = form.name.trim().split(' ');
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          phone: form.phone,
          email: form.email,
          source: 'homepage_hero',
        }),
      });
      if (!res.ok) throw new Error('Something went wrong');
      setSubmitted(true);
      if (typeof window !== 'undefined') {
        const w = window as { gtag?: (...args: unknown[]) => void };
        if (w.gtag) {
          w.gtag('event', 'lead_submitted', { event_category: 'engagement', event_label: 'lead_section' });
          w.gtag('event', 'conversion', { send_to: 'AW-18251519886/KwdECNHg1cEcEI6vgP9D' });
        }
      }
    } catch {
      setError('Something went wrong. Call or text (801) 231-7565.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="get-analysis" className="bg-cream-100 grain-section py-24 px-6 sm:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-28 items-center">

        {/* Left: story */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0" />
            <span className="text-navy-400 text-[11px] font-bold tracking-[0.22em] uppercase">
              About Landon
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 leading-[1.05] mb-6">
            A former insider<br />with an outsized<br />advantage.
          </h2>

          <p className="text-navy-600 text-lg leading-relaxed mb-8">
            I ran sales for Utah&apos;s largest homebuilder and hit #1 in volume 4 consecutive years.
            I learned exactly how builders structure contracts, price incentives, and guide buyers
            through design centers. Then I realized buyers needed someone who truly knew the playbook.
            So I switched sides.
          </p>

          <div className="space-y-3.5 mb-8">
            {bullets.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <span className="text-navy-700 text-sm leading-snug">{b}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onBookCall}
            className="text-navy-500 hover:text-navy-900 text-sm font-semibold underline underline-offset-4 transition-colors"
          >
            Prefer to schedule a specific time instead →
          </button>
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-8 lg:p-10">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={26} className="text-emerald-500" />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-2">
                You&apos;re on my radar.
              </h3>
              <p className="text-navy-500 text-sm leading-relaxed">
                I&apos;ll reach out within a few hours with your free builder analysis.
                In the meantime, explore every Utah builder, community, and incentive below.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-1">
                Get Your Free Builder Analysis
              </h3>
              <p className="text-navy-500 text-sm mb-6 leading-relaxed">
                Tell me where you&apos;re looking. I&apos;ll send a full breakdown of every active
                builder in that area — what they&apos;re offering, what it&apos;s actually worth,
                and who&apos;s worth visiting.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  type="text"
                  placeholder="Your full name *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-navy-900 bg-cream-50 placeholder-navy-300"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone number *"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-navy-900 bg-cream-50 placeholder-navy-300"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address *"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-navy-900 bg-cream-50 placeholder-navy-300"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-navy-900 hover:bg-navy-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : (
                    <>Send My Free Analysis <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-navy-400 mt-4">
                No out-of-pocket fees. Representation is paid by the builder. Licensed with NRE.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
