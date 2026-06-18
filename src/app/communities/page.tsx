'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllCommunities } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpecHomeCard from '@/components/SpecHomeCard';
import BookingModal from '@/components/BookingModal';
import { Community, SpecHome, FloorPlan } from '@/types';
import {
  Search, SlidersHorizontal, Tag, Zap, HardHat, ChevronDown, ChevronUp,
  BedDouble, Bath, Car, Maximize2, MapPin, Home, Building2, CheckCircle2,
} from 'lucide-react';
import { Suspense } from 'react';

// ─── Static data ───────────────────────────────────────────────────────────────
const allCommunities = getAllCommunities();
const allCities = [...new Set(allCommunities.map((c) => c.city))].sort();
const allBuilderNames = [...new Set(allCommunities.map((c) => c.builderName))].sort();
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ─── Floor Plan Card ───────────────────────────────────────────────────────────
function FloorPlanCard({
  plan,
  community,
  onInquire,
}: {
  plan: FloorPlan;
  community: Community;
  onInquire: (c: Community) => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gold-200 transition-all group">
      {/* Name + price */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">
            {plan.name}
          </div>
          <div className="text-xs text-navy-500 mt-0.5">{plan.stories}</div>
        </div>
        <div className="text-right">
          <div className="font-extrabold text-gold-600 text-lg leading-none">{fmt(plan.basePrice)}</div>
          <div className="text-[10px] text-navy-400 mt-0.5">base price</div>
        </div>
      </div>

      {/* Sq ft range */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-navy-600 font-medium bg-navy-50 rounded-lg px-2.5 py-1.5">
        <Maximize2 size={11} className="text-navy-400" />
        {plan.sqftMin.toLocaleString()} – {plan.sqftMax.toLocaleString()} sq ft
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { icon: BedDouble, value: plan.beds, label: 'Beds' },
          { icon: Bath, value: plan.baths, label: 'Baths' },
          { icon: Car, value: plan.garage, label: 'Garage' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
            <Icon size={12} className="mx-auto text-navy-400 mb-0.5" />
            <div className="text-xs font-bold text-navy-900 leading-none">{value}</div>
            <div className="text-[10px] text-navy-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Basement badge */}
      {plan.hasBasement && (
        <div className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full mb-3 font-medium">
          <CheckCircle2 size={10} /> Basement available
        </div>
      )}

      <button
        onClick={() => onInquire(community)}
        className="w-full text-center text-xs font-semibold text-navy-700 hover:text-gold-700 border border-navy-100 hover:border-gold-300 hover:bg-gold-50 rounded-lg py-2 transition-all"
      >
        Inquire About This Plan
      </button>
    </div>
  );
}

// ─── Dirt Build Row (community + expandable floor plans) ───────────────────────
function DirtBuildRow({
  community,
  onInquire,
}: {
  community: Community;
  onInquire: (c: Community) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const plans = community.floorPlans ?? [];

  const basePriceMin = plans.length > 0 ? Math.min(...plans.map((p) => p.basePrice)) : community.priceMin;
  const basePriceMax = plans.length > 0 ? Math.max(...plans.map((p) => p.basePrice)) : community.priceMax;
  const sqftMin = plans.length > 0 ? Math.min(...plans.map((p) => p.sqftMin)) : community.sqftMin;
  const sqftMax = plans.length > 0 ? Math.max(...plans.map((p) => p.sqftMax)) : community.sqftMax;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Community header */}
      <div className="flex items-start gap-4 p-5">
        {/* Builder colour badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm shadow-sm"
          style={{ backgroundColor: community.photoColor }}
        >
          {community.builderName.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-bold text-navy-900 text-base leading-snug">{community.name}</div>
              <div className="flex items-center gap-1.5 text-sm text-navy-500 mt-0.5 flex-wrap">
                <MapPin size={12} className="flex-shrink-0" />
                <span>{community.city}, {community.county}</span>
                <span className="text-navy-200">·</span>
                <span className="font-semibold text-gold-600">{community.builderName}</span>
                {community.status === 'coming-soon' && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-extrabold text-navy-900">
                {fmt(basePriceMin)}
                {basePriceMax > basePriceMin && <span> – {fmt(basePriceMax)}</span>}
              </div>
              <div className="text-xs text-navy-400">
                {sqftMin.toLocaleString()} – {sqftMax.toLocaleString()} sq ft
              </div>
            </div>
          </div>

          {/* Pill tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
              {community.bedsRange} beds
            </span>
            <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
              {community.garageSpaces}-car garage
            </span>
            {community.availableLots != null && community.availableLots > 0 && (
              <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {community.availableLots} lots available
              </span>
            )}
            {community.lotSizeMin && community.lotSizeMax && (
              <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
                {community.lotSizeMin.toLocaleString()}–{community.lotSizeMax.toLocaleString()} sq ft lots
              </span>
            )}
            {community.hoa && (
              <span className="text-xs bg-gold-50 text-gold-700 px-2.5 py-1 rounded-full font-medium">
                HOA ${community.hoa.monthly}/mo
              </span>
            )}
            {community.basement?.available && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                Basement available
              </span>
            )}
            {community.incentives.some((i) => i.active) && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Tag size={10} /> Active incentives
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floor plans expand button */}
      {plans.length > 0 && (
        <>
          <div className="border-t border-gray-50">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-navy-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 size={14} className="text-gold-500" />
                {plans.length} Floor Plan{plans.length !== 1 ? 's' : ''} Available
                <span className="text-xs font-normal text-navy-400 hidden sm:inline">
                  · {fmt(basePriceMin)} – {fmt(basePriceMax)} · {sqftMin.toLocaleString()}–{sqftMax.toLocaleString()} sq ft
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-navy-400">{expanded ? 'Collapse' : 'Browse plans'}</span>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
          </div>

          {expanded && (
            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {plans.map((plan) => (
                  <FloorPlanCard
                    key={plan.name}
                    plan={plan}
                    community={community}
                    onInquire={onInquire}
                  />
                ))}
              </div>

              {/* Active incentives detail */}
              {community.incentives.filter((i) => i.active).length > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                    <Tag size={11} /> Active Incentives for {community.name}
                  </div>
                  {community.incentives.filter((i) => i.active).map((inc) => (
                    <div key={inc.id} className="flex items-start justify-between gap-2">
                      <div className="text-xs text-amber-900">{inc.description}</div>
                      <div className="text-xs font-bold text-amber-700 whitespace-nowrap">{inc.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button onClick={() => onInquire(community)} className="btn-primary text-sm py-2">
                  Get Representation for {community.builderName}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────
type TabType = 'spec' | 'dirt';
type SpecStatus = 'all' | 'move-in-ready' | 'under-construction';

function CommunitiesContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) ?? 'dirt';

  const [tab, setTab] = useState<TabType>(initialTab);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [cityFilter, setCityFilter] = useState('');
  const [builderFilter, setBuilderFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(0);
  const [specStatus, setSpecStatus] = useState<SpecStatus>('all');
  const [incentivesOnly, setIncentivesOnly] = useState(searchParams.get('filter') === 'incentives');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<SpecHome | null>(null);

  // ── Spec home pairs ──
  const allSpecPairs = useMemo(() => {
    const pairs: { spec: SpecHome; community: Community }[] = [];
    for (const c of allCommunities) {
      for (const s of c.specHomes ?? []) pairs.push({ spec: s, community: c });
    }
    const order: Record<string, number> = { 'move-in-ready': 0, 'under-construction': 1, available: 2 };
    return pairs.sort((a, b) => (order[a.spec.status] ?? 3) - (order[b.spec.status] ?? 3));
  }, []);

  const filteredSpecs = useMemo(() => {
    return allSpecPairs.filter(({ spec, community }) => {
      const q = query.toLowerCase();
      return (
        (!query ||
          community.name.toLowerCase().includes(q) ||
          community.city.toLowerCase().includes(q) ||
          community.builderName.toLowerCase().includes(q) ||
          spec.address?.toLowerCase().includes(q) ||
          spec.floorPlan?.toLowerCase().includes(q)) &&
        (!cityFilter || community.city === cityFilter) &&
        (!builderFilter || community.builderName === builderFilter) &&
        (!maxPrice || spec.price <= maxPrice) &&
        (specStatus === 'all' || spec.status === specStatus)
      );
    });
  }, [allSpecPairs, query, cityFilter, builderFilter, maxPrice, specStatus]);

  // ── Dirt build communities ──
  const dirtCommunities = useMemo(() => {
    return allCommunities
      .filter((c) => c.type !== 'spec-only')
      .filter((c) => {
        const q = query.toLowerCase();
        return (
          (!query ||
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.builderName.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.floorPlans ?? []).some((fp) => fp.name.toLowerCase().includes(q))) &&
          (!cityFilter || c.city === cityFilter) &&
          (!builderFilter || c.builderName === builderFilter) &&
          (!maxPrice || c.priceMin <= maxPrice) &&
          (!incentivesOnly || c.incentives.some((i) => i.active))
        );
      });
  }, [query, cityFilter, builderFilter, maxPrice, incentivesOnly]);

  const totalFloorPlans = useMemo(
    () => dirtCommunities.reduce((sum, c) => sum + (c.floorPlans?.length ?? 0), 0),
    [dirtCommunities]
  );

  const moveInCount = allSpecPairs.filter((p) => p.spec.status === 'move-in-ready').length;
  const underConCount = allSpecPairs.filter((p) => p.spec.status === 'under-construction').length;
  const dirtTotal = allCommunities.filter((c) => c.type !== 'spec-only').length;

  const openModal = (community?: Community, spec?: SpecHome) => {
    setSelectedCommunity(community ?? null);
    setSelectedSpec(spec ?? null);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setQuery('');
    setCityFilter('');
    setBuilderFilter('');
    setMaxPrice(0);
    setSpecStatus('all');
    setIncentivesOnly(false);
  };

  const hasFilters = !!(query || cityFilter || builderFilter || maxPrice || incentivesOnly);

  return (
    <>
      <Header onGetRepresented={() => openModal()} />

      <main className="min-h-screen bg-gray-50">
        {/* ── Hero / Tab switcher ── */}
        <div className="bg-navy-900 text-white py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-2">
              Utah New Construction — One Stop Shop
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl mb-8">
              Move into a finished spec home now, or choose a lot and floor plan for a custom dirt build.
              Every Utah community, all in one place.
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTab('spec')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  tab === 'spec'
                    ? 'bg-gold-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                <Zap size={15} />
                Spec Homes
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    tab === 'spec' ? 'bg-white/25 text-white' : 'bg-navy-700 text-navy-300'
                  }`}
                >
                  {allSpecPairs.length}
                </span>
              </button>

              <button
                onClick={() => setTab('dirt')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  tab === 'dirt'
                    ? 'bg-gold-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                <Home size={15} />
                Dirt Builds &amp; Floor Plans
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    tab === 'dirt' ? 'bg-white/25 text-white' : 'bg-navy-700 text-navy-300'
                  }`}
                >
                  {dirtTotal}
                </span>
              </button>
            </div>

            {/* Tab sub-stats */}
            {tab === 'spec' && (
              <div className="flex flex-wrap gap-4 mt-5 text-sm text-navy-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  {moveInCount} move-in ready
                </span>
                <span className="flex items-center gap-1.5">
                  <HardHat size={13} className="text-amber-400" />
                  {underConCount} under construction
                </span>
              </div>
            )}
            {tab === 'dirt' && (
              <div className="flex flex-wrap gap-4 mt-5 text-sm text-navy-300">
                <span className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-gold-400" />
                  {allCommunities.filter((c) => c.type !== 'spec-only').reduce((s, c) => s + (c.floorPlans?.length ?? 0), 0)} floor plans across {dirtTotal} communities
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* ── Shared filters ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    tab === 'spec'
                      ? 'Search by address, builder, floor plan...'
                      : 'Search communities, floor plans, features...'
                  }
                  className="input-field pl-9 py-2.5"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className="input-field py-2.5 sm:w-44 bg-white"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">All Cities</option>
                {allCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                className="input-field py-2.5 sm:w-52 bg-white"
                value={builderFilter}
                onChange={(e) => setBuilderFilter(e.target.value)}
              >
                <option value="">All Builders</option>
                {allBuilderNames.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="input-field py-2 text-sm w-40 bg-white"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              >
                <option value={0}>Any Price</option>
                <option value={400000}>Up to $400K</option>
                <option value={500000}>Up to $500K</option>
                <option value={600000}>Up to $600K</option>
                <option value={750000}>Up to $750K</option>
                <option value={1000000}>Up to $1M</option>
              </select>

              {/* Spec-only filter */}
              {tab === 'spec' && (
                <div className="flex gap-1.5 flex-wrap">
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'move-in-ready', label: '✅ Move-In Ready' },
                      { key: 'under-construction', label: '🏗 Under Construction' },
                    ] as { key: SpecStatus; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSpecStatus(key)}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                        specStatus === key
                          ? 'bg-navy-900 text-white'
                          : 'bg-gray-100 text-navy-600 hover:bg-navy-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Dirt-only filter */}
              {tab === 'dirt' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incentivesOnly}
                    onChange={(e) => setIncentivesOnly(e.target.checked)}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-sm font-medium text-navy-700 flex items-center gap-1">
                    <Tag size={13} className="text-gold-500" /> Active incentives only
                  </span>
                </label>
              )}

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-navy-500 hover:text-navy-800 underline ml-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ══ SPEC HOMES TAB ══════════════════════════════════════════════════ */}
          {tab === 'spec' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-800">{moveInCount} Move-In Ready</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                    <HardHat size={13} className="text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">{underConCount} Under Construction</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-navy-500 text-sm">
                    Showing <span className="font-semibold text-navy-900">{filteredSpecs.length}</span> of {allSpecPairs.length}
                  </p>
                  <button onClick={() => openModal()} className="btn-primary text-sm py-2">
                    Get My Free Spec List
                  </button>
                </div>
              </div>

              {filteredSpecs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpecs.map(({ spec, community }) => (
                    <SpecHomeCard
                      key={spec.id}
                      spec={spec}
                      community={community}
                      onGetInfo={(c, s) => openModal(c, s)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-navy-500">
                  <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No spec homes match your filters.</p>
                  <button onClick={clearFilters} className="btn-ghost mt-2 text-sm">
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══ DIRT BUILDS TAB ═════════════════════════════════════════════════ */}
          {tab === 'dirt' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-navy-500 text-sm">
                  <span className="font-semibold text-navy-900">{dirtCommunities.length}</span> communities ·{' '}
                  <span className="font-semibold text-navy-900">{totalFloorPlans}</span> floor plans
                </p>
                <button onClick={() => openModal()} className="btn-primary text-sm py-2">
                  Get Free Representation
                </button>
              </div>

              {dirtCommunities.length > 0 ? (
                <div className="space-y-4">
                  {dirtCommunities.map((community) => (
                    <DirtBuildRow
                      key={community.id}
                      community={community}
                      onInquire={(c) => openModal(c)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-navy-500">
                  <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No communities match your filters.</p>
                  <button onClick={clearFilters} className="btn-ghost mt-2 text-sm">
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default function CommunitiesPage() {
  return (
    <Suspense>
      <CommunitiesContent />
    </Suspense>
  );
}
