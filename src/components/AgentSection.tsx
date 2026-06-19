import Image from 'next/image';
import { Shield, BarChart2, Clock, FileCheck, Wrench } from 'lucide-react';

interface AgentSectionProps {
  onGetRepresented: () => void;
}

const services = [
  {
    icon: BarChart2,
    title: 'Builder Market Intelligence',
    desc: 'Side-by-side analysis of every active Utah builder — incentives, upgrade margins, lot premiums, and deposit structures before you visit a single community.',
  },
  {
    icon: FileCheck,
    title: 'Contract Firewall',
    desc: 'I have read hundreds of builder contracts. I know the clauses that let builders raise prices, cancel without repercussions, and limit warranty obligations. You need to know them before you sign.',
  },
  {
    icon: Wrench,
    title: 'Design Center Mastery',
    desc: 'I know which upgrades have 60–80% builder markup and can be done cheaper after closing — and which ones you can never add later. I\'ll walk you through every option at every tier.',
  },
  {
    icon: Clock,
    title: 'Build Tracking & Weekly Updates',
    desc: 'Custom build tracking with weekly photos and milestone updates throughout construction. You\'re never in the dark, and I\'m physically present at four-way and final inspections.',
  },
  {
    icon: Shield,
    title: 'Independent Inspections + Warranty',
    desc: 'Two third-party inspections at key build stages plus an independent home warranty alongside the builder\'s warranty — because one layer of protection isn\'t enough.',
  },
];

export default function AgentSection({ onGetRepresented }: AgentSectionProps) {
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 231-7565';
  const brokerage = process.env.NEXT_PUBLIC_AGENT_BROKERAGE || 'NRE';

  return (
    <section className="py-20 bg-navy-900 text-white" id="agent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-block bg-gold-500/20 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            The Insider Who Switched Sides
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            I Spent 4 Years Learning the<br className="hidden md:block" /> Builder&apos;s Playbook.
          </h2>
          <p className="text-navy-300 text-lg leading-relaxed">
            I ran sales for Utah&apos;s largest homebuilder and hit #1 in volume 4 consecutive years.
            I learned exactly how builders structure contracts, price incentives, what design center upgrades have 80% margin,
            and what buyers never think to ask. Then I realized buyers were walking into these transactions blind —
            and the on-site agent was never going to tell them what I knew. So I switched sides.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-14 items-start">

          {/* Left: services */}
          <div className="space-y-6">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-gold-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">{title}</div>
                  <div className="text-navy-400 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: agent card */}
          <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700">
            {/* Headshot */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 mx-auto md:mx-0 flex-shrink-0">
              <Image
                src="/landon.jpg"
                alt="Landon Rose — New Construction Specialist"
                width={96}
                height={96}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h3 className="text-xl font-bold mb-1">Landon Rose</h3>
            <p className="text-gold-400 text-sm font-medium mb-1">New Construction Specialist</p>
            <p className="text-navy-400 text-sm mb-6">Licensed with {brokerage}</p>

            <div className="space-y-3 mb-6 text-sm text-navy-300">
              <div>✓ Led #1 volume at Utah&apos;s largest builder for 4 consecutive years</div>
              <div>✓ 800+ homes built from the ground up, exclusively new construction</div>
              <div>✓ Knows every contract trap, upgrade margin, and real incentive in Utah</div>
              <div>✓ BuildSmart software tracks every builder, incentive, and community statewide</div>
              <div>✓ Full representation from contract to keys — at zero cost to you</div>
            </div>

            <div className="space-y-3">
              <button onClick={onGetRepresented} className="btn-primary w-full justify-center">
                Schedule Free Consultation
              </button>
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="block text-center text-navy-300 hover:text-white text-sm transition-colors"
              >
                Or call/text directly: {phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
