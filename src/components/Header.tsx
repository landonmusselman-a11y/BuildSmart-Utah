'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Map, Tag, Zap, Instagram, Facebook } from 'lucide-react';

interface HeaderProps {
  onGetRepresented?: () => void;
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.27a8.18 8.18 0 0 0 4.78 1.53V7.34a4.85 4.85 0 0 1-1.01-.65z" />
    </svg>
  );
}

const socials = [
  { icon: Instagram,   href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook,    href: process.env.NEXT_PUBLIC_FACEBOOK_URL  || 'https://facebook.com',  label: 'Facebook'  },
  { icon: TikTokIcon,  href: process.env.NEXT_PUBLIC_TIKTOK_URL    || 'https://tiktok.com',    label: 'TikTok'    },
];

/** BuildSmart Utah wordmark — stroke-style house icon matching brand guide */
function Logo() {
  return (
    <Link href="/" className="logo-link flex items-center gap-3 flex-shrink-0">
      <div className="w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="24" y="1" width="4" height="9" rx="0.5" fill="white" />
          <path d="M2 21L20 3L38 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="13"   y="23" width="5.5" height="5.5" rx="0.5" fill="#B8692B" className="logo-window" style={{ animationDelay: '0ms' }} />
          <rect x="21.5" y="23" width="5.5" height="5.5" rx="0.5" fill="#B8692B" className="logo-window" style={{ animationDelay: '120ms' }} />
          <rect x="13"   y="30" width="5.5" height="5.5" rx="0.5" fill="#B8692B" className="logo-window" style={{ animationDelay: '240ms' }} />
          <rect x="21.5" y="30" width="5.5" height="5.5" rx="0.5" fill="#B8692B" className="logo-window" style={{ animationDelay: '360ms' }} />
        </svg>
      </div>
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
    { href: '/builders',    label: 'Builders' },
    { href: '/communities', label: 'Communities' },
    { href: '/compare',     label: 'Compare' },
    { href: '/map',         label: 'Map',        icon: Map },
    { href: '/incentives',  label: 'Incentives', icon: Tag, highlight: true },
    { href: '/learn',       label: 'Learn' },
    { href: '/calculators', label: 'Tools' },
    { href: '/services',    label: 'Services' },
    { href: '/about',       label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900/70 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all text-white/85 hover:text-white hover:bg-white/10 ${
                    link.highlight ? '!text-gold-300 hover:!text-gold-200 hover:!bg-gold-500/10' : ''
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  {link.label}
                  {link.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right: socials + phone + CTA */}
          <div className="hidden md:flex items-center gap-3">

            {/* Social icons */}
            <div className="flex items-center gap-0.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/15" />

            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 text-white/75 hover:text-white text-sm font-semibold transition-colors"
            >
              <Phone size={14} />
              {phone}
            </a>
            <button onClick={onGetRepresented} className="btn-primary text-sm py-2.5 flex items-center gap-1.5">
              <Zap size={13} />
              Get the Insider Playbook
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
          <div className="pt-3 border-t border-cream-200/20 space-y-3">
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-white/70 px-3 py-2"
            >
              <Phone size={15} />
              {phone}
            </a>
            {/* Mobile socials */}
            <div className="flex items-center gap-1 px-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
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
