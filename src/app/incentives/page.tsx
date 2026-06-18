'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockBuilders, getAllIncentives } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IncentiveBadge from '@/components/IncentiveBadge';
import BookingModal from '@/components/BookingModal';
import { Tag, TrendingDown, DollarSign, Hammer, Percent, Clock, AlertCircle } from 'lucide-react';
import { Incentive } from '@/types';

const typeLabels = {
  'rate-buydown': { label: 'Rate Buydown', icon: TrendingDown, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'closing-costs': { label: 'Closing Costs', icon: DollarSign, color: 'bg-green-50 text-green-700 border-green-200' },
  upgrades: { label: 'Design / Upgrades', icon: Hammer, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'price-reduction': { label: 'Price Reduction', icon: Percent, color: 'bg-red-50 text-red-700 border-red-200' },
  other: { label: 'Other Incentive', icon: Tag, color: 'bg-gold-50 text-gold-700 border-gold-200' },
};

function daysUntilExpiry(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface IncentiveCardProps {
  incentive: Incentive;
  onGetInfo: (builderId: string, communityId?: string) => void;
}

function IncentiveCard({ incentive, onGetInfo }: IncentiveCardProps) {
  const builder = mockBuilders.find((b) => b.id === incentive.builderId);
  if (!builder) return null;

  const community = incentive.communityId
    ? builder.communities.find((c) => c.id === incentive.communityId)
    : null;

  const days = daysUntilExpiry(incentive.expiresDate);
  const expiringSoon = days !== null && days <= 30;
  const config = typeLabels[incentive.type];
  const Icon = config.icon;

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Builder header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: builder.logoColor }}
        >
          <span className="text-white font-extrabold text-xs">{builder.logoInitials}</span>
        </div>
        <div className="min-w-0">
          <Link href={`/builders/${builder.slug}`} className="font-semibold text-navy-900 text-sm hover:text-gold-600 transition-colors">
            {builder.name}
          </Link>
          {community && (
            <div className="text-xs text-navy-500 mt-0.5">
              📍 {community.name} — {community.city}
            </div>
          )}
          {!community && (
            <div className="text-xs text-navy-500 mt-0.5">All communities</div>
          )}
        </div>
        <div className="ml-auto flex-shrink-0">
          <IncentiveBadge incentive={incentive} size="sm" />
        </div>
      </div>

      {/* Incentive detail */}
      <div className={`rounded-xl p-4 border ${config.color}`}>
        <div className="flex items-start gap-2.5">
          <Icon size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm mb-1">{incentive.title}</div>
            <div className="text-sm leading-relaxed opacity-90">{incentive.description}</div>
          </div>
        </div>
      </div>

      {/* Expiry warning */}
      {days !== null && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${expiringSoon ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-500'}`}>
          {expiringSoon ? <AlertCircle size={13} /> : <Clock size={13} />}
          {days > 0
            ? `Expires in ${days} day${days !== 1 ? 's' : ''} — ${new Date(incentive.expiresDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
            : 'Expired'}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onGetInfo(builder.name, community?.name)}
        className="btn-primary w-full justify-center text-sm py-2.5 mt-auto"
      >
        Claim This Incentive
      </button>
    </div>
  );
}

export default function IncentivesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBuilder, setModalBuilder] = useState('');
  const [modalCommunity, setModalCommunity] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [builderFilter, setBuilderFilter] = useState('');
  const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);

  const allIncentives = getAllIncentives().filter((i) => i.active);

  const filtered = useMemo(() => {
    return allIncentives.filter((inc) => {
      const matchesType = !typeFilter || inc.type === typeFilter;
      const matchesBuilder = !builderFilter || inc.builderId === builderFilter;
      const days = daysUntilExpiry(inc.expiresDate);
      const matchesExpiry = !expiringSoonOnly || (days !== null && days <= 30);
      return matchesType && matchesBuilder && matchesExpiry;
    });
  }, [typeFilter, builderFilter, expiringSoonOnly, allIncentives]);

  const totalValue = allIncentives.length;
  const expiringSoon = allIncentives.filter((i) => {
    const d = daysUntilExpiry(i.expiresDate);
    return d !== null && d <= 30;
  }).length;

  const openModal = (builderName: string, communityName?: string) => {
    setModalBuilder(builderName);
    setModalCommunity(communityName || '');
    setModalOpen(true);
  };

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-utah-gradient text-white py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/30 rounded-full px-3 py-1 mb-4">
              <Tag size={13} className="text-gold-300" />
              <span className="text-gold-200 text-xs font-semibold uppercase tracking-wide">Updated Regularly</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3">Utah Builder Incentives</h1>
            <p className="text-navy-300 text-lg max-w-2xl mb-8">
              Every active incentive across all Utah builders — rate buydowns, closing cost assistance, design credits, and price reductions. We track these so you don't have to.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { value: totalValue, label: 'Active Incentives', color: 'text-gold-300' },
                { value: mockBuilders.length, label: 'Builders Tracked', color: 'text-white' },
                { value: expiringSoon, label: 'Expiring This Month', color: expiringSoon > 0 ? 'text-red-300' : 'text-white' },
              ].map(({ value, label, color }) => (
                <div key={label}>
                  <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-navy-400 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap gap-3 items-center">
            <select
              className="input-field py-2.5 text-sm w-52 bg-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Incentive Types</option>
              {Object.entries(typeLabels).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              className="input-field py-2.5 text-sm w-56 bg-white"
              value={builderFilter}
              onChange={(e) => setBuilderFilter(e.target.value)}
            >
              <option value="">All Builders</option>
              {mockBuilders.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={expiringSoonOnly}
                onChange={(e) => setExpiringSoonOnly(e.target.checked)}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertCircle size={13} /> Expiring within 30 days
              </span>
            </label>

            {(typeFilter || builderFilter || expiringSoonOnly) && (
              <button
                onClick={() => { setTypeFilter(''); setBuilderFilter(''); setExpiringSoonOnly(false); }}
                className="text-sm text-navy-500 hover:text-navy-800 underline ml-auto"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-navy-600 text-sm">
              Showing <span className="font-semibold text-navy-900">{filtered.length}</span> incentives
            </p>
            <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2">
              Help Me Maximize My Savings
            </button>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((inc) => (
                <IncentiveCard key={inc.id} incentive={inc} onGetInfo={openModal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-navy-500">
              <Tag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No incentives match your filters.</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 bg-navy-900 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Don't Navigate Incentives Alone</h2>
            <p className="text-navy-300 max-w-xl mx-auto mb-6">
              Incentives can be combined, negotiated, or tied to specific lenders and deadlines. We'll help you understand which deals are real, which can be stacked, and how to maximize your savings.
            </p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              Talk to Us About Incentives — Free
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <BookingModal isOpen={modalOpen} onClose={() => { setModalOpen(false); }} />
    </>
  );
}
