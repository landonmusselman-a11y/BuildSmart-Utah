import Link from 'next/link';
import { MapPin, Check, X as XIcon } from 'lucide-react';
import { Community } from '@/types';
import IncentiveBadge from './IncentiveBadge';

interface CommunityCardProps {
  community: Community;
  onGetInfo?: (community: Community) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  selling: { label: 'Now Selling', dot: 'bg-green-500' },
  'coming-soon': { label: 'Coming Soon', dot: 'bg-amber-400' },
  'sold-out': { label: 'Sold Out', dot: 'bg-cream-400' },
};

export default function CommunityCard({ community, onGetInfo }: CommunityCardProps) {
  const activeIncentives = community.incentives.filter((i) => i.active);
  const status = statusConfig[community.status];

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Photo placeholder */}
      <div
        className="h-40 relative flex items-end"
        style={{ background: `linear-gradient(160deg, ${community.photoColor}dd, ${community.photoColor})` }}
      >
        <div className="relative p-4 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${status.dot} flex-shrink-0`} />
            <span className="text-white/90 text-xs font-medium">{status.label}</span>
          </div>
          <h3 className="text-white font-bold text-lg leading-tight">{community.name}</h3>
        </div>
        {activeIncentives.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded-lg incentive-pulse">
              {activeIncentives.length} deal{activeIncentives.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Builder + location */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <Link
              href={`/builders/${community.builderSlug}`}
              className="text-xs font-semibold text-gold-600 hover:text-gold-700"
            >
              {community.builderName}
            </Link>
            <div className="flex items-center gap-1 text-xs text-navy-500 mt-0.5">
              <MapPin size={11} />
              {community.city}, {community.county}
            </div>
          </div>
        </div>

        {/* Price / sqft / beds */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xs text-navy-400">From</div>
            <div className="text-sm font-bold text-navy-900">{fmt(community.priceMin)}</div>
          </div>
          <div className="text-center border-x border-cream-200">
            <div className="text-xs text-navy-400">Sq Ft</div>
            <div className="text-sm font-bold text-navy-900">{community.sqftMin.toLocaleString()}+</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-navy-400">Beds</div>
            <div className="text-sm font-bold text-navy-900">{community.bedsRange}</div>
          </div>
        </div>

        {/* HOA + Basement row */}
        <div className="flex gap-2 mb-3">
          {community.hoa ? (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 font-medium">
              HOA ${community.hoa.monthly}/mo
            </span>
          ) : (
            <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-1 font-medium flex items-center gap-1">
              <Check size={10} /> No HOA
            </span>
          )}
          {community.basement.available && (
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2.5 py-1 font-medium">
              {community.basement.finishedIncluded
                ? 'Finished basement incl.'
                : community.basement.finishCostMin
                ? `Basement from +$${Math.round(community.basement.finishCostMin / 1000)}K`
                : 'Basement available'}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-navy-600 leading-relaxed line-clamp-2 mb-3 flex-1">{community.description}</p>

        {/* Included features (first 3) */}
        {community.includedFeatures.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-navy-700 mb-1.5">Standard Includes:</div>
            <div className="flex flex-wrap gap-1">
              {community.includedFeatures.slice(0, 3).map((f) => (
                <span key={f} className="text-xs bg-navy-50 text-navy-600 rounded px-1.5 py-0.5">{f}</span>
              ))}
              {community.includedFeatures.length > 3 && (
                <span className="text-xs text-navy-400">+{community.includedFeatures.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Incentives */}
        {activeIncentives.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeIncentives.slice(0, 2).map((inc) => (
              <IncentiveBadge key={inc.id} incentive={inc} size="sm" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-cream-200">
          <button
            onClick={() => onGetInfo?.(community)}
            className="btn-primary flex-1 justify-center text-xs py-2"
          >
            Get Info — Free
          </button>
          <a
            href={community.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs py-2 px-3"
            title="View on map"
          >
            <MapPin size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
