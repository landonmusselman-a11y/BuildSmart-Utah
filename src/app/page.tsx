'use client';

import { useState, useMemo } from 'react';
import { mockBuilders, getAllCommunities, getAllIncentives, getStats } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AgentSection from '@/components/AgentSection';
import BuilderCard from '@/components/BuilderCard';
import CommunityCard from '@/components/CommunityCard';
import SpecHomeCard from '@/components/SpecHomeCard';
import IncentiveBadge from '@/components/IncentiveBadge';
import SearchMapSection from '@/components/SearchMapSection';
import WhyHireMeSection from '@/components/WhyHireMeSection';
import LeadCaptureSection from '@/components/LeadCaptureSection';
import BookingModal from '@/components/BookingModal';
import StickyBookingBar from '@/components/StickyBookingBar';
import { Community, SpecHome } from '@/types';
import { ArrowRight, CheckCircle, Zap, HardHat, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const howItWorksSteps = [
  {
    number: '01',
    title: 'Browse Builders & Communities',
    desc: 'Explore every active Utah builder, see their communities, floor plans, and current incentives all in one place.',
  },
  {
    number: '02',
    title: 'Connect With Us For Free',
    desc: "We'll answer your questions, share inside knowledge on each builder, and help you identify the best fit for your budget and timeline.",
  },
  {
    number: '03',
    title: 'We Represent You At No Cost',
    desc: 'Builders pay our commission. You get expert guidance from contract signing through your final walk-through — completely free.',
  },
];

type SpecFilter = 'all' | 'move-in-ready' | 'under-construction';

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [specFilter, setSpecFilter] = useState<SpecFilter>('all');

  const stats = getStats();
  const featuredBuilders = mockBuilders.filter((b) => b.featured);
  const allCommunities = getAllCommunities();
  const activeIncentives = getAllIncentives().filter((i) => i.active);

  // Derive all spec homes paired with their parent community
  const allSpecPairs = useMemo(() => {
    const pairs: { spec: SpecHome; community: Community }[] = [];
    for (const community of allCommunities) {
      for (const spec of community.specHomes ?? []) {
        pairs.push({ spec, community });
      }
    }
    // Sort: move-in-ready first, then under-construction, then available
    const order: Record<string, number> = { 'move-in-ready': 0, 'under-construction': 1, available: 2 };
    return pairs.sort((a, b) => (order[a.spec.status] ?? 3) - (order[b.spec.status] ?? 3));
  }, [allCommunities]);

  const filteredSpecs = useMemo(() => {
    if (specFilter === 'all') return allSpecPairs;
    return allSpecPairs.filter((p) => p.spec.status === specFilter);
  }, [allSpecPairs, specFilter]);

  const moveInReadyCount = allSpecPairs.filter((p) => p.spec.status === 'move-in-ready').length;
  const underConstructionCount = allSpecPairs.filter((p) => p.spec.status === 'under-construction').length;

  return (
    <>
      <Header onGetRepresented={() => setBookingOpen(true)} />

      <main>
        {/* Hero */}
        <HeroSection onGetRepresented={() => setBookingOpen(true)} stats={stats} />

        {/* Lead capture — Meridian-style split section */}
        <LeadCaptureSection onBookCall={() => setBookingOpen(true)} />

        {/* Horror Stories — the risk of going alone */}
        <section className="py-20 bg-navy-900 grain-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-red-900/30 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide border border-red-800/40">
                <AlertTriangle size={11} />
                What Can Go Wrong
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-cream-50 mb-4 leading-tight">
                Real Situations. Preventable Outcomes.
              </h2>
              <p className="text-cream-300 text-lg max-w-2xl mx-auto">
                I&apos;ve watched these play out hundreds of times. The only thing they had in common:
                the buyer walked in alone.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: 'The Price Increase',
                  detail: '$23,000 added after signing.',
                  story: "A buyer signed their contract, then received notice their price was increasing $23,000. They called us after the fact. The clause was buried in paragraph 14 of the purchase agreement — language I've seen dozens of times. We would have caught it.",
                },
                {
                  title: 'The Skipped Inspection',
                  detail: '$47,000 in foundation issues.',
                  story: 'A buyer decided to skip the independent inspection to save $500. Six months after closing they discovered a $47,000 foundation problem. The builder said it was "within tolerance." They had no independent documentation — and no leverage.',
                },
                {
                  title: 'The Design Center',
                  detail: '$30,000 in avoidable markups.',
                  story: 'A couple spent $85,000 at the design center. I walked through their selections after the fact. About $30,000 of those choices had 60–80% builder markup on items that could have been done cheaper after closing by a contractor of their choosing.',
                },
              ].map(({ title, detail, story }) => (
                <div key={title} className="bg-sage-900 border border-sage-800 rounded-2xl p-7">
                  <div className="text-gold-400 text-[11px] font-bold uppercase tracking-widest mb-2">{detail}</div>
                  <h3 className="text-cream-50 font-bold text-lg mb-3">{title}</h3>
                  <p className="text-cream-300 text-sm leading-relaxed">{story}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setBookingOpen(true)}
                className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-500 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-lg hover:-translate-y-0.5"
              >
                Talk to Me Before You Sign Anything
              </button>
              <p className="text-cream-400 text-xs mt-3">No out-of-pocket fees. Builders pay our representation fee. Licensed with NRE.</p>
            </div>
          </div>
        </section>

        {/* Services — what you get when you hire us */}
        <WhyHireMeSection onGetRepresented={() => setBookingOpen(true)} />

        {/* Search + Map */}
        <SearchMapSection onGetInfo={() => setBookingOpen(true)} />

        {/* How it works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block bg-gold-50 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                How It Works
              </div>
              <h2 className="section-heading">Simple Process. Zero Cost.</h2>
              <p className="section-sub mx-auto mt-3">
                From finding the right builder to getting your keys — we make the new construction process easy.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorksSteps.map(({ number, title, desc }) => (
                <div key={number} className="relative text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-extrabold mx-auto mb-5 group-hover:bg-gold-500 transition-colors">
                    {number}
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{title}</h3>
                  <p className="text-navy-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Builders */}
        <section className="py-20 bg-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-block bg-warm-100 text-warm-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                  Featured Builders
                </div>
                <h2 className="section-heading">Utah's Top New Construction Builders</h2>
              </div>
              <Link href="/builders" className="hidden md:flex items-center gap-1.5 text-navy-700 font-semibold hover:text-gold-600 transition-colors">
                All {stats.builders} builders <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBuilders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link href="/builders" className="btn-navy">
                View all {stats.builders} builders
              </Link>
            </div>
          </div>
        </section>

        {/* ── QUICK MOVE-IN / SPEC HOMES ─────────────────────────────────── */}
        <section className="py-20 bg-white" id="spec-homes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                  <Zap size={11} />
                  Quick Move-In Available
                </div>
                <h2 className="section-heading">Spec Homes — Skip the Wait</h2>
                <p className="section-sub mt-2 max-w-2xl">
                  These homes are already built or under construction. Move in without the typical 6–12 month build timeline.
                </p>
              </div>
              <Link
                href="/communities"
                className="hidden md:flex items-center gap-1.5 text-navy-700 font-semibold hover:text-gold-600 transition-colors whitespace-nowrap"
              >
                Browse all communities <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stat bar */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-green-800">{moveInReadyCount} Move-In Ready</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <HardHat size={14} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">{underConstructionCount} Under Construction</span>
              </div>
              <div className="flex items-center gap-2 bg-navy-50 border border-navy-100 rounded-xl px-4 py-2.5">
                <Search size={14} className="text-navy-600" />
                <span className="text-sm font-semibold text-navy-800">{allSpecPairs.length} Total Spec Homes</span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {(
                [
                  { key: 'all', label: 'All Spec Homes', count: allSpecPairs.length },
                  { key: 'move-in-ready', label: 'Move-In Ready', count: moveInReadyCount },
                  { key: 'under-construction', label: 'Under Construction', count: underConstructionCount },
                ] as { key: SpecFilter; label: string; count: number }[]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSpecFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    specFilter === key
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-cream-100 text-navy-600 hover:bg-cream-200 hover:text-navy-900'
                  }`}
                >
                  {label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      specFilter === key ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredSpecs.slice(0, 6).map(({ spec, community }) => (
                <SpecHomeCard
                  key={spec.id}
                  spec={spec}
                  community={community}
                  onGetInfo={() => setBookingOpen(true)}
                />
              ))}
            </div>

            {/* Show more */}
            {filteredSpecs.length > 6 && (
              <div className="text-center">
                <p className="text-navy-500 text-sm mb-4">
                  Showing 6 of {filteredSpecs.length} spec homes
                </p>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="btn-navy"
                >
                  See All Spec Homes — Get My Free List
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Active Incentives Spotlight */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block bg-gold-50 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                Current Incentives
              </div>
              <h2 className="section-heading">Builders Are Offering Big Deals Right Now</h2>
              <p className="section-sub mx-auto">
                Incentives change monthly. Here are the active offers we track — we'll help you find the best deal for your situation.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {activeIncentives.slice(0, 6).map((inc) => {
                const builder = mockBuilders.find((b) => b.id === inc.builderId);
                return (
                  <div key={inc.id} className="card p-5 flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: builder?.logoColor || '#46433E' }}
                    >
                      <span className="text-white font-bold text-xs">{builder?.logoInitials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-navy-900 text-sm mb-1">{inc.title}</div>
                      <div className="text-navy-500 text-xs leading-relaxed line-clamp-2 mb-2">{inc.description}</div>
                      <IncentiveBadge incentive={inc} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button onClick={() => setBookingOpen(true)} className="btn-primary">
                Help Me Find the Best Deal
              </button>
            </div>
          </div>
        </section>

        {/* Communities */}
        <section className="py-20 bg-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-block bg-warm-100 text-warm-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                  Communities
                </div>
                <h2 className="section-heading">Browse Active Utah Communities</h2>
              </div>
              <Link href="/communities" className="hidden md:flex items-center gap-1.5 text-navy-700 font-semibold hover:text-gold-600 transition-colors">
                All {stats.communities} communities <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCommunities.slice(0, 6).map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onGetInfo={() => setBookingOpen(true)}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/communities" className="btn-navy">
                View all {stats.communities} communities
              </Link>
            </div>
          </div>
        </section>

        {/* Why new construction */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-gold-50 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Why New Construction
            </div>
            <h2 className="section-heading mb-8">Why Buyers Are Choosing New Construction</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                'Everything is brand new — no surprises or deferred maintenance',
                'Choose your floor plan, lot, and finishes to match your lifestyle',
                'Builder warranties protect you for years after closing',
                'Modern energy-efficient construction means lower utility bills',
                'Competitive builder incentives — rate buydowns, design credits, closing costs',
                'Less competition than resale homes — no bidding wars',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 bg-navy-50 rounded-xl p-4">
                  <CheckCircle size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  <span className="text-navy-800 text-sm font-medium leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agent section */}
        <AgentSection onGetRepresented={() => setBookingOpen(true)} />

        {/* Final CTA */}
        <section className="py-20 bg-gold-gradient text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Find Your New Build?</h2>
            <p className="text-white/80 text-lg mb-8">
              Let's find the right builder, the right community, and the right incentives for you — all at no cost.
            </p>
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-white text-gold-700 hover:bg-gold-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg"
            >
              Schedule Free Consultation
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <StickyBookingBar onBook={() => setBookingOpen(true)} />

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />

    </>
  );
}
