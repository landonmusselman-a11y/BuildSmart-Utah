'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { mockBuilders, getAllCommunities } from '@/data/mock';
import { Builder, Community } from '@/types';
import {
  CheckCircle,
  X,
  Plus,
  Trash2,
  Zap,
  Phone,
  ArrowRight,
  Star,
  Building2,
  MapPin,
  Search,
  ChevronDown,
  Home,
  Users,
  ExternalLink,
} from 'lucide-react';

// ─── Dynamic map import (Leaflet requires no SSR) ─────────────────────────────

const CompareMapPicker = dynamic(() => import('@/components/CompareMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
      <div className="flex flex-col items-center gap-3 text-navy-500">
        <MapPin size={28} className="animate-pulse" />
        <span className="text-sm font-medium">Loading map…</span>
      </div>
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'communities' | 'builders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '$' + n.toLocaleString();
}

function fmtSqft(n: number) {
  return n.toLocaleString() + ' sqft';
}

// Collect all unique values for a given key across selected communities
function allUnique(communities: Community[], fn: (c: Community) => string[]): string[] {
  const set = new Set<string>();
  for (const c of communities) fn(c).forEach((v) => set.add(v));
  return Array.from(set).sort();
}

// Builder helpers (for builder tab)
function getTopFeatures(builders: Builder[], topN = 8): string[] {
  const counts = new Map<string, number>();
  for (const b of builders) {
    const unique = Array.from(new Set(b.communities.flatMap((c) => c.includedFeatures)));
    for (const f of unique) counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([f]) => f);
}

function builderHasFeature(b: Builder, feature: string) {
  return b.communities.some((c) => c.includedFeatures.includes(feature));
}

function totalSpecHomes(b: Builder) {
  return b.communities.flatMap((c) => c.specHomes).length;
}

function moveInReadyCount(b: Builder) {
  return b.communities.flatMap((c) => c.specHomes).filter((s) => s.status === 'move-in-ready').length;
}

function totalIncentives(b: Builder) {
  const ids = new Set(b.incentives.map((i) => i.id));
  return b.incentives.length + b.communities.flatMap((c) => c.incentives).filter((i) => !ids.has(i.id)).length;
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

/** Gold ring = selected, fade = maxed out */
function CheckMark() {
  return (
    <div className="absolute top-2 right-2">
      <CheckCircle size={16} className="text-gold-500 fill-gold-100" />
    </div>
  );
}

function SectionHeader({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr>
      <td colSpan={colCount + 1} className="bg-navy-900 px-4 py-2.5">
        <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">{label}</span>
      </td>
    </tr>
  );
}

function CRow({
  label,
  values,
  even,
  highlight,
}: {
  label: string;
  values: React.ReactNode[];
  even: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-gold-50' : even ? 'bg-white' : 'bg-gray-50'}>
      <td className="w-44 px-4 py-3 font-medium text-navy-700 text-sm whitespace-nowrap border-r border-gray-100 sticky left-0 bg-inherit z-10">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-center text-sm text-navy-800 min-w-[170px] max-w-[220px]">
          {v}
        </td>
      ))}
    </tr>
  );
}

function Check() {
  return <CheckCircle size={18} className="text-green-500 mx-auto" />;
}

function Dash() {
  return <span className="text-gray-300 font-bold text-lg leading-none">—</span>;
}

// ─── Builder Avatar ───────────────────────────────────────────────────────────

function BuilderAvatar({ builder, size = 'md' }: { builder: Builder; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: builder.logoColor }}
    >
      {builder.logoInitials}
    </div>
  );
}

// ─── Community Color Dot ──────────────────────────────────────────────────────

function CommunityDot({ community, size = 'md' }: { community: Community; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: community.photoColor }}
    >
      <Home size={size === 'lg' ? 20 : size === 'sm' ? 12 : 16} />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: MainTab }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-6">
        <Star size={36} className="text-navy-300" />
      </div>
      <h3 className="text-xl font-bold text-navy-900 mb-2">
        {tab === 'communities' ? 'No communities selected yet' : 'No builders selected yet'}
      </h3>
      <p className="text-navy-500 max-w-md">
        {tab === 'communities'
          ? 'Select up to 5 communities above to compare them side by side — amenities, pricing, HOA, floor plans, incentives, and more.'
          : 'Select up to 3 builders above to compare price ranges, features, warranty, and inventory.'}
      </p>
    </div>
  );
}

// ─── COMMUNITIES COMPARISON TABLE ────────────────────────────────────────────

function CommunitiesTable({
  communities,
  onRemove,
  openModal,
}: {
  communities: Community[];
  onRemove: (id: string) => void;
  openModal: (name: string) => void;
}) {
  const n = communities.length;

  // Dynamic rows — all unique amenities / features across selected communities
  const allAmenities = allUnique(communities, (c) => c.amenities ?? []);
  const allFeatures = allUnique(communities, (c) => c.features ?? []);
  const allIncluded = allUnique(communities, (c) => c.includedFeatures ?? []);

  let ri = 0; // row index for alternating

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ── Sticky header ── */}
          <thead>
            <tr className="bg-navy-900">
              <th className="w-44 px-4 py-4 text-left sticky left-0 bg-navy-900 z-20">
                <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Community</span>
              </th>
              {communities.map((c) => (
                <th key={c.id} className="px-4 py-4 min-w-[170px] text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <CommunityDot community={c} size="lg" />
                      <button
                        onClick={() => onRemove(c.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                        aria-label={`Remove ${c.name}`}
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm leading-tight">{c.name}</div>
                      <div className="text-navy-400 text-xs mt-0.5">{c.builderName}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── OVERVIEW ── */}
            <SectionHeader label="Overview" colCount={n} />

            <CRow
              label="Builder"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <Link href={`/builders/${c.builderSlug}`} className="text-navy-700 hover:text-gold-600 font-medium text-xs underline underline-offset-2 transition-colors">
                  {c.builderName}
                </Link>
              ))}
            />

            <CRow
              label="Location"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="text-xs leading-snug">
                  <span className="font-medium text-navy-900">{c.city}</span>
                  <br />
                  <span className="text-navy-500">{c.county}</span>
                </span>
              ))}
            />

            <CRow
              label="Price Range"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="font-semibold text-navy-900 text-xs">
                  {fmt(c.priceMin)} – {fmt(c.priceMax)}
                </span>
              ))}
            />

            <CRow
              label="Home Size"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="text-xs text-navy-700">
                  {fmtSqft(c.sqftMin)} – {fmtSqft(c.sqftMax)}
                </span>
              ))}
            />

            <CRow
              label="Bedrooms"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="font-medium text-navy-900">{c.bedsRange} beds</span>
              ))}
            />

            <CRow
              label="Garage"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span>{c.garageSpaces}-car</span>
              ))}
            />

            <CRow
              label="Community Type"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const labels: Record<string, string> = {
                  'spec-only': 'Spec Only',
                  'dirt-only': 'Dirt Builds',
                  both: 'Spec + Dirt',
                };
                const colors: Record<string, string> = {
                  'spec-only': 'bg-blue-100 text-blue-700',
                  'dirt-only': 'bg-amber-100 text-amber-700',
                  both: 'bg-green-100 text-green-700',
                };
                return (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[c.type]}`}>
                    {labels[c.type]}
                  </span>
                );
              })}
            />

            <CRow
              label="Status"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const colors: Record<string, string> = {
                  selling: 'bg-green-100 text-green-700',
                  'coming-soon': 'bg-yellow-100 text-yellow-700',
                  'sold-out': 'bg-red-100 text-red-600',
                };
                const labels: Record<string, string> = {
                  selling: 'Selling',
                  'coming-soon': 'Coming Soon',
                  'sold-out': 'Sold Out',
                };
                return (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[c.status]}`}>
                    {labels[c.status]}
                  </span>
                );
              })}
            />

            {/* ── LOTS & INVENTORY ── */}
            <SectionHeader label="Lots & Inventory" colCount={n} />

            <CRow
              label="Total Lots"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.totalLots != null ? (
                  <span className="font-semibold text-navy-900">{c.totalLots.toLocaleString()}</span>
                ) : (
                  <Dash />
                ),
              )}
            />

            <CRow
              label="Available Lots"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                if (c.availableLots == null) return <span className="text-navy-500 text-xs">Call for availability</span>;
                return (
                  <span className={c.availableLots > 0 ? 'font-semibold text-green-600' : 'text-navy-400'}>
                    {c.availableLots > 0 ? c.availableLots : 'None listed'}
                  </span>
                );
              })}
            />

            <CRow
              label="Lot Size Range"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.lotSizeMin && c.lotSizeMax ? (
                  <span className="text-xs text-navy-700">
                    {c.lotSizeMin.toLocaleString()} – {c.lotSizeMax.toLocaleString()} sqft
                  </span>
                ) : (
                  <Dash />
                ),
              )}
            />

            <CRow
              label="Spec Homes"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="font-semibold text-navy-900">{c.specHomes.length}</span>
              ))}
            />

            <CRow
              label="Move-In Ready"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const ct = c.specHomes.filter((s) => s.status === 'move-in-ready').length;
                return (
                  <span className={ct > 0 ? 'font-semibold text-green-600' : 'text-navy-400'}>
                    {ct > 0 ? ct : '—'}
                  </span>
                );
              })}
            />

            <CRow
              label="Under Construction"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const ct = c.specHomes.filter((s) => s.status === 'under-construction').length;
                return <span className={ct > 0 ? 'font-semibold text-amber-600' : 'text-navy-400'}>{ct > 0 ? ct : '—'}</span>;
              })}
            />

            {/* ── HOA ── */}
            <SectionHeader label="HOA" colCount={n} />

            <CRow
              label="Monthly HOA"
              even={ri++ % 2 === 0}
              highlight
              values={communities.map((c) =>
                c.hoa ? (
                  <span className="font-semibold text-navy-900">${c.hoa.monthly}/mo</span>
                ) : (
                  <span className="font-semibold text-green-600">None</span>
                ),
              )}
            />

            <CRow
              label="HOA Includes"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.hoa && c.hoa.includes.length > 0 ? (
                  <ul className="text-left text-xs text-navy-600 space-y-0.5 list-none">
                    {c.hoa.includes.map((item) => (
                      <li key={item} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Dash />
                ),
              )}
            />

            {/* ── BASEMENT ── */}
            <SectionHeader label="Basement" colCount={n} />

            <CRow
              label="Available"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (c.basement.available ? <Check /> : <Dash />))}
            />

            <CRow
              label="Finished Included"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (c.basement.finishedIncluded ? <Check /> : <Dash />))}
            />

            <CRow
              label="Finish Cost"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.basement.finishCostMin && c.basement.finishCostMax ? (
                  <span className="text-xs text-navy-700">
                    {fmt(c.basement.finishCostMin)} – {fmt(c.basement.finishCostMax)}
                  </span>
                ) : (
                  <Dash />
                ),
              )}
            />

            <CRow
              label="Basement Sqft"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.basement.sqft ? (
                  <span className="text-xs text-navy-700">~{c.basement.sqft.toLocaleString()} sqft</span>
                ) : (
                  <Dash />
                ),
              )}
            />

            {/* ── AMENITIES ── */}
            {allAmenities.length > 0 && (
              <>
                <SectionHeader label="Community Amenities" colCount={n} />
                {allAmenities.map((amenity) => (
                  <CRow
                    key={amenity}
                    label={amenity}
                    even={ri++ % 2 === 0}
                    values={communities.map((c) =>
                      (c.amenities ?? []).includes(amenity) ? <Check /> : <Dash />,
                    )}
                  />
                ))}
              </>
            )}

            {/* ── COMMUNITY FEATURES ── */}
            {allFeatures.length > 0 && (
              <>
                <SectionHeader label="Community Features" colCount={n} />
                {allFeatures.map((feat) => (
                  <CRow
                    key={feat}
                    label={feat}
                    even={ri++ % 2 === 0}
                    values={communities.map((c) =>
                      c.features.includes(feat) ? <Check /> : <Dash />,
                    )}
                  />
                ))}
              </>
            )}

            {/* ── INCLUDED FEATURES ── */}
            {allIncluded.length > 0 && (
              <>
                <SectionHeader label="Standard Included Features" colCount={n} />
                {allIncluded.map((feat) => (
                  <CRow
                    key={feat}
                    label={feat}
                    even={ri++ % 2 === 0}
                    values={communities.map((c) =>
                      c.includedFeatures.includes(feat) ? <Check /> : <Dash />,
                    )}
                  />
                ))}
              </>
            )}

            {/* ── FLOOR PLANS ── */}
            <SectionHeader label="Floor Plans" colCount={n} />

            <CRow
              label="# of Plans"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="font-semibold text-navy-900">{c.floorPlans.length}</span>
              ))}
            />

            <CRow
              label="Base Price Range"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                if (c.floorPlans.length === 0) return <Dash />;
                const prices = c.floorPlans.map((p) => p.basePrice);
                return (
                  <span className="text-xs text-navy-700">
                    {fmt(Math.min(...prices))} – {fmt(Math.max(...prices))}
                  </span>
                );
              })}
            />

            <CRow
              label="Size Range"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                if (c.floorPlans.length === 0) return <Dash />;
                return (
                  <span className="text-xs text-navy-700">
                    {c.sqftMin.toLocaleString()} – {c.sqftMax.toLocaleString()} sqft
                  </span>
                );
              })}
            />

            <CRow
              label="Stories"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const stories = Array.from(new Set(c.floorPlans.map((p) => p.stories)));
                return <span className="text-xs text-navy-700">{stories.join(', ') || '—'}</span>;
              })}
            />

            <CRow
              label="Plans w/ Basement"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const ct = c.floorPlans.filter((p) => p.hasBasement).length;
                return ct > 0 ? (
                  <span className="text-xs font-medium text-navy-700">{ct} of {c.floorPlans.length}</span>
                ) : (
                  <Dash />
                );
              })}
            />

            {/* ── SCHOOLS ── */}
            <SectionHeader label="Schools & Location" colCount={n} />

            <CRow
              label="School District"
              even={ri++ % 2 === 0}
              values={communities.map((c) =>
                c.schoolDistrict ? (
                  <span className="text-xs font-medium text-navy-700">{c.schoolDistrict}</span>
                ) : (
                  <Dash />
                ),
              )}
            />

            <CRow
              label="County"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <span className="text-xs text-navy-700">{c.county}</span>
              ))}
            />

            <CRow
              label="Map"
              even={ri++ % 2 === 0}
              values={communities.map((c) => (
                <a
                  href={c.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-navy-600 hover:text-gold-600 underline underline-offset-2 transition-colors"
                >
                  <MapPin size={11} /> View map
                </a>
              ))}
            />

            {/* ── INCENTIVES ── */}
            <SectionHeader label="Active Incentives" colCount={n} />

            <CRow
              label="# Active"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const ct = c.incentives.filter((i) => i.active).length;
                return ct > 0 ? (
                  <span className="font-semibold text-gold-600 flex items-center justify-center gap-1">
                    <Zap size={13} className="text-gold-500" /> {ct}
                  </span>
                ) : (
                  <span className="text-navy-400">—</span>
                );
              })}
            />

            <CRow
              label="Incentive Details"
              even={ri++ % 2 === 0}
              values={communities.map((c) => {
                const active = c.incentives.filter((i) => i.active);
                if (active.length === 0) return <span className="text-navy-400 text-xs">None listed</span>;
                return (
                  <ul className="text-left text-xs space-y-1.5">
                    {active.map((inc) => (
                      <li key={inc.id} className="border-l-2 border-gold-400 pl-2">
                        <div className="font-medium text-navy-800">{inc.title}</div>
                        <div className="text-navy-500 text-xs">{inc.value}</div>
                      </li>
                    ))}
                  </ul>
                );
              })}
            />

            {/* ── CTA ROW ── */}
            <tr className="bg-navy-50 border-t-2 border-navy-100">
              <td className="w-44 px-4 py-5 sticky left-0 bg-navy-50 z-10" />
              {communities.map((c) => (
                <td key={c.id} className="px-4 py-5 text-center min-w-[170px]">
                  <div className="flex flex-col items-center gap-2">
                    {c.websiteUrl ? (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        View on Builder Site <ExternalLink size={11} />
                      </a>
                    ) : (
                      <Link
                        href={`/builders/${c.builderSlug}`}
                        className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        View Builder <ArrowRight size={12} />
                      </Link>
                    )}
                    <button
                      onClick={() => openModal(c.name)}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      <Zap size={12} /> Schedule Free Consultation
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BUILDERS COMPARISON TABLE ────────────────────────────────────────────────

function BuildersTable({
  builders,
  onRemove,
  openModal,
}: {
  builders: Builder[];
  onRemove: (slug: string) => void;
  openModal: (name: string) => void;
}) {
  const n = builders.length;
  const topFeatures = useMemo(() => getTopFeatures(mockBuilders, 8), []);
  let ri = 0;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-navy-900">
              <th className="w-44 px-4 py-4 text-left sticky left-0 bg-navy-900 z-20">
                <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Builder</span>
              </th>
              {builders.map((b) => (
                <th key={b.slug} className="px-4 py-4 min-w-[180px] text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <BuilderAvatar builder={b} size="lg" />
                      <button
                        onClick={() => onRemove(b.slug)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                        aria-label={`Remove ${b.name}`}
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                    <div className="text-white font-semibold text-sm leading-tight text-center">{b.name}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="Overview" colCount={n} />
            <CRow label="Price Range" even={ri++ % 2 === 0} values={builders.map((b) => <span className="font-medium text-navy-900 text-xs">{fmt(b.priceMin)} – {fmt(b.priceMax)}</span>)} />
            <CRow label="Years in Business" even={ri++ % 2 === 0} values={builders.map((b) => <span><span className="font-semibold text-navy-900">{b.yearsInBusiness}</span> yrs</span>)} />
            <CRow label="Homes Built" even={ri++ % 2 === 0} values={builders.map((b) => b.homesBuilt)} />
            <CRow label="Structural Warranty" even={ri++ % 2 === 0} values={builders.map((b) => <span><span className="font-semibold text-navy-900">{b.warrantyYears}</span> yrs</span>)} />
            <CRow label="Communities in Utah" even={ri++ % 2 === 0} values={builders.map((b) => <span className="font-semibold text-navy-900">{b.communities.length}</span>)} />
            <CRow label="Areas Served" even={ri++ % 2 === 0} values={builders.map((b) => <span className="text-xs text-navy-600 leading-snug">{b.areas.join(', ')}</span>)} />

            <SectionHeader label="Inventory" colCount={n} />
            <CRow label="Total Spec Homes" even={ri++ % 2 === 0} values={builders.map((b) => <span className="font-semibold text-navy-900">{totalSpecHomes(b)}</span>)} />
            <CRow label="Move-In Ready" even={ri++ % 2 === 0} values={builders.map((b) => { const ct = moveInReadyCount(b); return <span className={ct > 0 ? 'font-semibold text-green-600' : 'text-navy-400'}>{ct > 0 ? ct : '—'}</span>; })} />
            <CRow label="Active Incentives" even={ri++ % 2 === 0} values={builders.map((b) => { const ct = totalIncentives(b); return ct > 0 ? <span className="font-semibold text-gold-600 flex items-center justify-center gap-1"><Zap size={13} className="text-gold-500" />{ct}</span> : <span className="text-navy-400">—</span>; })} />

            <SectionHeader label="Included Features" colCount={n} />
            {topFeatures.map((feat) => (
              <CRow key={feat} label={feat} even={ri++ % 2 === 0} values={builders.map((b) => builderHasFeature(b, feat) ? <Check /> : <Dash />)} />
            ))}

            <SectionHeader label="Basement Options" colCount={n} />
            <CRow label="Basement Available" even={ri++ % 2 === 0} values={builders.map((b) => b.communities.some((c) => c.basement.available) ? <Check /> : <Dash />)} />
            <CRow label="Finished Incl." even={ri++ % 2 === 0} values={builders.map((b) => b.communities.some((c) => c.basement.finishedIncluded) ? <Check /> : <Dash />)} />

            <SectionHeader label="Contact" colCount={n} />
            <CRow label="Phone" even={ri++ % 2 === 0} values={builders.map((b) => <a href={`tel:${b.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-1.5 text-navy-700 hover:text-gold-600 transition-colors text-xs font-medium"><Phone size={12} />{b.phone}</a>)} />
            <CRow label="Website" even={ri++ % 2 === 0} values={builders.map((b) => <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-xs text-navy-500 hover:text-gold-600 underline underline-offset-2 transition-colors">Visit site</a>)} />

            <tr className="bg-navy-50 border-t-2 border-navy-100">
              <td className="w-44 px-4 py-5 sticky left-0 bg-navy-50 z-10" />
              {builders.map((b) => (
                <td key={b.slug} className="px-4 py-5 text-center min-w-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    <Link href={`/builders/${b.slug}`} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
                      View Communities <ArrowRight size={12} />
                    </Link>
                    <button onClick={() => openModal(b.name)} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                      <Zap size={12} /> Schedule Free Consultation
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const ALL_COMMUNITIES = getAllCommunities();

export default function ComparePage() {
  const [mainTab, setMainTab] = useState<MainTab>('communities');

  // Communities tab state
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [communitySearch, setCommunitySearch] = useState('');
  const [filterBuilder, setFilterBuilder] = useState('');
  const [filterCounty, setFilterCounty] = useState('');
  const [shakeCommunityId, setShakeCommunityId] = useState<string | null>(null);

  // Builders tab state
  const [selectedBuilderSlugs, setSelectedBuilderSlugs] = useState<string[]>([]);
  const [shakeBuilderSlug, setShakeBuilderSlug] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState('');

  // ── Derived data ──

  const uniqueBuilders = useMemo(
    () => Array.from(new Set(ALL_COMMUNITIES.map((c) => c.builderName))).sort(),
    [],
  );

  const uniqueCounties = useMemo(
    () => Array.from(new Set(ALL_COMMUNITIES.map((c) => c.county))).sort(),
    [],
  );

  const filteredCommunities = useMemo(() => {
    const q = communitySearch.toLowerCase();
    return ALL_COMMUNITIES.filter((c) => {
      if (filterBuilder && c.builderName !== filterBuilder) return false;
      if (filterCounty && c.county !== filterCounty) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.city.toLowerCase().includes(q) && !c.builderName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [communitySearch, filterBuilder, filterCounty]);

  const selectedCommunities = useMemo(
    () => selectedCommunityIds.map((id) => ALL_COMMUNITIES.find((c) => c.id === id)).filter((c): c is Community => !!c),
    [selectedCommunityIds],
  );

  const selectedBuilders = useMemo(
    () => selectedBuilderSlugs.map((slug) => mockBuilders.find((b) => b.slug === slug)).filter((b): b is Builder => !!b),
    [selectedBuilderSlugs],
  );

  // ── Toggles ──

  function toggleCommunity(id: string) {
    setSelectedCommunityIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) {
        setShakeCommunityId(id);
        setTimeout(() => setShakeCommunityId(null), 600);
        return prev;
      }
      return [...prev, id];
    });
  }

  function toggleBuilder(slug: string) {
    setSelectedBuilderSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) {
        setShakeBuilderSlug(slug);
        setTimeout(() => setShakeBuilderSlug(null), 600);
        return prev;
      }
      return [...prev, slug];
    });
  }

  function openModal(name: string) {
    setModalSource(name);
    setModalOpen(true);
  }

  // ── Render ──

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* ── Hero ── */}
        <div className="utah-hero-bg py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="section-heading text-white">Compare Utah New Construction</h1>
            <p className="section-sub text-navy-200 mt-2">
              Side-by-side comparisons of communities and builders — amenities, pricing, HOA, floor plans, incentives, and more.
            </p>
          </div>
        </div>

        {/* ── Main tab bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <button
                onClick={() => setMainTab('communities')}
                className={[
                  'flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  mainTab === 'communities'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-navy-500 hover:text-navy-800 hover:border-navy-200',
                ].join(' ')}
              >
                <Home size={16} />
                Communities
                {selectedCommunityIds.length > 0 && (
                  <span className="bg-gold-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCommunityIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMainTab('builders')}
                className={[
                  'flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  mainTab === 'builders'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-navy-500 hover:text-navy-800 hover:border-navy-200',
                ].join(' ')}
              >
                <Building2 size={16} />
                Builders
                {selectedBuilderSlugs.length > 0 && (
                  <span className="bg-gold-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedBuilderSlugs.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ════════════════════════════════════════════════════════════════
               COMMUNITIES TAB
          ════════════════════════════════════════════════════════════════ */}
          {mainTab === 'communities' && (
            <>
              {/* ── MAP PICKER ── */}
              <div className="mb-10">
                {/* Map header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                      <MapPin size={18} className="text-gold-500" />
                      Select Communities on the Map
                    </h2>
                    <p className="text-sm text-navy-500 mt-0.5">
                      Zoom into any area, click a marker, and tap <strong>Add to Compare</strong>. Select up to 5.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                      <span className="text-sm font-semibold text-navy-700">{selectedCommunityIds.length}</span>
                      <span className="text-sm text-navy-400">/ 5 selected</span>
                    </div>
                    {selectedCommunityIds.length > 0 && (
                      <button
                        onClick={() => setSelectedCommunityIds([])}
                        className="btn-ghost text-sm flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected pills */}
                {selectedCommunities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCommunities.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: c.photoColor }}
                      >
                        <Home size={11} />
                        {c.name}
                        <span className="text-white/70 text-xs ml-0.5">· {c.city}</span>
                        <button onClick={() => toggleCommunity(c.id)} className="ml-1 hover:opacity-75 transition-opacity">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Map container */}
                <div className="card overflow-hidden" style={{ height: 520 }}>
                  <CompareMapPicker
                    communities={ALL_COMMUNITIES}
                    selectedIds={selectedCommunityIds}
                    onToggle={toggleCommunity}
                    maxSelected={5}
                  />
                </div>

                {/* Map legend */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-navy-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-navy-400 border-2 border-white shadow-sm" />
                    Unselected community
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-navy-600 border-2 border-amber-500 shadow-sm" />
                    Selected (gold ring + ✓)
                  </div>
                  <div className="flex items-center gap-1.5 text-navy-400">
                    Scroll to zoom &nbsp;·&nbsp; Click marker to see details &amp; add
                  </div>
                </div>
              </div>

              {/* ── DIVIDER ── */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-50 px-4 text-sm text-navy-400 font-medium">or browse &amp; search below</span>
                </div>
              </div>

              {/* ── GRID PICKER ── */}
              {/* Picker header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-navy-900">Browse All Communities</h2>
                  <span className="text-sm text-navy-500">{selectedCommunityIds.length} / 5 selected</span>
                  {selectedCommunityIds.length >= 5 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Max reached</span>
                  )}
                </div>
                {selectedCommunityIds.length > 0 && (
                  <button
                    onClick={() => setSelectedCommunityIds([])}
                    className="btn-ghost text-sm flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              {/* Search + filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search communities, cities, builders…"
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 bg-white"
                  />
                </div>

                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                  <select
                    value={filterBuilder}
                    onChange={(e) => setFilterBuilder(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-navy-700"
                  >
                    <option value="">All Builders</option>
                    {uniqueBuilders.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
                  <select
                    value={filterCounty}
                    onChange={(e) => setFilterCounty(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-navy-700"
                  >
                    <option value="">All Counties</option>
                    {uniqueCounties.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* (pills shown above the map) */}
              {false && (
                <div className="hidden"></div>
              )}

              {/* Community picker grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-10">
                {filteredCommunities.map((community) => {
                  const isSelected = selectedCommunityIds.includes(community.id);
                  const isMaxed = selectedCommunityIds.length >= 5 && !isSelected;
                  const isShaking = shakeCommunityId === community.id;

                  return (
                    <button
                      key={community.id}
                      onClick={() => toggleCommunity(community.id)}
                      disabled={isMaxed}
                      className={[
                        'relative card p-3 flex flex-col items-start gap-1.5 text-left transition-all duration-200 group',
                        isSelected ? 'ring-2 ring-gold-500 border-gold-400 bg-gold-50' : '',
                        isMaxed ? 'opacity-40 cursor-not-allowed' : 'hover:border-navy-300 hover:shadow-md cursor-pointer',
                        isShaking ? 'animate-bounce' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {isSelected && <CheckMark />}
                      {!isSelected && !isMaxed && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={13} className="text-navy-400" />
                        </div>
                      )}

                      {/* Color strip */}
                      <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: community.photoColor }} />

                      <div className="w-full min-w-0">
                        <div className="font-semibold text-navy-900 text-xs leading-tight line-clamp-2">{community.name}</div>
                        <div className="text-xs text-navy-500 mt-0.5 truncate">{community.builderName}</div>
                        <div className="text-xs text-navy-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="flex-shrink-0" />
                          {community.city}
                        </div>
                        <div className="text-xs text-navy-600 font-medium mt-1">
                          {fmt(community.priceMin)}+
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredCommunities.length === 0 && (
                  <div className="col-span-5 py-10 text-center text-navy-400 text-sm">
                    No communities match your filters.
                    <button
                      onClick={() => { setCommunitySearch(''); setFilterBuilder(''); setFilterCounty(''); }}
                      className="ml-2 text-gold-600 underline underline-offset-2 hover:text-gold-700"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Comparison table */}
              {selectedCommunities.length === 0 ? (
                <EmptyState tab="communities" />
              ) : (
                <CommunitiesTable
                  communities={selectedCommunities}
                  onRemove={(id) => toggleCommunity(id)}
                  openModal={openModal}
                />
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
               BUILDERS TAB
          ════════════════════════════════════════════════════════════════ */}
          {mainTab === 'builders' && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-navy-900">Choose Builders</h2>
                  <span className="text-sm text-navy-500">{selectedBuilderSlugs.length} / 3 selected</span>
                </div>
                {selectedBuilderSlugs.length > 0 && (
                  <button
                    onClick={() => setSelectedBuilderSlugs([])}
                    className="btn-ghost text-sm flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
                {mockBuilders.map((builder) => {
                  const isSelected = selectedBuilderSlugs.includes(builder.slug);
                  const isMaxed = selectedBuilderSlugs.length >= 3 && !isSelected;
                  const isShaking = shakeBuilderSlug === builder.slug;

                  return (
                    <button
                      key={builder.slug}
                      onClick={() => toggleBuilder(builder.slug)}
                      disabled={isMaxed}
                      className={[
                        'relative card p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 group',
                        isSelected ? 'ring-2 ring-gold-500 border-gold-400 bg-gold-50' : '',
                        isMaxed ? 'opacity-40 cursor-not-allowed' : 'hover:border-navy-300 hover:shadow-md cursor-pointer',
                        isShaking ? 'animate-bounce' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {isSelected && <CheckMark />}
                      {!isSelected && !isMaxed && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={14} className="text-navy-400" />
                        </div>
                      )}
                      <BuilderAvatar builder={builder} size="md" />
                      <div className="w-full">
                        <div className="font-semibold text-navy-900 text-sm leading-tight line-clamp-2">{builder.name}</div>
                        <div className="text-xs text-navy-500 mt-1">{fmt(builder.priceMin)}–{fmt(builder.priceMax)}</div>
                        <div className="text-xs text-navy-400 mt-0.5">{builder.areas.length} area{builder.areas.length !== 1 ? 's' : ''}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedBuilders.length === 0 ? (
                <EmptyState tab="builders" />
              ) : (
                <BuildersTable
                  builders={selectedBuilders}
                  onRemove={(slug) => toggleBuilder(slug)}
                  openModal={openModal}
                />
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
