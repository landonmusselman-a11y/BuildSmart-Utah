'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { mockBuilders, getStats } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { SlidersHorizontal, X, Tag } from 'lucide-react';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
      <div className="text-navy-600 font-medium">Loading map...</div>
    </div>
  ),
});

type MapFilters = {
  builderSlugs: string[];
  status: 'all' | 'selling' | 'coming-soon' | 'sold-out';
  priceMax: number;
  type: 'all' | 'spec-only' | 'dirt-only' | 'both';
  hasIncentives: boolean;
};

const allCommunities = mockBuilders.flatMap((b) => b.communities);
const allBuilders = [...mockBuilders]
  .sort((a, b) => a.name.localeCompare(b.name));
const stats = getStats();

const PRICE_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: 'Under $400K', value: 400000 },
  { label: 'Under $500K', value: 500000 },
  { label: 'Under $600K', value: 600000 },
  { label: 'Under $700K', value: 700000 },
];

const defaultFilters: MapFilters = {
  builderSlugs: [],
  status: 'all',
  priceMax: 0,
  type: 'all',
  hasIncentives: false,
};

export default function MapPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);

  const filteredCommunities = useMemo(() => {
    return allCommunities.filter((c) => {
      if (filters.builderSlugs.length > 0 && !filters.builderSlugs.includes(c.builderSlug)) return false;
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.priceMax > 0 && c.priceMin > filters.priceMax) return false;
      if (filters.type !== 'all' && c.type !== filters.type) return false;
      if (filters.hasIncentives && !c.incentives.some((i) => i.active)) return false;
      return true;
    });
  }, [filters]);

  const toggleBuilder = (slug: string) => {
    setFilters((prev) => ({
      ...prev,
      builderSlugs: prev.builderSlugs.includes(slug)
        ? prev.builderSlugs.filter((s) => s !== slug)
        : [...prev.builderSlugs, slug],
    }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  const hasActiveFilters =
    filters.builderSlugs.length > 0 ||
    filters.status !== 'all' ||
    filters.priceMax !== 0 ||
    filters.type !== 'all' ||
    filters.hasIncentives;

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      {/* Compact hero */}
      <div className="bg-navy-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">Utah New Construction Map</h1>
            <p className="text-navy-300 text-sm mt-0.5">
              Browse all active communities — filter by builder, price, and type
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gold-400 text-lg leading-none">{stats.communities}</div>
              <div className="text-navy-400 text-xs mt-0.5">Communities</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gold-400 text-lg leading-none">{stats.citiesServed}</div>
              <div className="text-navy-400 text-xs mt-0.5">Cities</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gold-400 text-lg leading-none">{stats.builders}</div>
              <div className="text-navy-400 text-xs mt-0.5">Builders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map layout */}
      <div className="flex h-[calc(100vh-180px)] overflow-hidden">
        {/* Filter sidebar */}
        <div
          className={`bg-white border-r border-gray-200 flex flex-col overflow-y-auto transition-all duration-300 flex-shrink-0 ${
            filtersOpen ? 'w-72' : 'w-0 overflow-hidden'
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-navy-900 text-sm">Filter Communities</h2>
              <p className="text-xs text-navy-500 mt-0.5">
                Showing {filteredCommunities.length} of {allCommunities.length} communities
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* Builder multi-select */}
            <div>
              <label className="label">Builder</label>
              <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {allBuilders.map((b) => (
                  <label
                    key={b.slug}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.builderSlugs.includes(b.slug)}
                      onChange={() => toggleBuilder(b.slug)}
                      className="w-4 h-4 rounded accent-gold-500 flex-shrink-0"
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: b.logoColor }}
                      />
                      <span className="text-sm text-navy-800 group-hover:text-navy-900 truncate">
                        {b.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {(
                  [
                    { value: 'all', label: 'All' },
                    { value: 'selling', label: 'Selling' },
                    { value: 'coming-soon', label: 'Coming Soon' },
                    { value: 'sold-out', label: 'Sold Out' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilters((p) => ({ ...p, status: value }))}
                    className={`text-xs py-2 px-2 rounded-lg border font-medium transition-colors ${
                      filters.status === value
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'border-gray-200 text-navy-600 hover:border-navy-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max price quick buttons */}
            <div>
              <label className="label">Max Price</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PRICE_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setFilters((p) => ({ ...p, priceMax: value }))}
                    className={`text-xs py-1.5 px-2.5 rounded-lg border font-medium transition-colors ${
                      filters.priceMax === value
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'border-gray-200 text-navy-600 hover:border-navy-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="label">Home Type</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {(
                  [
                    { value: 'all', label: 'All' },
                    { value: 'spec-only', label: 'Spec Homes' },
                    { value: 'dirt-only', label: 'Dirt Builds' },
                    { value: 'both', label: 'Both' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilters((p) => ({ ...p, type: value }))}
                    className={`text-xs py-2 px-2 rounded-lg border font-medium transition-colors ${
                      filters.type === value
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'border-gray-200 text-navy-600 hover:border-navy-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Incentives only */}
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gold-50 rounded-lg border border-gold-100">
              <input
                type="checkbox"
                checked={filters.hasIncentives}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, hasIncentives: e.target.checked }))
                }
                className="w-4 h-4 accent-gold-500 flex-shrink-0"
              />
              <div>
                <div className="text-sm font-semibold text-navy-800 flex items-center gap-1.5">
                  <Tag size={13} className="text-gold-500" />
                  Incentives only
                </div>
                <div className="text-xs text-navy-500 mt-0.5">Active deals &amp; promotions</div>
              </div>
            </label>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm font-semibold text-navy-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Toggle sidebar button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="absolute top-3 left-3 z-[1000] bg-white shadow-md rounded-lg px-3 py-2 text-sm font-medium text-navy-700 flex items-center gap-2 hover:bg-gray-50 border border-gray-200"
          >
            <SlidersHorizontal size={15} />
            {filtersOpen ? 'Hide Filters' : 'Filters'}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            )}
          </button>

          {/* Result count badge */}
          <div className="absolute top-3 right-3 z-[1000] bg-white shadow-md rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 border border-gray-200">
            {filteredCommunities.length} communities
          </div>

          {/* Empty state overlay */}
          {filteredCommunities.length === 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-navy-700 font-semibold mb-2">No communities match your filters</p>
                <button onClick={clearFilters} className="btn-primary text-sm">
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <MapView communities={filteredCommunities} />
        </div>
      </div>

      <Footer />

      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
