'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import {
  CheckCircle, X, Zap, Shield, Search, BookOpen,
  HandshakeIcon, HardHat, Key, Star, Phone, ChevronDown, ChevronUp,
  ArrowRight, DollarSign, Clock, Award, Users
} from 'lucide-react';

/* ─── 6-Phase Roadmap ─────────────────────────────────────────────── */
const phases = [
  {
    number: '01',
    icon: Search,
    color: 'bg-blue-50 text-blue-700',
    accent: 'border-blue-400',
    title: 'Discovery & Strategy',
    subtitle: 'We start with your goals, not a sales pitch.',
    duration: 'Week 1',
    steps: [
      'Free 30-minute needs assessment (phone or video)',
      'Define your budget range, must-haves, and deal-breakers',
      'Map your commute radius and priority cities',
      'Set realistic timeline expectations',
      'Register you as a represented buyer (protects your rights)',
    ],
    outcome: 'A clear search strategy and builder shortlist tailored to you.',
  },
  {
    number: '02',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-700',
    accent: 'border-purple-400',
    title: 'Education & Orientation',
    subtitle: "Most buyers don't know what they don't know — we fix that.",
    duration: 'Week 1–2',
    steps: [
      'Explain how new construction contracts differ from resale',
      'Walk through builder warranty programs and coverage limits',
      'Decode the design center process before you spend a dollar',
      'Identify which upgrades add resale value vs. personal taste',
      'Explain lender incentive packages and how to compare them fairly',
    ],
    outcome: 'You make decisions from a position of knowledge, not pressure.',
  },
  {
    number: '03',
    icon: HardHat,
    color: 'bg-gold-50 text-gold-700',
    accent: 'border-gold-400',
    title: 'Community & Builder Search',
    subtitle: 'We cover every option — not just whoever advertises.',
    duration: 'Week 1–3',
    steps: [
      'Tour 15+ active Utah builders and 40+ communities',
      'Compare floor plans, lot sizes, and included features side-by-side',
      'Review spec homes with immediate move-in potential',
      'Evaluate builder reputation, trade quality, and completion rates',
      'Filter live incentives — rate buydowns, upgrade credits, price cuts',
    ],
    outcome: 'A shortlist of 2–3 communities that truly match your criteria.',
  },
  {
    number: '04',
    icon: HandshakeIcon,
    color: 'bg-green-50 text-green-700',
    accent: 'border-green-400',
    title: 'Negotiation & Contract',
    subtitle: "The builder's sales rep works for the builder. We work for you.",
    duration: 'Week 2–4',
    steps: [
      'Negotiate lot premiums, upgrades, and closing cost assistance',
      'Request rate buydown packages and compare total cost of ownership',
      'Review the purchase agreement for builder-favorable clauses',
      'Advise on earnest money, contingencies, and cancellation rights',
      'Coordinate with your lender for best combined incentive package',
    ],
    outcome: 'The best possible deal — and a contract that protects you.',
  },
  {
    number: '05',
    icon: HardHat,
    color: 'bg-orange-50 text-orange-700',
    accent: 'border-orange-400',
    title: 'Construction & Milestones',
    subtitle: 'We stay engaged through every frame, wire, and inspection.',
    duration: 'Months 1–9',
    steps: [
      'Pre-drywall walkthrough to catch framing and mechanical issues early',
      'Recommend an independent third-party home inspector (optional)',
      'Track construction milestones and communicate builder updates',
      'Document any punch list items before they get covered up',
      'Attend all builder-scheduled walkthrough appointments with you',
    ],
    outcome: 'Peace of mind that your home is being built to spec.',
  },
  {
    number: '06',
    icon: Key,
    color: 'bg-teal-50 text-teal-700',
    accent: 'border-teal-400',
    title: 'Closing & Beyond',
    subtitle: "We don't disappear at the closing table.",
    duration: 'Final 2 weeks + ongoing',
    steps: [
      'Final walkthrough and punch list review before closing',
      'Closing day coordination — title, lender, and builder',
      'Warranty walk and first-year service request guidance',
      'Referrals for trusted inspectors, contractors, and service pros',
      'Annual check-in — your resource for life as a homeowner',
    ],
    outcome: 'Keys in hand, warranty activated, and a trusted advisor on speed dial.',
  },
];

/* ─── With / Without Agent Comparison ────────────────────────────── */
const comparisons = [
  { item: 'Builder pays agent commission', withAgent: true, withoutAgent: false, note: 'You keep the savings either way — but without an agent, the builder keeps them.' },
  { item: 'Contract review & red-flag alerts', withAgent: true, withoutAgent: false },
  { item: 'Negotiation leverage on price/upgrades', withAgent: true, withoutAgent: false },
  { item: 'Pre-drywall & final inspection guidance', withAgent: true, withoutAgent: false },
  { item: 'Access to unpublished incentives', withAgent: true, withoutAgent: false },
  { item: 'Independent advice (not builder sales)', withAgent: true, withoutAgent: false },
  { item: 'Design center upgrade strategy', withAgent: true, withoutAgent: false },
  { item: 'Lender incentive package comparison', withAgent: true, withoutAgent: false },
  { item: 'Warranty claim guidance', withAgent: true, withoutAgent: true },
  { item: 'Visit model homes freely', withAgent: true, withoutAgent: true },
];

/* ─── Value Stats ─────────────────────────────────────────────────── */
const stats = [
  { icon: DollarSign, value: '$15K–$40K', label: 'Average value negotiated for represented buyers' },
  { icon: Award, value: '100%', label: 'Free to you — builder-paid representation' },
  { icon: Users, value: '20+ Builders', label: 'Covered across Utah Valley, Salt Lake, and beyond' },
  { icon: Clock, value: '6 Phases', label: 'Hands-on support from search to keys' },
];

/* ─── FAQ ─────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Does using a buyer\'s agent cost me anything?',
    a: 'No. Builder-paid buyer agent commissions are built into every builder\'s sales budget. Whether you bring an agent or not, you pay the same purchase price. Without representation, you simply give up that protection — and the builder keeps the commission.',
  },
  {
    q: 'Can I still visit model homes before registering you?',
    a: 'You can visit open model homes freely, but you should register me as your agent before your first official appointment with the builder\'s sales rep. Many builders have "first contact" policies — once you register without an agent, they may not allow representation later. A quick text or email to register takes two minutes.',
  },
  {
    q: 'What if I already visited a builder without an agent?',
    a: 'It depends on the builder\'s policy and how far the conversation went. In many cases I can still be registered if no formal purchase agreement process has started. Contact me and I\'ll find out quickly — there\'s no cost to ask.',
  },
  {
    q: 'Do you work with all Utah builders?',
    a: 'I work with all major Utah new construction builders including Richmond American, Lennar, Perry, Woodside, Ivory, Edge, Toll Brothers, Pulte, Meritage, Century Communities, Garbett, and many more. If a builder is building in Utah, I can represent you there.',
  },
  {
    q: 'What\'s a rate buydown and should I ask for one?',
    a: 'A rate buydown is a builder-paid credit that lowers your mortgage interest rate — either permanently or for the first 1–3 years. On a $500K home, a 1-point buydown can save you $200–$300/month. Whether it\'s better than a price reduction or upgrade credit depends on your specific loan. I help you run the numbers.',
  },
  {
    q: 'How long does the process take from start to keys?',
    a: 'For a dirt build (buy lot + choose floor plan), expect 6–10 months. For a spec home already under construction or move-in ready, you could close in 30–90 days. I\'ll show you both options and help you decide based on your timeline.',
  },
];

/* ─── FAQ Accordion item ──────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-navy-900 pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="flex-shrink-0 text-gold-500" /> : <ChevronDown size={18} className="flex-shrink-0 text-navy-400" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-navy-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Phase Card ──────────────────────────────────────────────────── */
function PhaseCard({ phase, index }: { phase: typeof phases[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = phase.icon;

  return (
    <div className={`relative bg-white rounded-2xl border-2 ${phase.accent} shadow-sm hover:shadow-md transition-all duration-200`}>
      {/* Phase number watermark */}
      <div className="absolute top-4 right-5 text-6xl font-black text-gray-100 select-none leading-none">
        {phase.number}
      </div>

      <div className="p-6 relative">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${phase.color}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-bold text-navy-900 text-lg">{phase.title}</h3>
              <span className="text-xs font-semibold bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">{phase.duration}</span>
            </div>
            <p className="text-navy-500 text-sm">{phase.subtitle}</p>
          </div>
        </div>

        {/* Steps — collapsed on mobile, toggle to expand */}
        <div className={`space-y-2 mb-4 ${expanded ? '' : 'hidden sm:block'}`}>
          {phase.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-navy-700">
              <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-green-500" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Mobile expand toggle */}
        <button
          className="sm:hidden text-xs font-semibold text-gold-600 flex items-center gap-1 mb-3"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `Show ${phase.steps.length} steps`}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Outcome */}
        <div className="bg-navy-50 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-1">Outcome</p>
          <p className="text-sm font-medium text-navy-800">{phase.outcome}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 555-0100';

  return (
    <div className="min-h-screen flex flex-col">
      <Header onGetRepresented={() => setModalOpen(true)} />

      {/* ── Hero ── */}
      <section className="utah-hero-bg text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Shield size={14} className="text-gold-400" />
            100% Free Buyer Representation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            The BuildSmart<br />
            <span className="text-gold-400">Buyer Roadmap</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Six phases. Zero cost to you. From your first search to the day you get your keys — I'm in your corner every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/get-started" className="btn-primary text-base">
              <Zap size={16} />
              Start the Matchmaker
            </Link>
            <a href={`tel:${phone.replace(/\D/g,'')}`} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg transition-all">
              <Phone size={16} />
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-gold-500 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-lg leading-tight">{s.value}</div>
                    <div className="text-white/80 text-xs leading-tight">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── The 6 Phases ── */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">The 6-Phase Process</h2>
            <p className="section-sub mx-auto">
              Every represented buyer I work with goes through this roadmap. It's not one-size-fits-all — it's a framework I adapt to your timeline, budget, and goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((phase, i) => (
              <PhaseCard key={i} phase={phase} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── With Agent vs. Without ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-heading">With an Agent vs. Without</h2>
            <p className="section-sub mx-auto">
              The builder prices their homes the same either way. The only question is who gets the buyer-agent commission — you (in benefits) or the builder (as extra margin).
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 bg-navy-900 text-white text-sm font-bold">
              <div className="col-span-1 px-5 py-3">What You Get</div>
              <div className="px-3 py-3 text-center border-l border-white/10 text-gold-400">With BuildSmart</div>
              <div className="px-3 py-3 text-center border-l border-white/10 text-white/60">Without Agent</div>
            </div>
            {/* Rows */}
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-gray-100 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="col-span-1 px-5 py-3 text-navy-800 font-medium flex items-center gap-1">
                  {row.item}
                  {row.note && (
                    <span className="hidden md:inline text-xs text-navy-400 font-normal ml-1">— {row.note}</span>
                  )}
                </div>
                <div className="px-3 py-3 flex items-center justify-center border-l border-gray-100">
                  {row.withAgent
                    ? <CheckCircle size={18} className="text-green-500" />
                    : <X size={18} className="text-red-400" />}
                </div>
                <div className="px-3 py-3 flex items-center justify-center border-l border-gray-100">
                  {row.withoutAgent
                    ? <CheckCircle size={18} className="text-green-500" />
                    : <X size={18} className="text-red-300" />}
                </div>
              </div>
            ))}
            {/* Footer CTA */}
            <div className="bg-gold-50 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm font-semibold text-navy-800">Ready to get everything in the left column — at no cost?</p>
              <Link href="/get-started" className="btn-primary text-sm py-2 whitespace-nowrap">
                Schedule Free Consultation <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / Testimonial Band ── */}
      <section className="bg-navy-900 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-gold-400 fill-gold-400" />)}
            </div>
            <blockquote className="text-xl md:text-2xl font-semibold text-white leading-relaxed max-w-2xl mx-auto mb-4">
              "We had no idea how much we didn't know about buying new construction. Having someone in our corner who understood the contracts, the design center, and what to push back on saved us thousands — and a lot of stress."
            </blockquote>
            <p className="text-white/50 text-sm">— First-time new construction buyer, South Jordan UT</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { label: 'No cost to buyers', detail: 'Builder-paid commission' },
              { label: 'Unbiased advice', detail: 'I represent you, not the builder' },
              { label: 'Full coverage', detail: '40+ communities tracked' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="font-bold text-white mb-1">{item.label}</div>
                <div className="text-white/50 text-sm">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-heading">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-gold-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to start your search?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Answer 7 quick questions and I'll match you with the Utah communities that actually fit your budget, location, and lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/get-started" className="inline-flex items-center justify-center gap-2 bg-white text-gold-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg text-base">
              <Zap size={18} />
              Take the Matchmaker
            </Link>
            <a
              href={`tel:${phone.replace(/\D/g,'')}`}
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-all text-base"
            >
              <Phone size={18} />
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
