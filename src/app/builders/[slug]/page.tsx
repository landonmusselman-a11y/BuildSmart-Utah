'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { getBuilderBySlug } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IncentiveBadge from '@/components/IncentiveBadge';
import BookingModal from '@/components/BookingModal';
import { Community } from '@/types';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
      <span className="text-navy-400 text-sm font-medium">Loading map…</span>
    </div>
  ),
});
import {
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  Users,
  Shield,
  ChevronRight,
  Tag,
  Star,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ─── Inline sub-components ───────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-5 py-3">
      <span className="text-white font-bold text-xl leading-tight">{value}</span>
      <span className="text-navy-300 text-xs mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Community['status'] }) {
  const map: Record<Community['status'], { label: string; cls: string }> = {
    selling: { label: 'Selling Now', cls: 'bg-green-100 text-green-800' },
    'coming-soon': { label: 'Coming Soon', cls: 'bg-amber-100 text-amber-800' },
    'sold-out': { label: 'Sold Out', cls: 'bg-gray-100 text-gray-600' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: Community['type'] }) {
  const map: Record<Community['type'], { label: string; cls: string }> = {
    'spec-only': { label: 'Spec Homes', cls: 'bg-blue-100 text-blue-700' },
    'dirt-only': { label: 'Build on Lot', cls: 'bg-purple-100 text-purple-700' },
    both: { label: 'Spec & Dirt', cls: 'bg-navy-100 text-navy-700' },
  };
  const { label, cls } = map[type];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderDetailPage({ params }: { params: { slug: string } }) {
  const [modalOpen, setModalOpen] = useState(false);

  const builder = getBuilderBySlug(params.slug);

  if (!builder) {
    return (
      <>
        <Header onGetRepresented={() => setModalOpen(true)} />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy-900 mb-3">Builder Not Found</h1>
            <p className="text-navy-500 mb-6">We couldn&apos;t find a builder with that name.</p>
            <Link href="/builders" className="btn-navy">
              View All Builders
            </Link>
          </div>
        </main>
        <Footer />
        <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Deduplicate included features across all communities
  const allIncluded = Array.from(
    new Set(builder.communities.flatMap((c) => c.includedFeatures))
  );

  const activeIncentives = builder.incentives.filter((i) => i.active);

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="utah-hero-bg text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo — use official image if available, else initials fallback */}
            {builder.logoUrl ? (
              <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-lg p-3">
                <Image
                  src={builder.logoUrl}
                  alt={`${builder.name} logo`}
                  width={112}
                  height={112}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = builder.logoColor;
                      parent.innerHTML = `<span class="text-white font-extrabold text-3xl tracking-wide">${builder.logoInitials}</span>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ backgroundColor: builder.logoColor }}
              >
                <span className="text-white font-extrabold text-3xl tracking-wide">
                  {builder.logoInitials}
                </span>
              </div>
            )}

            {builder.featured && (
              <div className="inline-flex items-center gap-1.5 bg-gold-500/20 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Star size={12} fill="currentColor" />
                Featured Builder
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{builder.name}</h1>
            <p className="text-gold-300 font-semibold text-lg mb-10">{builder.tagline}</p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center divide-x divide-white/10 bg-white/5 rounded-2xl px-2 py-1 mb-10 max-w-2xl mx-auto">
              <StatChip label="Years in Business" value={builder.yearsInBusiness} />
              <StatChip label="Homes Built" value={builder.homesBuilt} />
              <StatChip label="Warranty" value={`${builder.warrantyYears}-Year`} />
              <StatChip
                label="Price Range"
                value={`$${Math.round(builder.priceMin / 1000)}K–$${Math.round(builder.priceMax / 1000)}K`}
              />
              <StatChip label="Areas Served" value={`${builder.areas.length} Counties`} />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                Schedule Free Consultation
                <ChevronRight size={16} />
              </button>
              <a
                href={builder.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                Visit Builder Website
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Communities ───────────────────────────────────────────────────── */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="section-heading mb-2">
              {builder.communities.length} Active{' '}
              {builder.communities.length === 1 ? 'Community' : 'Communities'}
            </h2>
            <p className="section-sub mb-10">
              Browse all {builder.name} communities available in Utah.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {builder.communities.map((community) => {
                const activeCount = community.incentives.filter((i) => i.active).length;
                return (
                  <Link
                    key={community.id}
                    href={`/communities/${community.slug}`}
                    className="card p-5 flex flex-col gap-3 group"
                  >
                    {/* Color banner */}
                    <div
                      className="h-2 rounded-t-lg -mx-5 -mt-5 mb-1"
                      style={{ backgroundColor: community.photoColor }}
                    />

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors text-sm leading-snug">
                          {community.name}
                        </h3>
                        <div className="flex items-center gap-1 text-navy-500 text-xs mt-0.5">
                          <MapPin size={11} />
                          {community.city}, {community.county}
                        </div>
                      </div>
                      <StatusBadge status={community.status} />
                    </div>

                    {/* Price + sqft */}
                    <div className="text-sm text-navy-700">
                      <span className="font-semibold text-navy-900">
                        {fmt(community.priceMin)}–{fmt(community.priceMax)}
                      </span>
                      <span className="text-navy-400 ml-2 text-xs">
                        {community.sqftMin.toLocaleString()}–{community.sqftMax.toLocaleString()} sqft
                      </span>
                    </div>

                    {/* Beds */}
                    <div className="text-xs text-navy-500">
                      <Home size={12} className="inline mr-1 text-gold-500" />
                      {community.bedsRange} beds &middot; {community.garageSpaces}-car garage
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      <TypeBadge type={community.type} />
                      {community.availableLots != null && community.status !== 'sold-out' && (
                        <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {community.availableLots} lots left
                        </span>
                      )}
                      {activeCount > 0 && (
                        <span className="bg-gold-100 text-gold-600 text-xs font-semibold px-2 py-0.5 rounded-full incentive-pulse">
                          {activeCount} Incentive{activeCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Community Map ──────────────────────────────────────────────────── */}
        {builder.communities.filter(c => c.lat && c.lng).length > 0 && (
          <section className="py-16 bg-white px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="section-heading mb-2">Community Locations</h2>
              <p className="section-sub mb-8">
                {builder.name} has {builder.communities.length} active{' '}
                {builder.communities.length === 1 ? 'community' : 'communities'} across Utah.
              </p>
              <div className="h-[420px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <MapView communities={builder.communities} />
              </div>
            </div>
          </section>
        )}

        {/* ── Included Features ─────────────────────────────────────────────── */}
        {allIncluded.length > 0 && (
          <section className="py-16 bg-gray-50 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="section-heading mb-2">What&apos;s Included Standard</h2>
              <p className="section-sub mb-10">
                Features that come standard across {builder.name} homes — no upsell needed.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {allIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Active Incentives ─────────────────────────────────────────────── */}
        {activeIncentives.length > 0 && (
          <section className="py-16 bg-gold-50 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Tag size={22} className="text-gold-500" />
                <h2 className="section-heading">Current Incentives</h2>
              </div>
              <p className="section-sub mb-10">
                Active deals from {builder.name} — ask your agent to lock these in.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeIncentives.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-white rounded-xl p-5 border border-gold-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-navy-900 text-sm leading-snug">{inc.title}</h3>
                      <IncentiveBadge incentive={inc} size="sm" />
                    </div>
                    <p className="text-navy-600 text-sm mb-3 leading-relaxed">{inc.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gold-600 text-base">{inc.value}</span>
                      {inc.expiresDate && (
                        <div className="flex items-center gap-1 text-navy-400 text-xs">
                          <Calendar size={11} />
                          Expires{' '}
                          {new Date(inc.expiresDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── About ─────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">About {builder.name}</h2>
                <p className="text-navy-600 leading-relaxed mb-6">{builder.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield size={16} className="text-gold-500 flex-shrink-0" />
                    <span className="text-navy-700">
                      <strong>{builder.warrantyYears}-year</strong> structural warranty
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users size={16} className="text-gold-500 flex-shrink-0" />
                    <span className="text-navy-700">
                      <strong>{builder.homesBuilt}</strong> homes built
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-700">Serving {builder.areas.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-navy-900 text-white rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Contact {builder.name}</h3>
                <div className="space-y-3 mb-5 text-sm">
                  <a
                    href={`tel:${builder.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 text-navy-300 hover:text-white transition-colors"
                  >
                    <Phone size={15} className="text-gold-400" />
                    {builder.phone}
                  </a>
                  <a
                    href={`mailto:${builder.email}`}
                    className="flex items-center gap-3 text-navy-300 hover:text-white transition-colors"
                  >
                    <Mail size={15} className="text-gold-400" />
                    {builder.email}
                  </a>
                  <a
                    href={builder.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-navy-300 hover:text-white transition-colors"
                  >
                    <ExternalLink size={15} className="text-gold-400" />
                    {builder.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <p className="text-navy-400 text-xs mb-4">
                  Want expert help navigating this builder? Get free buyer representation — we attend every meeting and negotiate on your behalf.
                </p>
                <button onClick={() => setModalOpen(true)} className="btn-primary w-full justify-center">
                  Schedule Free Consultation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <section className="py-16 bg-navy-900 px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-extrabold mb-3">
              Ready to explore {builder.name} communities?
            </h2>
            <p className="text-navy-300 mb-8">
              Get free buyer representation — we attend every meeting and fight for your best deal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                Schedule Free Consultation
                <ChevronRight size={16} />
              </button>
              <Link
                href="/builders"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                View All Builders
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
