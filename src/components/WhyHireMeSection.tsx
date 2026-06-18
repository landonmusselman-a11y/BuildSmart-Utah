'use client';

import {
  Wrench,
  FileText,
  BarChart2,
  SearchCheck,
  ShieldCheck,
  ClipboardList,
  Gift,
  CheckCircle,
} from 'lucide-react';

interface WhyHireMeSectionProps {
  onGetRepresented: () => void;
}

const services = [
  {
    icon: Gift,
    title: '$2,000 Appliance Credit',
    value: '$2,000',
    desc: 'Applied at closing toward the appliances of your choice — a direct cash benefit exclusive to our clients.',
    highlight: true,
  },
  {
    icon: FileText,
    title: 'Custom Builder Contract Review',
    value: 'Included',
    desc: "Builder contracts are written to protect the builder. We read every clause, flag what hurts you, and negotiate terms before you sign.",
    highlight: false,
  },
  {
    icon: BarChart2,
    title: 'Design Center & Upgrade Analysis',
    value: 'Included',
    desc: "We walk you through every structural and design option and tell you exactly which upgrades add resale value, which you can do cheaper later, and which to skip entirely.",
    highlight: false,
  },
  {
    icon: SearchCheck,
    title: '4-Way 3rd-Party Inspection',
    value: '$500',
    desc: 'An independent inspector visits once framing, rough plumbing, HVAC, and electrical are complete — catching problems before the walls close up.',
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: 'Final 3rd-Party Inspection',
    value: '$500',
    desc: 'A second independent inspection before your final walk-through. We find what the builder missed so it gets fixed before you take ownership.',
    highlight: true,
  },
  {
    icon: Wrench,
    title: '3rd-Party Home Warranty',
    value: '$600',
    desc: 'A structural home warranty from an independent provider — separate from the builder\'s own warranty — giving you an extra layer of protection.',
    highlight: true,
  },
  {
    icon: ClipboardList,
    title: 'Custom Build Tracker',
    value: 'Included',
    desc: 'Weekly updates on your build from groundbreak to close. You always know exactly where your home stands — no chasing the superintendent.',
    highlight: false,
  },
];

const credentials = [
  '8 years working exclusively with Utah new construction builders',
  'Built over 800 homes from the ground up',
  'Deep relationships with every major builder in the state',
  'Know every builder\'s contract traps, upgrade margins, and real incentives',
];

export default function WhyHireMeSection({ onGetRepresented }: WhyHireMeSectionProps) {
  const totalValue = 2000 + 500 + 500 + 600;

  return (
    <section className="bg-white py-20" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-block bg-gold-50 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Why Hire a New Build Specialist
          </div>
          <h2 className="section-heading mb-4">
            Everything You Get When You Work With Us
          </h2>
          <p className="section-sub mx-auto max-w-2xl">
            Most buyers walk into a builder's office alone — and the on-site agent works for the builder.
            Here's exactly what you get when you hire an expert who works exclusively for you.
          </p>
        </div>

        {/* Credentials bar */}
        <div className="bg-navy-900 rounded-2xl px-6 py-6 mb-12 grid sm:grid-cols-2 gap-4">
          {credentials.map((c) => (
            <div key={c} className="flex items-start gap-3">
              <CheckCircle size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
              <span className="text-white/85 text-sm leading-snug">{c}</span>
            </div>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {services.map(({ icon: Icon, title, value, desc, highlight }) => (
            <div
              key={title}
              className={`rounded-2xl p-6 border flex flex-col gap-3 ${
                highlight
                  ? 'border-gold-200 bg-gold-50'
                  : 'border-gray-100 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  highlight ? 'bg-gold-100' : 'bg-navy-50'
                }`}>
                  <Icon size={18} className={highlight ? 'text-gold-600' : 'text-navy-600'} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  highlight
                    ? 'bg-gold-500 text-white'
                    : 'bg-navy-100 text-navy-700'
                }`}>
                  {value}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-sm mb-1.5">{title}</h3>
                <p className="text-navy-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total value + CTA */}
        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <div className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Total Included Value
          </div>
          <div className="text-5xl font-extrabold text-white mb-1">
            ${totalValue.toLocaleString()}+
          </div>
          <p className="text-navy-300 text-sm mb-8 max-w-lg mx-auto">
            In direct services included when you hire us — plus contract review, upgrade analysis, and weekly build tracking. All at zero cost to you. Builders pay our commission.
          </p>
          <button
            onClick={onGetRepresented}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-lg hover:-translate-y-0.5"
          >
            Schedule Free Consultation — Claim Your Services
          </button>
        </div>

      </div>
    </section>
  );
}
