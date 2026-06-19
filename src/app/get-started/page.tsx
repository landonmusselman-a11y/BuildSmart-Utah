'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getAllCommunities } from '@/data/mock';
import { Community } from '@/types';
import {
  ArrowRight, ArrowLeft, CheckCircle2, MapPin, Zap, Home,
  Clock, CreditCard, Star, Target, Building2, Shield,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormAnswers {
  budget: string;
  areas: string[];
  priorities: string[];
  homeType: string;
  timeline: string;
  preApproval: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const INITIAL: FormAnswers = {
  budget: '', areas: [], priorities: [], homeType: '',
  timeline: '', preApproval: '', firstName: '', lastName: '',
  email: '', phone: '',
};

// ─── Matching data ────────────────────────────────────────────────────────────
const BUDGET_MAP: Record<string, [number, number]> = {
  'Under $400K':   [0, 400000],
  '$400K – $500K': [400000, 500000],
  '$500K – $650K': [500000, 650000],
  '$650K – $850K': [650000, 850000],
  '$850K – $1.1M': [850000, 1100000],
  '$1.1M+':        [1100000, Infinity],
};

const AREA_CITIES: Record<string, string[]> = {
  'Salt Lake County':     ['Herriman', 'Bluffdale', 'South Jordan', 'Draper'],
  'North Utah County':    ['Lehi', 'American Fork', 'Vineyard', 'Highland'],
  'South Utah County':    ['Eagle Mountain', 'Saratoga Springs', 'Salem'],
  'Davis County':         ['Syracuse', 'Clinton', 'Layton'],
  'Wasatch / Park City':  ['Heber City', 'Midway'],
  'Cache County (Logan)': ['Logan'],
};

// ─── Community matching algorithm ─────────────────────────────────────────────
function matchCommunities(answers: FormAnswers): Community[] {
  const all = getAllCommunities();
  const budget = BUDGET_MAP[answers.budget];
  const openToAll = answers.areas.includes('Open to anything') || answers.areas.length === 0;
  const areaCities = openToAll ? [] : answers.areas.flatMap(a => AREA_CITIES[a] ?? []);

  const scored = all.map(c => {
    let score = 0;

    // Budget match (hard filter with small buffer)
    if (budget) {
      const [lo, hi] = budget;
      if (c.priceMin <= hi && c.priceMax >= lo) score += 5;
      else if (c.priceMin <= hi + 80000 && c.priceMax >= lo - 80000) score += 2;
      else return { c, score: -99 }; // No overlap — exclude
    }

    // Area match
    if (!openToAll) {
      if (areaCities.includes(c.city)) score += 5;
      else score -= 3;
    }

    // Home type
    if (answers.homeType === 'spec') {
      if (c.type === 'dirt-only') return { c, score: -99 };
      const ready = (c.specHomes ?? []).filter(s => s.status === 'move-in-ready').length;
      score += Math.min(ready * 2, 6);
    } else if (answers.homeType === 'dirt') {
      if (c.type === 'spec-only') return { c, score: -99 };
      score += Math.min((c.floorPlans?.length ?? 0), 5);
    } else {
      score += 1;
    }

    // Priorities
    const p = answers.priorities;
    if (p.includes('Low / No HOA') && !c.hoa) score += 4;
    if (p.includes('Quick move-in') && (c.specHomes ?? []).some(s => s.status === 'move-in-ready')) score += 4;
    if (p.includes('Energy efficiency') && ['garbett-homes', 'meritage-homes'].includes(c.builderSlug)) score += 4;
    if (p.includes('Large lot / yard') && (c.lotSizeMax ?? 0) >= 9000) score += 3;
    if (p.includes('Mountain views') && c.features.some(f => /view|mountain|canyon/i.test(f))) score += 3;
    if (p.includes('Great schools') && c.features.some(f => /school|district|alpine|jordan|davis/i.test(f))) score += 3;
    if (p.includes('Active incentives') && c.incentives.some(i => i.active)) score += 3;
    if (p.includes('Park City / ski access') && c.county === 'Wasatch County') score += 4;
    if (p.includes('Short SLC commute') && ['Salt Lake County', 'Utah County'].includes(c.county)) score += 2;

    // Availability boost
    if ((c.availableLots ?? 0) >= 10) score += 2;
    if (c.status === 'coming-soon') score -= 2;

    return { c, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ c }) => c);
}

// ─── Reusable UI atoms ────────────────────────────────────────────────────────
function SelectCard({
  label, sub, icon, selected, onClick,
}: {
  label: string; sub?: string; icon?: React.ReactNode;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'bg-navy-900 border-navy-900 text-white shadow-md'
          : 'bg-white border-gray-200 text-navy-800 hover:border-gold-400 hover:bg-gold-50'
      }`}
    >
      {icon && (
        <span className={`flex-shrink-0 ${selected ? 'text-gold-400' : 'text-navy-400'}`}>
          {icon}
        </span>
      )}
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        {sub && <div className={`text-xs mt-0.5 ${selected ? 'text-white/70' : 'text-navy-400'}`}>{sub}</div>}
      </div>
      {selected && <CheckCircle2 size={18} className="text-gold-400 flex-shrink-0" />}
    </button>
  );
}

function MultiChip({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
        selected
          ? 'bg-navy-900 border-navy-900 text-white'
          : 'bg-white border-gray-200 text-navy-700 hover:border-gold-400 hover:bg-gold-50'
      }`}
    >
      {selected && <CheckCircle2 size={12} className="text-gold-400" />}
      {label}
    </button>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────
function StepBudget({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { label: 'Under $400K',   sub: 'Entry-level — Eagle Mountain, Clinton, Saratoga Springs' },
    { label: '$400K – $500K', sub: 'Most popular range — widest selection across Utah' },
    { label: '$500K – $650K', sub: 'Move-up — Lehi, Herriman, American Fork' },
    { label: '$650K – $850K', sub: 'Premium — South Jordan, Highland, Draper' },
    { label: '$850K – $1.1M', sub: 'Luxury — Draper, Heber, Traverse Mountain' },
    { label: '$1.1M+',        sub: 'Estate — Toll Brothers, custom builders' },
  ];
  return (
    <div className="space-y-3">
      {opts.map(o => (
        <SelectCard key={o.label} label={o.label} sub={o.sub} selected={value === o.label} onClick={() => onChange(o.label)} />
      ))}
    </div>
  );
}

function StepAreas({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const areas = [
    ...Object.keys(AREA_CITIES),
    'Open to anything',
  ];
  const toggle = (area: string) => {
    if (area === 'Open to anything') { onChange(['Open to anything']); return; }
    const filtered = value.filter(v => v !== 'Open to anything');
    onChange(filtered.includes(area) ? filtered.filter(v => v !== area) : [...filtered, area]);
  };
  return (
    <div className="flex flex-wrap gap-3">
      {areas.map(a => (
        <MultiChip key={a} label={a} selected={value.includes(a)} onClick={() => toggle(a)} />
      ))}
    </div>
  );
}

function StepPriorities({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const opts = [
    'Great schools', 'Short SLC commute', 'Short Utah County commute',
    'Large lot / yard', 'Low / No HOA', 'Mountain views',
    'Quick move-in', 'Energy efficiency', 'Luxury finishes',
    'Active incentives', 'Park City / ski access', 'Quiet neighborhood',
  ];
  const toggle = (p: string) =>
    onChange(value.includes(p) ? value.filter(v => v !== p) : [...value, p]);
  return (
    <div className="flex flex-wrap gap-2.5">
      {opts.map(p => (
        <MultiChip key={p} label={p} selected={value.includes(p)} onClick={() => toggle(p)} />
      ))}
    </div>
  );
}

function StepHomeType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <SelectCard
        label="Spec Home — Already built or nearly done"
        sub="Move in within 30–90 days. Finishes already selected."
        icon={<Zap size={20} />}
        selected={value === 'spec'} onClick={() => onChange('spec')}
      />
      <SelectCard
        label="Dirt Build — Choose my lot & floor plan"
        sub="Customize everything. 6–12 month build timeline."
        icon={<Target size={20} />}
        selected={value === 'dirt'} onClick={() => onChange('dirt')}
      />
      <SelectCard
        label="Either — Show me both options"
        sub="I'm open. Help me figure out what's best."
        icon={<Home size={20} />}
        selected={value === 'either'} onClick={() => onChange('either')}
      />
    </div>
  );
}

function StepTimeline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <SelectCard label="ASAP — I want to move within 60 days"   sub="Let's find move-in ready spec homes."          icon={<Zap size={20} />}     selected={value === 'ASAP — I want to move within 60 days'}   onClick={() => onChange('ASAP — I want to move within 60 days')} />
      <SelectCard label="3–6 months"                             sub="Under construction specs + dirt builds."       icon={<Clock size={20} />}   selected={value === '3–6 months'}                             onClick={() => onChange('3–6 months')} />
      <SelectCard label="6–12 months"                            sub="Most dirt builds fall in this window."         icon={<Clock size={20} />}   selected={value === '6–12 months'}                            onClick={() => onChange('6–12 months')} />
      <SelectCard label="Just researching for now"               sub="No rush — I want to understand my options."   icon={<Target size={20} />}  selected={value === 'Just researching for now'}               onClick={() => onChange('Just researching for now')} />
    </div>
  );
}

function StepPreApproval({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <SelectCard label="Yes — I'm pre-approved"                  sub="Ready to write a contract when we find the right home." icon={<CheckCircle2 size={20} />} selected={value === "Yes — I'm pre-approved"}                  onClick={() => onChange("Yes — I'm pre-approved")} />
      <SelectCard label="In progress — working with a lender"     sub="Almost there. I can be ready within 1–2 weeks."         icon={<Clock size={20} />}        selected={value === 'In progress — working with a lender'}     onClick={() => onChange('In progress — working with a lender')} />
      <SelectCard label="No — I need help finding a lender"       sub="I can connect you with Utah's top new construction lenders." icon={<CreditCard size={20} />} selected={value === 'No — I need help finding a lender'}       onClick={() => onChange('No — I need help finding a lender')} />
      <SelectCard label="Cash buyer"                              sub="No financing needed."                                   icon={<Star size={20} />}         selected={value === 'Cash buyer'}                              onClick={() => onChange('Cash buyer')} />
    </div>
  );
}

function StepContact({
  answers, onChange,
}: {
  answers: FormAnswers;
  onChange: (field: keyof FormAnswers, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">First Name</label>
          <input className="input-field" placeholder="Jane" value={answers.firstName}
            onChange={e => onChange('firstName', e.target.value)} />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input className="input-field" placeholder="Smith" value={answers.lastName}
            onChange={e => onChange('lastName', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Email Address</label>
        <input className="input-field" type="email" placeholder="jane@example.com" value={answers.email}
          onChange={e => onChange('email', e.target.value)} />
      </div>
      <div>
        <label className="label">Best Phone Number</label>
        <input className="input-field" type="tel" placeholder="(801) 555-0100" value={answers.phone}
          onChange={e => onChange('phone', e.target.value)} />
      </div>
      <div className="flex items-start gap-2 text-xs text-navy-400 bg-navy-50 rounded-lg p-3 mt-1">
        <Shield size={13} className="text-gold-500 mt-0.5 flex-shrink-0" />
        Your info is shared only with me — never sold or spammed. I'll reach out within 24 hours to walk through your matches.
      </div>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function ResultsScreen({ matches, answers }: { matches: Community[]; answers: FormAnswers }) {
  const name = answers.firstName ? `${answers.firstName}, y` : 'Y';
  return (
    <div className="max-w-xl mx-auto">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 size={30} className="text-green-600" />
        </div>
        <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
          Match Complete
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-3 leading-tight">
          {name}our top communities are ready.
        </h2>
        <p className="text-navy-500">
          Based on your {answers.budget} budget, {answers.areas.join(' & ') || 'open'} location, and your priorities — here are your best matches.
        </p>
      </div>

      {/* Matched communities */}
      <div className="space-y-3 mb-8">
        {matches.length > 0 ? matches.map((c, i) => (
          <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-sm"
              style={{ backgroundColor: c.photoColor }}
            >
              #{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy-900 text-base">{c.name}</div>
              <div className="flex items-center gap-1 text-sm text-navy-500 mt-0.5">
                <MapPin size={11} />
                {c.city} · <span className="font-semibold text-gold-600">{c.builderName}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
                  {fmt(c.priceMin)} – {fmt(c.priceMax)}
                </span>
                <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
                  {c.sqftMin.toLocaleString()}–{c.sqftMax.toLocaleString()} sq ft
                </span>
                {(c.availableLots ?? 0) > 0 && (
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                    {c.availableLots} lots available
                  </span>
                )}
                {c.incentives.some(inc => inc.active) && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                    Active incentives
                  </span>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-navy-50 rounded-2xl p-6 text-center">
            <Building2 size={28} className="mx-auto text-navy-300 mb-3" />
            <p className="text-navy-700 font-semibold">I have options beyond what's listed here.</p>
            <p className="text-navy-400 text-sm mt-1">I'll research your criteria and reach out with a personalized shortlist.</p>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-6">
        <div className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-4">
          What Happens Next
        </div>
        <div className="space-y-3.5">
          {[
            { n: '1', t: "I'll review your answers and pull current pricing + availability" },
            { n: '2', t: `I'll reach out to ${answers.phone || 'you'} within 24 hours — usually sooner` },
            { n: '3', t: "We'll schedule your free builder tours at your convenience" },
            { n: '4', t: "I'll represent you at every step — builders pay my commission, not you" },
          ].map(({ n, t }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </div>
              <span className="text-white/80 text-sm leading-snug">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3 bg-gold-50 border border-gold-100 rounded-xl p-4 mb-8">
        <div className="flex -space-x-1 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-gold-500 fill-gold-500" />
          ))}
        </div>
        <p className="text-sm text-navy-700 font-medium">
          "Saved us $22,000 in builder incentives and found us a community we didn't know existed."
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/communities?tab=spec" className="btn-primary flex-1 justify-center">
          Browse Spec Homes
          <ArrowRight size={16} />
        </Link>
        <Link href="/communities?tab=dirt" className="btn-navy flex-1 justify-center">
          Explore Floor Plans
        </Link>
      </div>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'budget',      title: 'What is your home budget?',            subtitle: 'Pick the range that fits your plan — includes lot, build, and all upgrades.' },
  { id: 'areas',       title: 'Where in Utah do you want to live?',   subtitle: 'Select all areas you are open to. You can always adjust.' },
  { id: 'priorities',  title: 'What matters most to you?',            subtitle: 'Select everything that applies — this helps me find your best match.' },
  { id: 'homeType',    title: 'Spec home or dirt build?',             subtitle: 'This helps us match your timeline to the right inventory.' },
  { id: 'timeline',    title: 'What is your buying timeline?',        subtitle: "No pressure either way — honest answers help me serve you better." },
  { id: 'preApproval', title: 'Where are you with financing?',        subtitle: "Not pre-approved yet? I can connect you with Utah's best new construction lenders." },
  { id: 'contact',     title: 'Last step — where should I send your matches?', subtitle: "I'll reach out within 24 hours with your personalized community guide." },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GetStartedPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>(INITIAL);
  const [matches, setMatches] = useState<Community[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const TOTAL = STEPS.length;
  const pct = step === 0 ? 0 : Math.round((step / TOTAL) * 100);
  const stepCfg = step >= 1 && step <= TOTAL ? STEPS[step - 1] : null;

  const setField = useCallback(
    (field: keyof FormAnswers, value: string | string[]) =>
      setAnswers(prev => ({ ...prev, [field]: value })),
    []
  );

  const canAdvance = () => {
    if (step === 0) return true;
    const id = STEPS[step - 1]?.id;
    if (id === 'budget')      return !!answers.budget;
    if (id === 'areas')       return answers.areas.length > 0;
    if (id === 'priorities')  return answers.priorities.length > 0;
    if (id === 'homeType')    return !!answers.homeType;
    if (id === 'timeline')    return !!answers.timeline;
    if (id === 'preApproval') return !!answers.preApproval;
    if (id === 'contact')     return !!(answers.firstName && answers.email && answers.phone);
    return false;
  };

  const handleNext = async () => {
    if (step < TOTAL) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Final submit
    setSubmitting(true);
    const matched = matchCommunities(answers);
    setMatches(matched);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          matchedCommunities: matched.map(m => `${m.name} (${m.city})`),
          source: 'BuildSmart Utah — Matchmaker',
        }),
      });
    } catch {
      // Silent fail — user still sees results
    }

    setSubmitting(false);
    setDone(true);
    setStep(TOTAL + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onGetRepresented={() => {}} />

      {/* Sticky progress bar */}
      {step >= 1 && step <= TOTAL && (
        <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
            <span className="text-xs font-bold text-navy-400 whitespace-nowrap">
              {step} of {TOTAL}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gold-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gold-600 whitespace-nowrap">{pct}%</span>
          </div>
        </div>
      )}

      <main className="max-w-xl mx-auto px-4 py-12 pb-24">

        {/* ── INTRO ── */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-navy-900 rounded-3xl flex items-center justify-center mx-auto mb-7 shadow-xl">
              <svg viewBox="0 0 40 38" fill="none" className="w-11 h-11">
                <rect x="24" y="1" width="4" height="9" rx="0.5" fill="white" />
                <path d="M2 21L20 3L38 21" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="13"   y="8"  width="5.5" height="5.5" rx="0.5" fill="#B8692B" />
                <rect x="21.5" y="8"  width="5.5" height="5.5" rx="0.5" fill="#B8692B" />
                <rect x="13"   y="15" width="5.5" height="5.5" rx="0.5" fill="#B8692B" />
                <rect x="21.5" y="15" width="5.5" height="5.5" rx="0.5" fill="#B8692B" />
              </svg>
            </div>

            <div className="inline-block bg-gold-50 text-gold-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Free · No Obligation · 2 Minutes
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mb-4 leading-tight">
              Utah New Construction<br />
              <span className="text-gold-500">Matchmaker</span>
            </h1>

            <p className="text-navy-500 text-lg leading-relaxed mb-8 max-w-md mx-auto">
              Answer 7 quick questions. I'll match you to your best Utah communities and send you a free personalized plan.
            </p>

            {/* Value props */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left mb-8 space-y-3.5">
              {[
                { icon: <Target size={16} className="text-gold-500" />,     text: 'Your top 3 communities matched to your budget + lifestyle' },
                { icon: <Zap size={16} className="text-gold-500" />,        text: 'Current builder incentives in your price range' },
                { icon: <Building2 size={16} className="text-gold-500" />,  text: 'Side-by-side builder comparison for your top matches' },
                { icon: <Shield size={16} className="text-gold-500" />,     text: 'Free buyer representation — builders pay my commission' },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{icon}</div>
                  <span className="text-sm text-navy-700 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="btn-primary w-full justify-center text-lg py-4 shadow-lg"
            >
              Find My Best Communities
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-navy-400 mt-4">
              I represent buyers only — never builders. Your information stays private.
            </p>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {step >= 1 && step <= TOTAL && stepCfg && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2 leading-tight">
              {stepCfg.title}
            </h2>
            <p className="text-navy-500 mb-7 leading-relaxed">{stepCfg.subtitle}</p>

            {stepCfg.id === 'budget'      && <StepBudget      value={answers.budget}       onChange={v => setField('budget', v)} />}
            {stepCfg.id === 'areas'       && <StepAreas       value={answers.areas}        onChange={v => setField('areas', v)} />}
            {stepCfg.id === 'priorities'  && <StepPriorities  value={answers.priorities}   onChange={v => setField('priorities', v)} />}
            {stepCfg.id === 'homeType'    && <StepHomeType    value={answers.homeType}     onChange={v => setField('homeType', v)} />}
            {stepCfg.id === 'timeline'    && <StepTimeline    value={answers.timeline}     onChange={v => setField('timeline', v)} />}
            {stepCfg.id === 'preApproval' && <StepPreApproval value={answers.preApproval} onChange={v => setField('preApproval', v)} />}
            {stepCfg.id === 'contact'     && <StepContact     answers={answers}            onChange={(f, v) => setField(f, v)} />}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="btn-ghost text-navy-600 flex items-center gap-2 px-5"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canAdvance() || submitting}
                className={`btn-primary flex-1 justify-center transition-opacity ${
                  !canAdvance() ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {submitting
                  ? 'Finding your matches...'
                  : step === TOTAL
                  ? 'See My Matches →'
                  : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step > TOTAL && done && (
          <ResultsScreen matches={matches} answers={answers} />
        )}
      </main>
    </div>
  );
}
