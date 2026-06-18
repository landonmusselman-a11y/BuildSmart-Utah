import { Shield, Award, Clock, DollarSign } from 'lucide-react';

interface AgentSectionProps {
  onGetRepresented: () => void;
}

const benefits = [
  {
    icon: Award,
    title: '8 Years. 800+ Homes Built.',
    desc: 'We work exclusively in new construction — no resale, no distraction. 8 years and 800+ homes built from the ground up gives us insight no generalist can match.',
  },
  {
    icon: Shield,
    title: 'Your Interests Only',
    desc: "The builder's on-site agent works for the builder. We work exclusively for you — catching contract traps, negotiating upgrades, and protecting you at every step.",
  },
  {
    icon: DollarSign,
    title: '$3,600+ in Free Services',
    desc: 'Appliance credit, two independent inspections, a third-party home warranty, upgrade analysis, and weekly build tracking — all included at no cost.',
  },
  {
    icon: Clock,
    title: 'Weekly Build Updates',
    desc: 'Our custom build tracker keeps you informed every step of the way — from groundbreak through final walk-through. No chasing the superintendent.',
  },
];

export default function AgentSection({ onGetRepresented }: AgentSectionProps) {
  const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Your Agent';
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 555-0100';
  const brokerage = process.env.NEXT_PUBLIC_AGENT_BROKERAGE || 'Utah Realty';

  return (
    <section className="py-20 bg-navy-900 text-white" id="agent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left: why use an agent */}
          <div>
            <div className="inline-block bg-gold-500/20 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Why Work With Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
              You Need an Expert in Your Corner
            </h2>
            <p className="text-navy-300 text-lg leading-relaxed mb-8">
              Most buyers walk into a builder's sales office alone — and the on-site agent works for the builder, not you. Having a buyer's agent costs you nothing and protects you throughout the entire process.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={17} className="text-gold-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{title}</div>
                    <div className="text-navy-400 text-sm leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: agent card */}
          <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 rounded-2xl bg-gold-gradient flex items-center justify-center mb-5 mx-auto md:mx-0">
              <span className="text-white font-bold text-3xl">
                {agentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{agentName}</h3>
            <p className="text-gold-400 text-sm font-medium mb-1">New Construction Specialist</p>
            <p className="text-navy-400 text-sm mb-6">{brokerage}</p>

            <div className="space-y-3 mb-6 text-sm text-navy-300">
              <div>✓ 8 years exclusively in Utah new construction</div>
              <div>✓ 800+ homes built from the ground up</div>
              <div>✓ Knows every builder's contract traps and real incentives</div>
              <div>✓ Guides you from contract to keys — at zero cost</div>
            </div>

            <div className="space-y-3">
              <button onClick={onGetRepresented} className="btn-primary w-full justify-center">
                Schedule Free Consultation
              </button>
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="block text-center text-navy-300 hover:text-white text-sm transition-colors">
                Or call directly: {phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
