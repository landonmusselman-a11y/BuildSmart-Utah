'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import {
  Phone, Mail, Instagram, ChevronDown, ChevronUp,
  Shield, DollarSign, Wrench, Clock, Home, Star,
  CheckCircle, Zap, ArrowRight,
} from 'lucide-react';

/* ─── FAQ Data ─────────────────────────────────────────────────────── */
const faqItems = [
  {
    q: "Does it cost me anything to use a buyer's agent with new construction?",
    a: "No — builders pay buyer agent commissions as part of their sales budget. Whether or not you have representation, the builder charges the same price. Without an agent, you're simply leaving money and protection on the table.",
  },
  {
    q: 'What can you negotiate with a new construction builder?',
    a: 'More than most buyers realize: lot premiums, upgrade credits, closing cost assistance, rate buydowns, fence/landscaping packages, appliance upgrades, and sometimes even price. Builders have flexibility, especially on spec (pre-built) homes.',
  },
  {
    q: 'Can I visit builder model homes on my own?',
    a: "You can, but you should register us as your agents first. Many builders have \"first contact\" policies — if you visit without an agent and later want representation, they may not allow it. A quick call or email to register us takes two minutes.",
  },
  {
    q: 'How long does new construction take?',
    a: 'Typical build times in Utah range from 5 to 12 months depending on the builder, floor plan, and current trade availability. Some builders offer quick move-in homes (already built or nearly complete) if you need to move faster.',
  },
  {
    q: 'What happens at the design center?',
    a: "After signing a contract, you'll visit the builder's design studio to select finishes: flooring, cabinets, counters, fixtures, and optional upgrades. This is where incentive dollars are often spent. We help you prioritize choices that add resale value.",
  },
  {
    q: "Do I need to use the builder's preferred lender?",
    a: "No — you can use any lender. However, builders often tie their best incentives (rate buydowns, closing costs) to their preferred lender. We help you compare the total deal, not just the rate, to find the best overall package.",
  },
  {
    q: 'How do I register you as my agent?',
    a: "Text or call us at (801) 231-7565, or fill out the matchmaker. We'll send you a simple registration confirmation to present when you first visit a builder's model home — takes 2 minutes.",
  },
];

/* ─── Why New Construction features ───────────────────────────────── */
const whyFeatures = [
  {
    icon: Zap,
    title: 'Modern Energy Efficiency',
    description:
      'New homes are built to current code with better insulation, windows, and HVAC — lower utility bills from day one.',
  },
  {
    icon: Shield,
    title: 'Builder Warranty',
    description:
      '1-year workmanship, 2-year mechanical, 10-year structural — no surprises for years after closing.',
  },
  {
    icon: DollarSign,
    title: 'Negotiable Incentives',
    description:
      'Rate buydowns, closing costs, design center credits — builders have flexibility that resale sellers rarely do.',
  },
  {
    icon: Wrench,
    title: 'Everything New',
    description:
      'Roof, HVAC, plumbing, appliances, flooring — zero deferred maintenance surprises when you move in.',
  },
  {
    icon: Home,
    title: 'Customization Options',
    description:
      'Choose your lot, floor plan, finishes, and upgrades on dirt builds — make it yours before you move in.',
  },
  {
    icon: Star,
    title: 'Builder Accountability',
    description:
      'Builders stand behind their product in ways individual sellers cannot — recourse if something goes wrong.',
  },
];

/* ─── How I Work steps ────────────────────────────────────────────── */
const howIWorkSteps = [
  {
    phase: '01',
    title: 'Discovery',
    description:
      "We talk. We ask real questions about your budget, your commute, your timeline. No sales pitch.",
  },
  {
    phase: '02',
    title: 'Education',
    description:
      "We explain exactly how new construction works — contracts, design centers, rate buydowns — before you need to know it under pressure.",
  },
  {
    phase: '03',
    title: 'Search',
    description:
      "We've been inside every model home, read every floor plan, and tracked every incentive. We do the research so you don't have to.",
  },
  {
    phase: '04',
    title: 'Negotiation',
    description:
      "The builder's rep works for the builder. We work for you. We know what's negotiable and how to ask for it.",
  },
  {
    phase: '05',
    title: 'Construction',
    description:
      "We stay engaged through the build — pre-drywall walk, milestone check-ins, punch list review.",
  },
  {
    phase: '06',
    title: 'Closing',
    description:
      "Keys in hand isn't the end. We're your resource for warranty questions, contractor referrals, and anything else that comes up.",
  },
];

/* ─── FAQ Accordion ───────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-navy-900 pr-4">{q}</span>
        {open
          ? <ChevronUp size={18} className="flex-shrink-0 text-gold-500" />
          : <ChevronDown size={18} className="flex-shrink-0 text-navy-400" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-navy-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const phone = '(801) 231-7565';
  const phoneRaw = '8012317565';
  const email = 'Buildsmartutah@gmail.com';

  return (
    <div className="min-h-screen flex flex-col">
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="utah-hero-bg text-white py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Photo placeholder */}
              <div className="flex-shrink-0 w-32 h-32 rounded-full bg-navy-700 border-4 border-gold-500 flex items-center justify-center shadow-xl">
                <span className="text-gold-400 font-extrabold text-3xl tracking-tight">LR</span>
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-2">
                  Utah New Construction Specialist
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                  Hi, I'm Landon Rose
                </h1>
                <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                  Utah's New Construction Team. We help buyers navigate every builder, every
                  community, and every contract — at zero cost to you.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                  <Link href="/get-started" className="btn-primary text-base">
                    <Zap size={16} />
                    Schedule Free Consultation
                  </Link>
                  <a
                    href={`tel:${phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    <Phone size={16} />
                    Call {phone}
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {['Builder-Paid Representation', '20+ Utah Builders', 'NRE Brokerage'].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90"
                    >
                      <CheckCircle size={13} className="text-gold-400" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── My Story ── */}
        <section className="py-16 md:py-20 bg-white px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Story text */}
              <div>
                <h2 className="section-heading mb-6">My Story</h2>
                <div className="space-y-4 text-navy-600 leading-relaxed">
                  <p>
                    I got into new construction because I was frustrated watching buyers walk into
                    builder model homes alone and get taken advantage of. The builder's sales rep
                    is friendly, knowledgeable, and 100% working for the builder. Buyers deserve
                    someone in their corner who knows the product just as well — and whose only
                    job is to protect them.
                  </p>
                  <p>
                    So I studied. Every builder's contract. Every floor plan. Every incentive
                    structure. I walked every model home, sat through every sales pitch, and
                    learned exactly what's negotiable and what isn't. I didn't just learn the
                    transaction — I learned the product.
                  </p>
                  <p>
                    What drives me is simple: I believe buyers deserve an expert in their corner
                    who actually knows the inventory. Not a generalist who handles resale and
                    occasionally dips into new construction — someone who eats, sleeps, and
                    breathes it.
                  </p>
                  <p>
                    I know Utah's market in a way that only comes from being in it every day. I
                    know why Eagle Mountain is different from Herriman. I know which school
                    districts are worth the commute trade-off, which land constraints limit
                    certain builders, and which communities have long-term appreciation potential.
                  </p>
                  <p>
                    The mission is making new construction transparent and accessible. No pressure,
                    no jargon, no surprises — just clear guidance from someone who's seen every
                    scenario and wants to make sure you end up in the right home.
                  </p>
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-navy-900 text-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-gold-400 mb-6 uppercase tracking-wide">
                  By the Numbers
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '20+', label: 'Builders tracked' },
                    { value: '40+', label: 'Communities covered' },
                    { value: '$0', label: 'Cost to buyers' },
                    { value: '6', label: 'County coverage' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-4xl font-extrabold text-gold-400 leading-none mb-2">
                        {stat.value}
                      </div>
                      <div className="text-navy-300 text-sm leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-navy-300 text-sm leading-relaxed">
                    Covering Salt Lake, Utah County, Davis, Weber, Summit, and Tooele counties —
                    everywhere Utah builders are building.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How I Work ── */}
        <section className="py-16 md:py-20 bg-gray-50 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-heading">How We Work</h2>
              <p className="section-sub mx-auto">
                Six phases. No pressure. You're in control the whole time.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {howIWorkSteps.map((step) => (
                <div key={step.phase} className="card p-6 relative overflow-hidden">
                  {/* Watermark */}
                  <div className="absolute top-3 right-4 text-6xl font-black text-gray-100 select-none leading-none">
                    {step.phase}
                  </div>
                  <div className="relative">
                    <div className="text-gold-500 font-extrabold text-xs uppercase tracking-widest mb-1">
                      Phase {step.phase}
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">{step.title}</h3>
                    <p className="text-navy-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why New Construction ── */}
        <section className="py-16 md:py-20 bg-white px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-heading">Why New Construction?</h2>
              <p className="section-sub mx-auto">
                New homes aren't just cleaner — they're smarter investments for buyers who know what to look for.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="card p-6">
                    <div className="w-11 h-11 rounded-xl bg-gold-50 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-gold-500" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-2">{feat.title}</h3>
                    <p className="text-navy-600 text-sm leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-20 bg-gray-50 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-heading">Frequently Asked Questions</h2>
              <p className="section-sub mx-auto">
                Everything you need to know about buying new construction in Utah.
              </p>
            </div>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="py-16 md:py-20 bg-navy-900 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                Ready to start? Let's talk.
              </h2>
              <p className="text-navy-300 text-lg max-w-xl mx-auto">
                Two ways to begin — both are free, both get you moving.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="font-bold text-white text-xl mb-6">Reach Out Directly</h3>
                <div className="space-y-4 mb-8">
                  <a
                    href={`tel:${phoneRaw}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                      <Phone size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wide font-medium mb-0.5">Phone / Text</div>
                      <div className="text-white font-semibold group-hover:text-gold-300 transition-colors">{phone}</div>
                    </div>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                      <Mail size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wide font-medium mb-0.5">Email</div>
                      <div className="text-white font-semibold group-hover:text-gold-300 transition-colors">{email}</div>
                    </div>
                  </a>
                  <a
                    href="https://instagram.com/buildsmartutah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                      <Instagram size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wide font-medium mb-0.5">Instagram</div>
                      <div className="text-white font-semibold group-hover:text-gold-300 transition-colors">@buildsmartutah</div>
                    </div>
                  </a>
                </div>
                <a href={`tel:${phoneRaw}`} className="btn-primary w-full justify-center">
                  <Phone size={16} />
                  Call or Text Now
                </a>
              </div>

              {/* Matchmaker card */}
              <div className="bg-gold-500 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-xl mb-3">Start with the Matchmaker</h3>
                  <p className="text-white/85 leading-relaxed mb-6">
                    Answer 7 quick questions about your budget, location, and timeline. We'll
                    personally review your answers and reach out with a tailored list of communities
                    and builders that fit — usually within a few hours.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {['Takes under 3 minutes', 'No obligation, no spam', 'Personal follow-up from Landon'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle size={15} className="text-white flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gold-600 hover:bg-gray-50 font-bold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg w-full"
                >
                  <Zap size={16} />
                  Start the Matchmaker
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-14 bg-gold-500 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Your expert is one message away.
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Builder-paid representation. Zero cost. Full expertise — from search to keys.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 bg-white text-gold-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
              >
                <Zap size={18} />
                Take the Matchmaker
              </Link>
              <a
                href={`tel:${phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-all text-base"
              >
                <Phone size={18} />
                Call {phone}
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
