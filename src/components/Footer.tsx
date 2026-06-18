import Link from 'next/link';
import { Phone, Mail, MapPin, Globe, Instagram } from 'lucide-react';

function FooterLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Stroke-style house icon — white version for dark footer */}
      <div className="w-9 h-9 flex-shrink-0">
        <svg viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="24" y="1" width="4" height="9" rx="0.5" fill="white" />
          <path d="M2 21L20 3L38 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="13"   y="8"  width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="21.5" y="8"  width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="13"   y="15" width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
          <rect x="21.5" y="15" width="5.5" height="5.5" rx="0.5" fill="#C4A882" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span className="font-extrabold text-white text-[1.1rem] tracking-tight">BUILD</span>
          <span className="font-extrabold text-gold-400 text-[1.1rem] tracking-tight">SMART</span>
        </div>
        <div className="flex items-center gap-1.5 mt-[2px]">
          <div className="h-px w-3 bg-gold-500" />
          <span className="text-[8px] font-bold text-navy-400 tracking-[0.18em] uppercase">Utah</span>
          <div className="h-px w-3 bg-gold-500" />
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Your Agent';
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 555-0100';
  const email = process.env.NEXT_PUBLIC_AGENT_EMAIL || 'agent@buildsmartutah.com';
  const brokerage = process.env.NEXT_PUBLIC_AGENT_BROKERAGE || 'Utah Realty';
  const license = process.env.NEXT_PUBLIC_AGENT_LICENSE || '';

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-2">
            <FooterLogo />
            <p className="text-navy-300 text-sm leading-relaxed mt-4 max-w-sm">
              New Construction. Smarter Decisions.{' '}
              <span className="text-white font-medium">
                Every Utah builder, every community, every incentive — in one place.
              </span>{' '}
              Free buyer representation from a new construction specialist.
            </p>

            {/* Brand pillars */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {[
                { label: 'Trusted', sub: 'Reliable. Transparent. Local.' },
                { label: 'Smart', sub: 'Data-driven. Informed. Clear.' },
                { label: 'Focused', sub: 'New Construction Experts.' },
                { label: 'Helpful', sub: 'Guiding you every step.' },
              ].map(({ label, sub }) => (
                <div key={label} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{label}</div>
                    <div className="text-[10px] text-navy-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social / domain */}
            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="https://newconstructionutah.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-gold-400 transition-colors font-medium"
              >
                <Globe size={13} />
                newconstructionutah.com
              </a>
              <a
                href="https://instagram.com/buildsmartutah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-gold-400 transition-colors font-medium"
              >
                <Instagram size={13} />
                @buildsmartutah
              </a>
            </div>
          </div>

          {/* Explore links */}
          <div>
            <h3 className="font-bold text-gold-400 mb-4 uppercase tracking-widest text-[10px]">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/builders', label: 'All Builders' },
                { href: '/communities', label: 'All Communities' },
                { href: '/best-builders', label: 'Best Builders Guides' },
                { href: '/compare', label: 'Compare Builders' },
                { href: '/communities?tab=spec', label: 'Spec Homes — Move-In Ready' },
                { href: '/communities?tab=dirt', label: 'Dirt Builds & Floor Plans' },
                { href: '/communities?filter=incentives', label: 'Active Incentives' },
                { href: '/calculators', label: 'Calculators & Tools' },
                { href: '/learn', label: 'Learning Center' },
                { href: '/services', label: 'How It Works' },
                { href: '/about', label: 'About Me' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-navy-300 hover:text-white text-sm transition-colors leading-snug"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gold-400 mb-4 uppercase tracking-widest text-[10px]">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="font-bold text-white text-base">{agentName}</div>
              <div className="text-navy-400 text-xs">{brokerage}</div>
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors"
              >
                <Phone size={13} className="text-gold-400 flex-shrink-0" />
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors break-all"
              >
                <Mail size={13} className="text-gold-400 flex-shrink-0" />
                {email}
              </a>
              <div className="flex items-start gap-2 text-navy-300">
                <MapPin size={13} className="text-gold-400 flex-shrink-0 mt-0.5" />
                Serving the entire Wasatch Front &amp; Back
              </div>
            </div>

            {/* CTA in footer */}
            <div className="mt-6 bg-gold-500/10 border border-gold-500/20 rounded-xl p-4">
              <p className="text-xs text-gold-300 font-semibold mb-2">
                Ready to find your new build?
              </p>
              <Link
                href="/#spec-homes"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
              >
                Browse Spec Homes →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-navy-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-navy-500">
          <div>
            © {new Date().getFullYear()} BuildSmart Utah · New Construction. Smarter Decisions.
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-center sm:text-right">
            <Link href="/privacy" className="hover:text-navy-300 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-navy-300 transition-colors">Terms of Service</Link>
            <span>·</span>
            <span>{agentName}{license && ` · License #${license}`} · {brokerage} · Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
