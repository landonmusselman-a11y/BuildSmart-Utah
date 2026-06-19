'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, Phone } from 'lucide-react';

interface StickyBookingBarProps {
  onBook: () => void;
}

export default function StickyBookingBar({ onBook }: StickyBookingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Mobile bar */}
      <div className="lg:hidden bg-navy-900 border-t border-navy-700 px-4 py-3 flex gap-3 shadow-2xl">
        <button
          onClick={onBook}
          className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          <CalendarCheck size={15} />
          Schedule Free Consultation
        </button>
        <a
          href="tel:8012317565"
          className="flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-600 text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors"
        >
          <Phone size={15} />
        </a>
      </div>

      {/* Desktop floating button */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40 flex-col gap-2 items-end">
        <button
          onClick={onBook}
          className="flex items-center gap-2.5 bg-navy-900 hover:bg-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-2xl hover:-translate-y-0.5"
        >
          <CalendarCheck size={16} className="text-gold-400" />
          Schedule Free Consultation
        </button>
        <a
          href="tel:8012317565"
          className="flex items-center gap-2 bg-white border border-cream-200 text-navy-700 hover:bg-cream-50 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg"
        >
          <Phone size={13} />
          (801) 231-7565
        </a>
      </div>
    </div>
  );
}
