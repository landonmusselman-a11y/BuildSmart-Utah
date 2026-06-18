'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllCommunities } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IncentiveBadge from '@/components/IncentiveBadge';
import BookingModal from '@/components/BookingModal';
import { SpecHome } from '@/types';
import {
  CheckCircle,
  MapPin,
  ExternalLink,
  ChevronRight,
  Tag,
  Calendar,
  Home,
  Layers,
  DollarSign,
  Car,
  Maximize2,
  BedDouble,
  Bath,
  GraduationCap,
  Star,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtSqft = (n: number) => `${n.toLocaleString()} sq ft`;

// ─── Inline sub-components ───────────────────────────────────────────────────

type CommunityStatus = 'selling' | 'coming-soon' | 'sold-out';
type CommunityType = 'spec-only' | 'dirt-only' | 'both';

function StatusBadge({ status }: { status: CommunityStatus }) {
  const map: Record<CommunityStatus, { label: string; cls: string }> = {
    selling: { label: 'Selling Now', cls: 'bg-green-100 text-green-800' },
    'coming-soon': { label: 'Coming Soon', cls: 'bg-amber-100 text-amber-800' },
    'sold-out': { label: 'Sold Out', cls: 'bg-gray-100 text-gray-600' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: CommunityType }) {
  const map: Record<CommunityType, { label: string; cls: string }> = {
    'spec-only': { label: 'Spec Homes', cls: 'bg-blue-100 text-blue-700' },
    'dirt-only': { label: 'Build on Lot', cls: 'bg-purple-100 text-purple-700' },
    both: { label: 'Spec & Dirt', cls: 'bg-navy-100 text-navy-700' },
  };
  const { label, cls } = map[type];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function SpecStatusBadge({ status }: { status: SpecHome['status'] }) {
  const map: Record<SpecHome['status'], { label: string; cls: string }> = {
    'move-in-ready': { label: 'Move-In Ready', cls: 'bg-green-100 text-green-800' },
    'under-construction': { label: 'Under Construction', cls: 'bg-blue-100 text-blue-700' },
    available: { label: 'Available', cls: 'bg-gray-100 text-gray-600' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function StatBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center text-center px-3 py-4 gap-1">
      <Icon size={16} className="text-navy-700 mb-1" />
      <span className="font-bold text-navy-900 text-sm leading-tight">{value}</span>
      <span className="text-navy-500 text-xs">{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityDetailPage({ params }: { params: { slug: string } }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [specFilter, setSpecFilter] = useState<'all' | 'move-in-ready' | 'under-construction'>(
    'all'
  );

  const community = getAllCommunities().find((c) => c.slug === params.slug);

  if (!community) {
    return (
      <>
        <Header onGetRepresented={() => setModalOpen(true)} />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy-900 mb-3">Community Not Found</h1>
            <p className="text-navy-500 mb-6">
              We couldn&apos;t find a community with that name.
            </p>
            <Link href="/communities" className="btn-navy">
              View All Communities
            </Link>
          </div>
        </main>
        <Footer />
        <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const activeIncentives = community.incentives.filter((i) => i.active);

  const filteredSpecHomes =
    specFilter === 'all'
      ? community.specHomes
      : community.specHomes.filter((s) => s.status === specFilter);

  const availabilityLabel =
    community.availableLots === null
      ? 'Call for availability'
      : community.availableLots != null
      ? `${community.availableLots} lots available`
      : 'Contact for availability';

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="utah-hero-bg text-white py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-navy-300 text-sm mb-6">
              <Link href="/builders" className="hover:text-white transition-colors">
                Builders
              </Link>
              <span>/</span>
              <Link
                href={`/builders/${community.builderSlug}`}
                className="hover:text-white transition-colors"
              >
                {community.builderName}
              </Link>
              <span>/</span>
              <span className="text-white">{community.name}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{community.name}</h1>

            <p className="text-gold-300 font-semibold text-lg mb-2">
              by{' '}
              <Link
                href={`/builders/${community.builderSlug}`}
                className="hover:text-white transition-colors underline underline-offset-2"
              >
                {community.builderName}
              </Link>
            </p>

            <div className="flex items-center gap-2 text-navy-300 text-sm mb-6">
              <MapPin size={14} />
              {community.city}, {community.county}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <StatusBadge status={community.status} />
              <TypeBadge type={community.type} />
            </div>

            {/* Price */}
            <div className="text-3xl font-extrabold text-white mb-8">
              {fmt(community.priceMin)}
              <span className="text-navy-300 font-normal mx-2">–</span>
              {fmt(community.priceMax)}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                Schedule Free Consultation
                <ChevronRight size={16} />
              </button>
              <a
                href={community.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                View on Google Maps
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Key Stats bar ─────────────────────────────────────────────────── */}
        <div className="bg-gold-500 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-5 divide-x divide-gold-400">
            <StatBar
              label="Price Range"
              value={`$${Math.round(community.priceMin / 1000)}K–$${Math.round(community.priceMax / 1000)}K`}
              icon={DollarSign}
            />
            <StatBar
              label="Square Feet"
              value={`${community.sqftMin.toLocaleString()}–${community.sqftMax.toLocaleString()}`}
              icon={Maximize2}
            />
            <StatBar label="Beds" value={community.bedsRange} icon={BedDouble} />
            <StatBar
              label="Garage"
              value={`${community.garageSpaces}-Car`}
              icon={Car}
            />
            <StatBar
              label="Lots"
              value={availabilityLabel}
              icon={Home}
            />
          </div>
        </div>

        {/* ── Description + Features + Cards ────────────────────────────────── */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10">
              {/* Left: description + features */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-navy-900 mb-4">About this Community</h2>
                <p className="text-navy-600 leading-relaxed mb-6">{community.description}</p>

                {community.features.length > 0 && (
                  <>
                    <h3 className="font-bold text-navy-900 mb-3">Community Highlights</h3>
                    <ul className="space-y-2">
                      {community.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-navy-700">
                          <CheckCircle size={15} className="text-gold-500 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Right: HOA, Basement, Lot sizes */}
              <div className="space-y-4">
                {/* HOA */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-gold-500" />
                    HOA
                  </h3>
                  {community.hoa ? (
                    <>
                      <div className="text-2xl font-extrabold text-navy-900 mb-1">
                        ${community.hoa.monthly}/mo
                      </div>
                      <ul className="space-y-1 mt-2">
                        {community.hoa.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-navy-600">
                            <CheckCircle size={11} className="text-gold-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-green-700 font-semibold text-sm">No HOA</p>
                  )}
                </div>

                {/* Basement */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                    <Home size={14} className="text-gold-500" />
                    Basement
                  </h3>
                  {community.basement.available ? (
                    <div className="space-y-1.5 text-xs text-navy-600">
                      <div className="text-green-700 font-semibold text-sm mb-2">
                        Available
                      </div>
                      {community.basement.finishedIncluded ? (
                        <p className="font-medium text-green-700">Finished basement included</p>
                      ) : (
                        <p>Unfinished (finish yourself)</p>
                      )}
                      {community.basement.sqft && (
                        <p>{fmtSqft(community.basement.sqft)} basement</p>
                      )}
                      {community.basement.finishCostMin && community.basement.finishCostMax && (
                        <p>
                          Finish cost: {fmt(community.basement.finishCostMin)}–
                          {fmt(community.basement.finishCostMax)}
                        </p>
                      )}
                      {community.basement.notes && (
                        <p className="italic text-navy-400">{community.basement.notes}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-navy-500 text-sm">Not available</p>
                  )}
                </div>

                {/* Lot sizes */}
                {community.lotSizeMin && community.lotSizeMax && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-2">
                      <Maximize2 size={14} className="text-gold-500" />
                      Lot Sizes
                    </h3>
                    <p className="text-navy-700 text-sm">
                      {fmtSqft(community.lotSizeMin)} – {fmtSqft(community.lotSizeMax)}
                    </p>
                    {community.totalLots && (
                      <p className="text-navy-400 text-xs mt-1">
                        {community.totalLots} total lots planned
                      </p>
                    )}
                  </div>
                )}

                {/* School District */}
                {community.schoolDistrict && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-2">
                      <GraduationCap size={14} className="text-blue-500" />
                      School District
                    </h3>
                    <p className="text-navy-700 text-sm font-semibold">{community.schoolDistrict}</p>
                  </div>
                )}

                {/* Builder Website */}
                {community.websiteUrl && (
                  <a
                    href={community.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gold-300 hover:bg-gold-50 transition-colors"
                  >
                    <ExternalLink size={14} className="text-gold-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-navy-800 text-sm">View on Builder Site</p>
                      <p className="text-navy-400 text-xs mt-0.5">Official listings & floor plans</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Floor Plans ───────────────────────────────────────────────────── */}
        {community.floorPlans.length > 0 && (
          <section className="py-16 bg-gray-50 px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="section-heading mb-2">Floor Plans</h2>
              <p className="section-sub mb-10">
                {community.floorPlans.length} floor plan
                {community.floorPlans.length > 1 ? 's' : ''} available in {community.name}.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {community.floorPlans.map((plan) => (
                  <div key={plan.name} className="card p-5 flex flex-col gap-4">
                    {/* Plan name + stories */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-navy-900">{plan.name}</h3>
                        <span className="text-navy-400 text-xs">{plan.stories}</span>
                      </div>
                      {plan.hasBasement && (
                        <span className="bg-navy-100 text-navy-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Basement
                        </span>
                      )}
                    </div>

                    {/* Base price */}
                    <div className="text-gold-600 font-bold text-lg">
                      From {fmt(plan.basePrice)}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">
                          {plan.sqftMin.toLocaleString()}–{plan.sqftMax.toLocaleString()}
                        </div>
                        <div className="text-navy-400">sq ft</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">{plan.beds}</div>
                        <div className="text-navy-400">beds</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">{plan.baths}</div>
                        <div className="text-navy-400">baths</div>
                      </div>
                    </div>

                    <div className="text-xs text-navy-500">
                      <Car size={12} className="inline mr-1 text-gold-400" />
                      {plan.garage}-car garage
                    </div>

                    <button
                      onClick={() => setModalOpen(true)}
                      className="btn-outline text-sm py-2 px-4 mt-auto justify-center"
                    >
                      Schedule Free Consultation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Spec Homes ────────────────────────────────────────────────────── */}
        {community.specHomes.length > 0 && (
          <section className="py-16 bg-white px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="section-heading mb-1">
                    Spec Homes{' '}
                    <span className="text-navy-400 font-normal text-2xl">
                      ({community.specHomes.length})
                    </span>
                  </h2>
                  <p className="text-navy-500 text-sm">
                    Pre-built homes available now or coming soon.
                  </p>
                </div>
                {/* Filter buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {(['all', 'move-in-ready', 'under-construction'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setSpecFilter(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        specFilter === f
                          ? 'bg-navy-900 text-white'
                          : 'bg-gray-100 text-navy-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all'
                        ? 'All'
                        : f === 'move-in-ready'
                        ? 'Move-In Ready'
                        : 'Under Construction'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {filteredSpecHomes.map((spec) => (
                  <div key={spec.id} className="card p-5 flex flex-col gap-4">
                    {/* Address + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-navy-500 text-xs mb-1">
                          <MapPin size={11} />
                          {spec.address}
                        </div>
                        {spec.floorPlan && (
                          <span className="text-navy-400 text-xs">{spec.floorPlan} plan</span>
                        )}
                      </div>
                      <SpecStatusBadge status={spec.status} />
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-extrabold text-navy-900">
                      {fmt(spec.price)}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">
                          {spec.sqft.toLocaleString()}
                        </div>
                        <div className="text-navy-400">sq ft</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">{spec.beds}</div>
                        <div className="text-navy-400">
                          <BedDouble size={10} className="inline" /> beds
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">{spec.baths}</div>
                        <div className="text-navy-400">
                          <Bath size={10} className="inline" /> baths
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="font-bold text-navy-900 text-sm">{spec.garage}</div>
                        <div className="text-navy-400">
                          <Car size={10} className="inline" /> car
                        </div>
                      </div>
                    </div>

                    {/* Completion date */}
                    {spec.completionDate && (
                      <div className="flex items-center gap-1.5 text-navy-500 text-xs">
                        <Calendar size={12} />
                        Est. completion: {spec.completionDate}
                      </div>
                    )}

                    {/* Highlights */}
                    {spec.highlights.length > 0 && (
                      <ul className="space-y-1">
                        {spec.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-start gap-2 text-xs text-navy-600"
                          >
                            <CheckCircle size={11} className="text-gold-500 mt-0.5 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => setModalOpen(true)}
                      className="btn-primary text-sm py-2.5 mt-auto justify-center"
                    >
                      Schedule Free Consultation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Included Features ─────────────────────────────────────────────── */}
        {community.includedFeatures.length > 0 && (
          <section className="py-16 bg-gray-50 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="section-heading mb-2">What&apos;s Included Standard</h2>
              <p className="section-sub mb-10">
                Every home in {community.name} comes with these features at no extra cost.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {community.includedFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Community Amenities ───────────────────────────────────────────── */}
        {community.amenities && community.amenities.length > 0 && (
          <section className="py-16 bg-white px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Star size={22} className="text-gold-500" />
                <h2 className="section-heading">Community Amenities</h2>
              </div>
              <p className="section-sub mb-10">
                What {community.name} residents enjoy as part of the community.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {community.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <CheckCircle size={15} className="text-gold-500 flex-shrink-0" />
                    <span className="text-navy-700 text-sm font-medium">{amenity}</span>
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
                Active deals for {community.name} — ask your agent to lock these in.
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

        {/* ── Location ──────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-heading mb-2">Location</h2>
            <p className="section-sub mb-8">Find {community.name} in {community.city}, Utah.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex-1">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{community.address}</p>
                    <p className="text-navy-500 text-xs mt-1">
                      {community.city}, {community.county}, Utah
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <a
                    href={community.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-navy text-sm py-2.5 justify-center"
                  >
                    Open in Google Maps
                    <ExternalLink size={14} />
                  </a>
                  {community.communityMapUrl && (
                    <a
                      href={community.communityMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-2.5 justify-center"
                    >
                      View Community Map
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <section className="py-16 bg-navy-900 px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-extrabold mb-3">
              Interested in {community.name}?
            </h2>
            <p className="text-navy-300 mb-8">
              Get free buyer representation — we attend every meeting, review all contracts, and negotiate your best deal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary"
              >
                Schedule Free Consultation
                <ChevronRight size={16} />
              </button>
              <Link
                href="/communities"
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
              >
                View All Communities
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
