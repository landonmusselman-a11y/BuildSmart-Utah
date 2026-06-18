'use client';

import { Search, ChevronDown, DollarSign, Award, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeroSectionProps {
  onGetRepresented: () => void;
  stats: { builders: number; communities: number; activeIncentives: number; citiesServed: number };
}

const valueProps = [
  {
    icon: Award,
    title: '8 Years. 800+ Homes Built.',
    sub: 'Exclusively new construction',
    body: 'Not a generalist. We have worked exclusively with Utah builders for 8 years and built over 800 homes from the ground up.',
    accent: 'border-gold-400/40 bg-gold-400/10',
    iconColor: 'text-gold-300',
  },
  {
    icon: DollarSign,
    title: '$3,600+ in Free Services',
    sub: 'Included when you hire us',
    body: 'Appliance credit, two 3rd-party inspections, home warranty, upgrade analysis, contract review & weekly build tracking.',
    accent: 'border-emerald-400/40 bg-emerald-500/10',
    iconColor: 'text-emerald-300',
  },
  {
    icon: FileCheck,
    title: 'Zero Cost. Ever.',
    sub: 'Builders pay our commission',
    body: 'The builder pays our fee — not you. You get every service listed below at absolutely no cost to you.',
    accent: 'border-blue-400/40 bg-blue-500/10',
    iconColor: 'text-blue-300',
  },
];

export default function HeroSection({ onGetRepresented, stats }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/communities?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="utah-hero-bg min-h-screen flex flex-col items-center justify-center px-4 py-24 text-center relative">

      {/* Trust pill */}
      <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/25 rounded-full px-5 py-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/90 text-sm font-semibold tracking-wide">
          Utah&apos;s New Construction Specialist &middot; Free Buyer Representation
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-display leading-[1.12] tracking-tight max-w-5xl mb-8">
        <span className="block text-4xl sm:text-5xl md:text-6xl text-white font-bold">
          Every Builder. Every Community.
        </span>
        <span className="block text-4xl sm:text-5xl md:text-6xl text-gold-400 font-bold mt-1">
          Every Incentive. In One Place.
        </span>
      </h1>

      {/* ── VALUE PROP CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl mb-10">
        {valueProps.map(({ icon: Icon, title, sub, body, accent, iconColor }) => (
          <div
            key={title}
            className={`rounded-2xl border backdrop-blur-md px-5 py-5 text-left ${accent}`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`${iconColor}`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{title}</div>
                <div className="text-white/50 text-[11px] font-medium">{sub}</div>
              </div>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl mb-5">
        <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex items-center pl-5 text-gray-400 flex-shrink-0">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, builder, or community..."
            className="flex-1 px-4 py-4 text-navy-900 placeholder-gray-400 focus:outline-none text-base bg-transparent"
          />
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-white font-bold px-7 m-2 rounded-xl transition-colors text-sm tracking-wide"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick-filter chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[
          { label: 'Saratoga Springs', q: 'Saratoga Springs' },
          { label: 'Lehi / Silicon Slopes', q: 'Lehi' },
          { label: 'Herriman', q: 'Herriman' },
          { label: 'Eagle Mountain', q: 'Eagle Mountain' },
          { label: 'South Jordan', q: 'South Jordan' },
          { label: 'Heber / Park City', q: 'Heber' },
        ].map(({ label, q }) => (
          <button
            key={label}
            onClick={() => router.push(`/communities?q=${encodeURIComponent(q)}`)}
            className="bg-white/12 hover:bg-white/22 backdrop-blur-sm border border-white/25 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
          >
            {label}
          </button>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-14">
        <button
          onClick={onGetRepresented}
          className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-2xl hover:shadow-gold-500/30 hover:-translate-y-0.5 active:scale-95"
        >
          Schedule Free Consultation
        </button>
        <a
          href="#search-map"
          className="inline-flex items-center justify-center gap-2 bg-white/12 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 font-bold px-10 py-4 rounded-2xl transition-all"
        >
          <Search size={16} />
          Browse on Map
        </a>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
        {[
          { value: `${stats.builders}`, label: 'Active Builders' },
          { value: `${stats.communities}`, label: 'Communities' },
          { value: `${stats.activeIncentives}`, label: 'Live Incentives' },
          { value: `${stats.citiesServed}`, label: 'Utah Cities' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl py-4 px-2 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-none">{value}</div>
            <div className="text-white/55 text-[10px] mt-1.5 font-semibold tracking-widest uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/35 animate-bounce">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
