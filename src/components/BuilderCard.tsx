'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Home, Award, ChevronRight } from 'lucide-react';
import { Builder } from '@/types';
import IncentiveBadge from './IncentiveBadge';

interface BuilderCardProps {
  builder: Builder;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function BuilderCard({ builder }: BuilderCardProps) {
  const activeIncentives = builder.incentives.filter((i) => i.active);

  return (
    <Link href={`/builders/${builder.slug}`} className="card block group overflow-hidden">
      {/* Color header with logo */}
      <div
        className="h-20 flex items-center px-5 gap-4"
        style={{ backgroundColor: builder.logoColor }}
      >
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
          {builder.logoUrl ? (
            <Image
              src={builder.logoUrl}
              alt={builder.name}
              width={48}
              height={48}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const span = document.createElement('span');
                span.className = 'font-extrabold text-xs';
                span.style.color = builder.logoColor;
                span.textContent = builder.logoInitials;
                e.currentTarget.parentElement?.appendChild(span);
              }}
            />
          ) : (
            <span className="font-extrabold text-xs" style={{ color: builder.logoColor }}>
              {builder.logoInitials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-bold text-base truncate">{builder.name}</h3>
          <p className="text-white/70 text-xs">{builder.yearsInBusiness} yrs in business</p>
        </div>
        {builder.featured && (
          <div className="ml-auto">
            <span className="bg-gold-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Featured</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-navy-600 text-sm leading-relaxed line-clamp-2 mb-4">{builder.tagline}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-navy-50 rounded-lg p-2.5">
            <div className="text-xs text-navy-500 mb-0.5">Price Range</div>
            <div className="text-sm font-semibold text-navy-900">
              {fmt(builder.priceMin)}–{fmt(builder.priceMax).replace('$', '')}
            </div>
          </div>
          <div className="bg-navy-50 rounded-lg p-2.5">
            <div className="text-xs text-navy-500 mb-0.5">Communities</div>
            <div className="text-sm font-semibold text-navy-900">{builder.communities.length} active</div>
          </div>
        </div>

        {/* Areas */}
        <div className="flex items-start gap-1.5 mb-4">
          <MapPin size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-navy-600 leading-relaxed">{builder.areas.slice(0, 3).join(', ')}</p>
        </div>

        {/* Active incentives */}
        {activeIncentives.length > 0 && (
          <div className="border-t border-cream-200 pt-3 flex flex-wrap gap-1.5">
            {activeIncentives.slice(0, 2).map((inc) => (
              <IncentiveBadge key={inc.id} incentive={inc} size="sm" />
            ))}
            {activeIncentives.length > 2 && (
              <span className="text-xs text-gold-600 font-medium">+{activeIncentives.length - 2} more</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-end text-navy-700 text-sm font-medium group-hover:text-gold-600 transition-colors">
          View builder <ChevronRight size={15} className="ml-0.5" />
        </div>
      </div>
    </Link>
  );
}
