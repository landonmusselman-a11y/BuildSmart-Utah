'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Star, Home, ClipboardList, Search, Wrench, DollarSign, ChevronRight } from 'lucide-react';

interface WelcomePopupProps {
  onGetStarted: () => void;
}

const benefits = [
  {
    icon: DollarSign,
    color: 'bg-gold-600/20 text-gold-400',
    title: 'Cash Incentive Toward Appliances',
    desc: 'Receive a cash credit applied directly toward the appliances of your choice when you close with me.',
  },
  {
    icon: ClipboardList,
    color: 'bg-sage-400/20 text-sage-300',
    title: 'Complete Builder Comparison Analysis',
    desc: "I personally compare every builder's incentives, floor plans, quality, and lot inventory so you beat the market.",
  },
  {
    icon: Search,
    color: 'bg-cream-300/25 text-cream-300',
    title: '4-Way Inspection — $500 Value, FREE',
    desc: 'A thorough 4-phase third-party independent inspection at every stage of construction — included at no cost.',
  },
  {
    icon: Wrench,
    color: 'bg-sage-400/20 text-sage-400',
    title: 'Final Walk-Through Inspection',
    desc: 'Before you hand over your keys, a certified independent inspector walks the home with you to catch anything missed.',
  },
  {
    icon: Home,
    color: 'bg-gold-600/20 text-gold-300',
    title: 'Design Center Consultation',
    desc: 'I walk you through every upgrade option, tell you which add real resale value, and which to skip — saving thousands.',
  },
  {
    icon: Star,
    color: 'bg-cream-300/25 text-cream-200',
    title: '800+ New Construction Sales',
    desc: 'I know exactly how builders operate, what to negotiate, and how to protect you from contract to close.',
  },
];

export default function WelcomePopup({ onGetStarted }: WelcomePopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show if referred from Facebook, or on first visit
    const params = new URLSearchParams(window.location.search);
    const isFbRef = ['facebook', 'fb', 'fb-ad', 'meta'].some((v) => params.get('ref')?.toLowerCase().includes(v) || params.get('utm_source')?.toLowerCase().includes(v));
    const hasSeen = localStorage.getItem('bsu_welcome_seen');

    if (isFbRef || !hasSeen) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('bsu_welcome_seen', '1');
    setVisible(false);
  };

  const handleGetStarted = () => {
    dismiss();
    onGetStarted();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,12,4,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-cream-100 hover:bg-cream-200 transition-colors text-navy-500"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header band */}
        <div
          className="rounded-t-3xl px-8 pt-8 pb-6 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #1E1C19 0%, #312F2B 60%, #46433E 100%)' }}
        >
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-400/30 mb-4">
            <Home size={26} className="text-gold-400" />
          </div>

          <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/30 rounded-full px-4 py-1 mb-4">
            <Star size={11} className="text-gold-400 fill-gold-400" />
            <span className="text-gold-300 text-xs font-bold tracking-widest uppercase">800+ Homes Sold · 100% Free to You</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-2">
            You Deserve More Than<br />
            <span className="text-gold-400 italic">Just a Showing</span>
          </h2>
          <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
            Before you walk into a model home alone, let me show you what my clients get — completely free, because the builder pays my commission.
          </p>
        </div>

        {/* The big FREE badge */}
        <div className="flex justify-center -mt-5 mb-2 z-10 relative">
          <div className="bg-gold-500 text-white font-extrabold text-sm px-6 py-2 rounded-full shadow-lg shadow-gold-500/30 tracking-wide uppercase">
            Clients Save $25,000+ On Average &mdash; It&rsquo;s 100% Free
          </div>
        </div>

        {/* Benefits grid */}
        <div className="px-6 py-4 grid sm:grid-cols-2 gap-3">
          {benefits.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3 bg-cream-50 rounded-2xl p-4 border border-cream-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="font-semibold text-warm-900 text-sm leading-snug mb-1">{title}</div>
                <div className="text-warm-600 text-xs leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="px-6 pb-2">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {[
              'Builder pays my commission',
              'Zero cost to you',
              'No pressure, no obligation',
              'Licensed Utah agent',
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-warm-600 font-medium">
                <CheckCircle size={12} className="text-gold-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGetStarted}
            className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold px-6 py-4 rounded-2xl text-base transition-all shadow-lg shadow-gold-500/25 hover:-translate-y-0.5 active:scale-95"
          >
            Claim My Free Representation
            <ChevronRight size={18} />
          </button>
          <button
            onClick={dismiss}
            className="sm:w-auto text-warm-500 hover:text-warm-800 text-sm font-semibold px-4 py-4 rounded-2xl hover:bg-warm-50 transition-colors"
          >
            Browse First
          </button>
        </div>
      </div>
    </div>
  );
}
