'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Map, Tag, Zap } from 'lucide-react';

interface HeaderProps {
  onGetRepresented?: () => void;
}

/** BuildSmart Utah wordmark — stroke-style house icon matching brand guide */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 flex-shrink-0">
      {/* House icon — outline/stroke style matching brand guide */}
      <div className="w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Chimney */}
          <rect x="24" y="1" width="4" height="9" rx="0.5" fill="white" />
          {/* Roof outline — two angled strokes meeting at peak */}
          <path d="M2 21L20 3L38 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Gold 2×2 window panes inside gable */}
          <rect x="13"   y="8"    width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="21.5" y="8"    width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="13"   y="15"   width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="21.5" y="15"   width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span className="font-extrabold text-white text-[1.2rem] tracking-tight">BUILD</span>
          <span className="font-extrabold text-gold-400 text-[1.2rem] tracking-tight">SMART</span>
        </div>
        <div className="flex items-center gap-1.5 mt-[2px]">
          <div className="h-px w-3.5 bg-gold-500" />
          <span className="text-[9px] font-bold text-white/50 tracking-[0.18em] uppercase">Utah</span>
          <div className="h-px w-3.5 bg-gold-500" />
        </div>
      </div>
    </Link>
  );
}

export default function Header({ onGetRepresented }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 555-0100';

  const navLinks = [
    { href: '/builders', label: 'Builders' },
    { href: '/communities', label: 'Communities' },
    { href: '/compare', label: 'Compare' },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/incentives', label: 'Incentives', icon: Tag, highlight: true },
    { href: '/learn', label: 'Learn' },
    { href: '/calculators', label: 'Tools' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-white/80 hover:text-white hover:bg-white/10 ${
                    link.highlight ? '!text-gold-400 hover:!text-gold-300 hover:!bg-gold-500/10' : ''
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  {link.label}
                  {link.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <Phone size={14} />
              {phone}
            </a>
            <button onClick={onGetRepresented} className="btn-primary text-sm py-2 flex items-center gap-1.5">
              <Zap size={13} />
              Schedule Free Consultation
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-900/98 backdrop-blur-md px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium ${
                  link.highlight ? 'text-gold-400 bg-gold-500/10' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {Icon && <Icon size={15} />}
                {link.label}
                {link.highlight && (
                  <span className="ml-auto text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full font-semibold">
                    Live Deals
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-white/70 px-3 py-2"
            >
              <Phone size={15} />
              {phone}
            </a>
            <button
              onClick={() => { setMenuOpen(false); onGetRepresented?.(); }}
              className="btn-primary w-full justify-center text-sm"
            >
              Free Representation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
