'use client';

import { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, ChevronRight, DollarSign, Zap } from 'lucide-react';
import Link from 'next/link';
import { getAllCommunities } from '@/data/mock';
import { Community } from '@/types';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-navy-100 flex items-center justify-center">
      <div className="text-navy-400 text-sm font-medium animate-pulse">Loading map…</div>
    </div>
  ),
});

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${Math.round(n / 1000)}K`;

const AREAS = [
  'All Areas',
  'Saratoga Springs',
  'Lehi',
  'Herriman',
  'Eagle Mountain',
  'South Jordan',
  'Heber',
  'Draper',
  'Bluffdale',
];

interface SearchMapSectionProps {
  onGetInfo: (community: Community) => void;
}

export default function SearchMapSection({ onGetInfo }: SearchMapSectionProps) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All Areas');
  const allCommunities = getAllCommunities();
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let results = allCommunities;
    if (area !== 'All Areas') {
      results = results.filter(
        (c) =>
          c.city.toLowerCase().includes(area.toLowerCase()) ||
          c.county.toLowerCase().includes(area.toLowerCase()) ||
          c.name.toLowerCase().includes(area.toLowerCase())
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.builderName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.county.toLowerCase().includes(q)
      );
    }
    return results;
  }, [allCommunities, query, area]);

  return (
    <section id="search-map" className="py-0 bg-navy-950 border-t border-navy-800">
      {/* Section header */}
      <div className="bg-navy-900 px-4 sm:px-6 py-8 text-center">
        <div className="inline-block bg-gold-500/15 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
          Interactive Map
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Browse Utah Communities
        </h2>
        <p className="text-navy-400 text-sm max-w-xl mx-auto">
          Search and filter every active new construction community. Click any pin to explore.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="bg-navy-900 border-b border-navy-800 px-4 sm:px-6 pb-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex items-center bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 flex-1 gap-3">
            <Search size={16} className="text-navy-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search builder, community, or city…"
              className="bg-transparent text-white placeholder-navy-500 text-sm focus:outline-none flex-1"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-navy-500 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Area filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
            {AREAS.slice(0, 6).map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  area === a
                    ? 'bg-gold-500 text-white'
                    : 'bg-navy-800 text-navy-400 hover:bg-navy-700 hover:text-white border border-navy-700'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + List layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row" style={{ height: '620px' }}>

        {/* Left: community list */}
        <div
          ref={listRef}
          className="w-full lg:w-80 xl:w-96 flex-shrink-0 overflow-y-auto bg-navy-900 border-r border-navy-800"
        >
          <div className="px-3 py-3 border-b border-navy-800 flex items-center justify-between">
            <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">
              {filtered.length} {filtered.length === 1 ? 'community' : 'communities'}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-navy-500 text-sm">
              No communities match your search.
            </div>
          ) : (
            <div className="divide-y divide-navy-800">
              {filtered.map((community) => {
                const activeIncentives = community.incentives?.filter((i) => i.active) ?? [];
                const specCount = community.specHomes?.length ?? 0;
                return (
                  <div key={community.id} className="px-4 py-4 hover:bg-navy-800/50 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold leading-tight truncate">
                          {community.name}
                        </div>
                        <div className="text-navy-400 text-xs mt-0.5 flex items-center gap-1">
                          <MapPin size={10} />
                          {community.builderName}
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                        style={{ backgroundColor: community.photoColor }}
                      >
                        {community.builderName[0]}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white/90 text-xs font-semibold">
                        {fmt(community.priceMin)}
                        {community.priceMax > community.priceMin && `–${fmt(community.priceMax)}`}
                      </span>
                      {community.status === 'selling' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                          Selling Now
                        </span>
                      )}
                      {community.status === 'coming-soon' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {specCount > 0 && (
                        <span className="text-[10px] bg-navy-700 text-navy-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap size={9} />
                          {specCount} spec home{specCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {activeIncentives.length > 0 && (
                        <span className="text-[10px] bg-gold-500/20 text-gold-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <DollarSign size={9} />
                          {activeIncentives.length} incentive{activeIncentives.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/communities/${community.slug}`}
                        className="flex-1 text-center text-xs font-semibold bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                      <button
                        onClick={() => onGetInfo(community)}
                        className="flex-1 text-center text-xs font-semibold bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 py-2 rounded-lg transition-colors"
                      >
                        Get Info
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: map */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0" suppressHydrationWarning>
          <MapView communities={filtered} />
        </div>
      </div>
    </section>
  );
}
