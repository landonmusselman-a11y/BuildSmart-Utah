'use client';

import { useState } from 'react';
import { Wrench, FileText, BarChart2, SearchCheck, ShieldCheck, ClipboardList, Gift, ArrowRight, ChevronDown } from 'lucide-react';

interface WhyHireMeSectionProps {
  onGetRepresented: () => void;
}

const services = [
  {
    icon: Gift,
    title: '$2,000 Appliance Credit',
    value: '$2,000',
    highlight: true,
    description: 'When you use our services, we personally cover $2,000 out of pocket so you walk into your new home with brand-new appliances — no strings, no fine print. Put it toward a refrigerator, a full washer and dryer set, or anything else you need. Our gift to you for letting us represent you.',
  },
  {
    icon: SearchCheck,
    title: '4-Way Framing Inspection',
    value: '$500',
    highlight: true,
    description: 'An independent inspector visits your home at framing, pre-drywall, pre-electrical close-up, and mechanical rough-in stages. Structural issues, misplaced windows, and rough-in mistakes get caught while they\'re still easy to fix — not after drywall covers everything.',
  },
  {
    icon: ShieldCheck,
    title: 'Final Pre-Close Inspection',
    value: '$500',
    highlight: true,
    description: 'A third-party walkthrough 1–2 days before closing. We catch punch-list items the builder\'s own team overlooks and document everything in writing — giving you real leverage to get issues resolved before you sign.',
  },
  {
    icon: Wrench,
    title: 'Independent Home Warranty',
    value: '$600',
    highlight: true,
    description: 'A 3rd-party structural warranty separate from the builder\'s coverage. If the builder disputes a claim or goes out of business, you\'re still protected. Retail value $600+.',
  },
  {
    icon: FileText,
    title: 'Builder Contract Review',
    value: 'Included',
    highlight: false,
    description: 'Utah new construction contracts are written by the builder\'s attorney, for the builder. I go through every line with you — flagging what\'s negotiable, what\'s risky, and where you have more power than you think.',
  },
  {
    icon: BarChart2,
    title: 'Design Center Strategy',
    value: 'Included',
    highlight: false,
    description: 'Design centers are where builders make their real money — buyers average $30–70k in upgrades. I tell you exactly what to upgrade for resale value, what to skip, and what to push back on or negotiate as an incentive instead of paying retail.',
  },
  {
    icon: ClipboardList,
    title: 'Weekly Build Tracker',
    value: 'Included',
    highlight: false,
    description: 'You get weekly progress photos and milestone updates throughout your build. You\'ll always know exactly where your home stands — no surprises at closing.',
  },
];

export default function WhyHireMeSection({ onGetRepresented }: WhyHireMeSectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const totalValue = 3600;

  function toggle(title: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  return (
    <section className="bg-white grain-section py-24" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-gold-600 flex-shrink-0" />
            <span className="text-navy-400 text-[11px] font-bold tracking-[0.22em] uppercase">What You Get</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 leading-[1.05] mb-4">
            Every Advantage.<br />Zero Cost to You.
          </h2>
          <p className="text-navy-500 text-lg max-w-lg">
            Builders pay our fee. Everything below comes standard — no hidden costs, no obligations.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

          {/* Left: accordion service list */}
          <div className="divide-y divide-cream-200">
            {services.map(({ icon: Icon, title, value, highlight, description }) => {
              const isOpen = expanded.has(title);
              return (
                <div key={title}>
                  {/* Row — clickable */}
                  <button
                    onClick={() => toggle(title)}
                    className="w-full flex items-center gap-4 py-5 text-left group focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      highlight
                        ? isOpen ? 'bg-gold-100' : 'bg-gold-50 group-hover:bg-gold-100'
                        : isOpen ? 'bg-cream-100' : 'bg-cream-50 group-hover:bg-cream-100'
                    }`}>
                      <Icon size={18} className={highlight ? 'text-gold-600' : 'text-navy-500'} />
                    </div>
                    <span className="font-semibold text-navy-900 text-base flex-1">{title}</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      highlight
                        ? 'bg-gold-600 text-white'
                        : 'bg-cream-100 text-navy-600'
                    }`}>
                      {value}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-navy-400 flex-shrink-0 transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expandable description */}
                  <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className="text-navy-500 text-sm leading-relaxed pb-5 pl-[60px] pr-10">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: value summary card */}
          <div className="bg-navy-900 rounded-2xl p-8 text-white lg:sticky lg:top-28">
            <p className="text-gold-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Total Included Value
            </p>
            <p className="font-display text-6xl font-bold leading-none mb-2">
              ${totalValue.toLocaleString()}+
            </p>
            <p className="text-navy-400 text-sm mb-8">
              At zero out-of-pocket cost to you.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'Builders pay our representation fee',
                'No hidden costs or obligations',
                'Full coverage from contract to keys',
              ].map((point) => (
                <div key={point} className="flex items-center gap-2.5 text-sm text-navy-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  {point}
                </div>
              ))}
            </div>

            <button
              onClick={onGetRepresented}
              className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              Get Started — It&apos;s Free
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
