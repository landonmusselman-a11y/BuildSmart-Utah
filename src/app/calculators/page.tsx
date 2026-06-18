'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Home,
  AlertTriangle,
  CheckCircle,
  Info,
  Phone,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

type Tab = 'payment' | 'buydown' | 'hidden';
type LoanTerm = 30 | 15;

interface PaymentInputs {
  homePrice: number;
  downPct: number;
  interestRate: number;
  loanTerm: LoanTerm;
  annualTaxRate: number;
  monthlyHOA: number;
  annualInsurance: number;
}

interface PaymentResults {
  loanAmount: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
}

interface BuydownInputs {
  homePrice: number;
  downPct: number;
  baseRate: number;
  loanTerm: LoanTerm;
  builderCredit: number;
}

interface ScenarioResult {
  label: string;
  year1Monthly: number;
  year2Monthly: number;
  year3Monthly: number;
  totalInterest: number;
  bestIf: string;
  badge?: string;
}

interface HiddenCostItem {
  category: string;
  item: string;
  low: number;
  high: number;
  note?: string;
  creditBack?: boolean;
}

/* ─── Math helpers ───────────────────────────────────────────────────── */

function calcMonthlyPI(loanAmount: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return loanAmount / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcPaymentResults(inputs: PaymentInputs): PaymentResults {
  const loanAmount = inputs.homePrice * (1 - inputs.downPct / 100);
  const monthlyPI = calcMonthlyPI(loanAmount, inputs.interestRate, inputs.loanTerm);
  const monthlyTax = (inputs.homePrice * (inputs.annualTaxRate / 100)) / 12;
  const monthlyInsurance = inputs.annualInsurance / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + inputs.monthlyHOA;
  const n = inputs.loanTerm * 12;
  const totalInterest = monthlyPI * n - loanAmount;
  const totalCost = inputs.homePrice + totalInterest;
  return { loanAmount, monthlyPI, monthlyTax, monthlyInsurance, totalMonthly, totalInterest, totalCost };
}

function calcBuydownScenarios(inputs: BuydownInputs): ScenarioResult[] {
  const loanAmount = inputs.homePrice * (1 - inputs.downPct / 100);
  const n = inputs.loanTerm * 12;

  // Scenario A — No Buydown
  const aMonthly = calcMonthlyPI(loanAmount, inputs.baseRate, inputs.loanTerm);
  const aTotalInterest = aMonthly * n - loanAmount;

  // Scenario B — 2-1 Buydown
  const bRate1 = Math.max(0, inputs.baseRate - 2);
  const bRate2 = Math.max(0, inputs.baseRate - 1);
  const bMonth1 = calcMonthlyPI(loanAmount, bRate1, inputs.loanTerm);
  const bMonth2 = calcMonthlyPI(loanAmount, bRate2, inputs.loanTerm);
  const bMonth3 = aMonthly;
  // Total interest: 12 months at rate1 + 12 months at rate2 + remaining at base
  const bInterestYear1 = bMonth1 * 12 - (loanAmount - loanAmount * (1 - Math.pow(1 + bRate1 / 100 / 12, -12 * inputs.loanTerm)) / (1 - Math.pow(1 + bRate1 / 100 / 12, -n)));
  // Simplified: approximate total interest over full term (year1/2 PI, rest base)
  const bTotalInterest = bMonth1 * 12 + bMonth2 * 12 + bMonth3 * (n - 24) - loanAmount;

  // Scenario C — Permanent Buydown
  const pointCost = loanAmount * 0.01;
  const pointsCount = Math.floor(inputs.builderCredit / pointCost);
  const cRate = Math.max(0, inputs.baseRate - pointsCount * 0.25);
  const cMonthly = calcMonthlyPI(loanAmount, cRate, inputs.loanTerm);
  const cTotalInterest = cMonthly * n - loanAmount;
  const monthlySavingsC = aMonthly - cMonthly;
  const breakEvenMonths = monthlySavingsC > 0 ? Math.ceil(inputs.builderCredit / monthlySavingsC) : 0;

  // Determine best long-term value (lowest total interest)
  const totals = [aTotalInterest, bTotalInterest, cTotalInterest];
  const minTotal = Math.min(...totals);
  const bestIdx = totals.indexOf(minTotal);

  const scenarios: ScenarioResult[] = [
    {
      label: 'No Buydown',
      year1Monthly: aMonthly,
      year2Monthly: aMonthly,
      year3Monthly: aMonthly,
      totalInterest: aTotalInterest,
      bestIf: 'Best if you plan to refinance soon or want cash flexibility',
      badge: bestIdx === 0 ? 'Best Value Long-Term' : undefined,
    },
    {
      label: '2-1 Buydown',
      year1Monthly: bMonth1,
      year2Monthly: bMonth2,
      year3Monthly: bMonth3,
      totalInterest: bTotalInterest,
      bestIf: 'Best if you expect rates to drop in 2–3 years',
      badge: bestIdx === 1 ? 'Best Value Long-Term' : undefined,
    },
    {
      label: `Permanent Buydown (${pointsCount} pt${pointsCount !== 1 ? 's' : ''})`,
      year1Monthly: cMonthly,
      year2Monthly: cMonthly,
      year3Monthly: cMonthly,
      totalInterest: cTotalInterest,
      bestIf: `Best if you plan to stay long-term (5+ years) — break-even in ${breakEvenMonths} months`,
      badge: bestIdx === 2 ? 'Best Value Long-Term' : undefined,
    },
  ];
  // suppress unused warning
  void bInterestYear1;
  return scenarios;
}

/* ─── Formatting helpers ─────────────────────────────────────────────── */

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDollar(n: number, decimals = 0): string {
  return '$' + fmt(n, decimals);
}

function fmtDollarRange(lo: number, hi: number): string {
  return `${fmtDollar(lo)} – ${fmtDollar(hi)}`;
}

/* ─── Hidden costs builder ───────────────────────────────────────────── */

function buildHiddenCosts(homePrice: number): HiddenCostItem[] {
  return [
    // At Closing
    { category: 'At Closing (one-time)', item: 'Title insurance & closing costs', low: homePrice * 0.01, high: homePrice * 0.015 },
    { category: 'At Closing (one-time)', item: 'Lender origination / fees', low: 2000, high: 5000 },
    { category: 'At Closing (one-time)', item: 'Home inspection (independent)', low: 400, high: 700 },
    { category: 'At Closing (one-time)', item: 'Earnest money (credited back at close)', low: homePrice * 0.01, high: homePrice * 0.02, creditBack: true },

    // Move-In
    { category: 'Immediate Move-In (first 30 days)', item: 'Window treatments (blinds/curtains)', low: 1500, high: 4000 },
    { category: 'Immediate Move-In (first 30 days)', item: 'Refrigerator (if not included)', low: 800, high: 2500 },
    { category: 'Immediate Move-In (first 30 days)', item: 'Washer & dryer', low: 800, high: 2000 },
    { category: 'Immediate Move-In (first 30 days)', item: 'Front yard landscaping (if not included)', low: homePrice * 0.005, high: homePrice * 0.01 },
    { category: 'Immediate Move-In (first 30 days)', item: 'Back yard landscaping (DIY vs. pro)', low: 3000, high: 15000 },

    // Design Center
    { category: 'Design Center Upgrades (dirt build)', item: 'Flooring, cabinets, fixtures & finishes above standard', low: homePrice * 0.05, high: homePrice * 0.10, note: 'Highly variable — budget this range' },

    // First Year
    { category: 'First Year', item: 'HOA fees (if applicable)', low: 0, high: 3600 },
    { category: 'First Year', item: 'Property taxes', low: homePrice * 0.006, high: homePrice * 0.007 },
    { category: 'First Year', item: "Homeowner's insurance", low: 900, high: 1800 },
    { category: 'First Year', item: 'Utilities setup (connections & deposits)', low: 300, high: 800 },
  ];
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

/* Number input with label */
function NumInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-navy-500 font-medium pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          className={`input-field ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && (
          <span className="absolute right-3 text-navy-500 font-medium pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* Toggle button group */
function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              value === opt.value
                ? 'bg-navy-900 text-white border-navy-900'
                : 'bg-white text-navy-700 border-gray-300 hover:border-navy-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Result row */
function ResultRow({
  label,
  value,
  bold,
  highlight,
  small,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 px-4 rounded-lg ${
        highlight ? 'bg-gold-50 border border-gold-200' : 'border-b border-gray-100'
      } ${small ? 'text-sm' : ''}`}
    >
      <span className={`text-navy-700 ${bold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`${bold ? 'font-extrabold text-navy-900 text-lg' : 'font-semibold text-navy-800'} ${highlight ? 'text-gold-700' : ''}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── Calculator 1: Monthly Payment ─────────────────────────────────── */

const DOWN_PCT_PRESETS = [
  { value: 3.5, label: '3.5% FHA' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
];

function PaymentCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPct, setDownPct] = useState<number>(10);
  const [customDown, setCustomDown] = useState<string>('');
  const [interestRate, setInterestRate] = useState<number>(6.75);
  const [loanTerm, setLoanTerm] = useState<LoanTerm>(30);
  const [annualTaxRate, setAnnualTaxRate] = useState<number>(0.65);
  const [monthlyHOA, setMonthlyHOA] = useState<number>(0);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1200);

  const activeDown = customDown !== '' ? parseFloat(customDown) || 0 : downPct;

  const results = useMemo<PaymentResults>(
    () =>
      calcPaymentResults({
        homePrice,
        downPct: activeDown,
        interestRate,
        loanTerm,
        annualTaxRate,
        monthlyHOA,
        annualInsurance,
      }),
    [homePrice, activeDown, interestRate, loanTerm, annualTaxRate, monthlyHOA, annualInsurance]
  );

  const handlePresetDown = useCallback((v: number) => {
    setDownPct(v);
    setCustomDown('');
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-5">
        <NumInput
          label="Home Price"
          value={homePrice}
          onChange={setHomePrice}
          min={50000}
          max={5000000}
          step={1000}
          prefix="$"
        />

        <div>
          <span className="label">Down Payment</span>
          <div className="flex gap-2 flex-wrap mb-2">
            {DOWN_PCT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handlePresetDown(p.value)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  customDown === '' && downPct === p.value
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-navy-700 border-gray-300 hover:border-navy-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input-field w-28"
              placeholder="Custom %"
              value={customDown}
              min={0}
              max={100}
              step={0.5}
              onChange={(e) => {
                setCustomDown(e.target.value);
              }}
            />
            <span className="text-navy-600 font-medium">
              = {fmtDollar(homePrice * (activeDown / 100))} down
            </span>
          </div>
        </div>

        <NumInput
          label="Interest Rate"
          value={interestRate}
          onChange={setInterestRate}
          min={1}
          max={20}
          step={0.125}
          suffix="%"
        />

        <ToggleGroup<LoanTerm>
          label="Loan Term"
          options={[
            { value: 30, label: '30 Year' },
            { value: 15, label: '15 Year' },
          ]}
          value={loanTerm}
          onChange={setLoanTerm}
        />

        <div className="grid grid-cols-2 gap-4">
          <NumInput
            label="Annual Property Tax Rate"
            value={annualTaxRate}
            onChange={setAnnualTaxRate}
            min={0}
            max={5}
            step={0.01}
            suffix="%"
          />
          <NumInput
            label="Monthly HOA"
            value={monthlyHOA}
            onChange={setMonthlyHOA}
            min={0}
            step={10}
            prefix="$"
          />
        </div>

        <NumInput
          label="Annual Homeowner's Insurance"
          value={annualInsurance}
          onChange={setAnnualInsurance}
          min={0}
          step={50}
          prefix="$"
        />
      </div>

      {/* Results */}
      <div>
        {/* Big display */}
        <div className="bg-navy-900 rounded-2xl p-6 text-white text-center mb-6">
          <p className="text-navy-300 text-sm mb-1">Estimated Monthly Payment</p>
          <p className="text-5xl font-extrabold text-gold-400 mb-1">
            {fmtDollar(results.totalMonthly)}
          </p>
          <p className="text-navy-400 text-xs">Principal, interest, tax, insurance &amp; HOA</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-1 mb-6">
          <ResultRow label="Principal &amp; Interest" value={fmtDollar(results.monthlyPI)} />
          <ResultRow label="Property Tax (monthly)" value={fmtDollar(results.monthlyTax)} />
          <ResultRow label="Homeowner's Insurance (monthly)" value={fmtDollar(results.monthlyInsurance)} />
          {monthlyHOA > 0 && (
            <ResultRow label="HOA" value={fmtDollar(monthlyHOA)} />
          )}
          <ResultRow label="Total Monthly Payment" value={fmtDollar(results.totalMonthly)} bold highlight />
        </div>

        {/* Loan summary */}
        <div className="bg-navy-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Loan Amount', value: fmtDollar(results.loanAmount) },
            { label: 'Total Interest', value: fmtDollar(results.totalInterest) },
            { label: 'Total Cost of Home', value: fmtDollar(results.totalCost) },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xs text-navy-500 font-medium mb-1">{s.label}</div>
              <div className="font-bold text-navy-900 text-sm">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Calculator 2: Rate Buydown ─────────────────────────────────────── */

function BuydownCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPct, setDownPct] = useState<number>(10);
  const [baseRate, setBaseRate] = useState<number>(6.75);
  const [loanTerm, setLoanTerm] = useState<LoanTerm>(30);
  const [builderCredit, setBuilderCredit] = useState<number>(15000);

  const scenarios = useMemo<ScenarioResult[]>(
    () => calcBuydownScenarios({ homePrice, downPct, baseRate, loanTerm, builderCredit }),
    [homePrice, downPct, baseRate, loanTerm, builderCredit]
  );

  const loanAmount = homePrice * (1 - downPct / 100);

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} min={50000} max={5000000} step={1000} prefix="$" />
        <NumInput label="Down Payment %" value={downPct} onChange={setDownPct} min={0} max={100} step={0.5} suffix="%" />
        <NumInput label="Base Interest Rate (note rate)" value={baseRate} onChange={setBaseRate} min={1} max={20} step={0.125} suffix="%" />
        <div>
          <ToggleGroup<LoanTerm>
            label="Loan Term"
            options={[
              { value: 30, label: '30 Year' },
              { value: 15, label: '15 Year' },
            ]}
            value={loanTerm}
            onChange={setLoanTerm}
          />
        </div>
        <NumInput label="Builder Credit / Incentive" value={builderCredit} onChange={setBuilderCredit} min={0} max={100000} step={500} prefix="$" />
        <div className="flex items-end">
          <div className="bg-navy-50 rounded-xl px-4 py-3 w-full text-sm">
            <span className="text-navy-500 block text-xs mb-1">Loan Amount</span>
            <span className="font-bold text-navy-900">{fmtDollar(loanAmount)}</span>
          </div>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {scenarios.map((s, i) => (
          <div
            key={i}
            className={`relative card p-5 flex flex-col ${s.badge ? 'border-2 border-gold-400' : ''}`}
          >
            {s.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {s.badge}
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 pt-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                i === 0 ? 'bg-blue-100 text-blue-700' : i === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gold-100 text-gold-700'
              }`}>
                {i === 0 ? <DollarSign size={16} /> : i === 1 ? <TrendingDown size={16} /> : <Calculator size={16} />}
              </div>
              <h3 className="font-bold text-navy-900 text-base">{s.label}</h3>
            </div>

            <div className="space-y-2 flex-1">
              <div className="grid grid-cols-3 text-xs text-navy-500 font-semibold uppercase tracking-wide pb-1 border-b border-gray-100">
                <span>Year 1</span>
                <span>Year 2</span>
                <span>Year 3+</span>
              </div>
              <div className="grid grid-cols-3 text-sm">
                <span className="font-bold text-navy-900">{fmtDollar(s.year1Monthly)}</span>
                <span className="font-bold text-navy-900">{fmtDollar(s.year2Monthly)}</span>
                <span className="font-bold text-navy-900">{fmtDollar(s.year3Monthly)}</span>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-600">Total interest ({loanTerm} yr)</span>
                  <span className="font-semibold text-navy-900">{fmtDollar(s.totalInterest)}</span>
                </div>
                {i === 1 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-navy-600">Yr 1 savings vs. no buydown</span>
                    <span className="font-semibold text-green-600">
                      {fmtDollar((scenarios[0].year1Monthly - s.year1Monthly) * 12)}/yr
                    </span>
                  </div>
                )}
                {i === 2 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-navy-600">Monthly savings</span>
                    <span className="font-semibold text-green-600">
                      {fmtDollar(scenarios[0].year3Monthly - s.year3Monthly)}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 bg-navy-50 rounded-lg px-3 py-2.5">
              <div className="flex gap-1.5">
                <Info size={14} className="text-navy-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-navy-600">{s.bestIf}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle size={18} className="text-gold-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-navy-700">
          These are estimates using a simplified model. Actual 2-1 buydown costs vary by lender. A permanent rate
          reduction of 0.25% per point is an approximation — your lender's pricing sheet may differ. We'll help you
          compare the real numbers once you have a loan estimate in hand.
        </p>
      </div>
    </div>
  );
}

/* ─── Calculator 3: Hidden Costs ─────────────────────────────────────── */

const CATEGORIES = [
  'At Closing (one-time)',
  'Immediate Move-In (first 30 days)',
  'Design Center Upgrades (dirt build)',
  'First Year',
];

const CATEGORY_COLORS: Record<string, string> = {
  'At Closing (one-time)': 'bg-blue-100 text-blue-800',
  'Immediate Move-In (first 30 days)': 'bg-orange-100 text-orange-800',
  'Design Center Upgrades (dirt build)': 'bg-purple-100 text-purple-800',
  'First Year': 'bg-teal-100 text-teal-800',
};

function HiddenCostsCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);

  const items = useMemo(() => buildHiddenCosts(homePrice), [homePrice]);

  // Totals (exclude creditBack items)
  const totalLow = useMemo(
    () => items.filter((i) => !i.creditBack).reduce((sum, i) => sum + i.low, 0),
    [items]
  );
  const totalHigh = useMemo(
    () => items.filter((i) => !i.creditBack).reduce((sum, i) => sum + i.high, 0),
    [items]
  );

  return (
    <div className="space-y-8">
      {/* Slider */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="label mb-0">Home Price</label>
          <span className="text-2xl font-extrabold text-navy-900">{fmtDollar(homePrice)}</span>
        </div>
        <input
          type="range"
          min={300000}
          max={1000000}
          step={10000}
          value={homePrice}
          onChange={(e) => setHomePrice(Number(e.target.value))}
          className="w-full h-2 bg-navy-100 rounded-full appearance-none cursor-pointer accent-gold-500"
        />
        <div className="flex justify-between text-xs text-navy-400 mt-1">
          <span>$300K</span>
          <span>$1M</span>
        </div>
      </div>

      {/* Gold callout */}
      <div className="bg-gold-50 border-l-4 border-gold-500 rounded-r-xl p-4 flex gap-3">
        <AlertTriangle size={20} className="text-gold-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-navy-800 font-medium">
          This is why we help buyers budget the full picture — not just the purchase price.{' '}
          <span className="text-navy-900 font-bold">
            Most buyers underestimate move-in costs by $15,000–$40,000.
          </span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900 text-white">
              <th className="text-left px-4 py-3 font-semibold w-1/2">Item</th>
              <th className="text-right px-4 py-3 font-semibold">Low Estimate</th>
              <th className="text-right px-4 py-3 font-semibold">High Estimate</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              return (
                <>
                  <tr key={`cat-${cat}`}>
                    <td
                      colSpan={3}
                      className="px-4 py-2 bg-gray-50 border-t border-b border-gray-200"
                    >
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700'}`}>
                        {cat}
                      </span>
                    </td>
                  </tr>
                  {catItems.map((item, idx) => (
                    <tr
                      key={`${cat}-${idx}`}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-navy-800">
                        <div className="flex items-start gap-2">
                          <span>{item.item}</span>
                          {item.creditBack && (
                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                              credited back
                            </span>
                          )}
                          {item.note && (
                            <span className="text-xs text-navy-400 italic">{item.note}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-700">
                        {fmtDollar(item.low)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-700">
                        {fmtDollar(item.high)}
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gold-50 border-t-2 border-gold-300">
              <td className="px-4 py-4 font-extrabold text-navy-900">
                Total Additional Budget Needed
                <span className="block text-xs font-normal text-navy-500">(excluding earnest money — credited back at closing)</span>
              </td>
              <td className="px-4 py-4 text-right font-extrabold text-gold-700 text-base">
                {fmtDollar(totalLow)}
              </td>
              <td className="px-4 py-4 text-right font-extrabold text-gold-700 text-base">
                {fmtDollar(totalHigh)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-start gap-3 bg-navy-50 rounded-xl p-4">
        <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-navy-700">
          <strong>Note:</strong> Design center upgrade costs apply primarily to dirt builds. Spec homes
          already have finishes selected — upgrades are limited or fixed. Landscaping requirements vary
          by community HOA rules and builder inclusions.
        </p>
      </div>
    </div>
  );
}

/* ─── Tab navigation ─────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'payment', label: 'Monthly Payment', icon: Calculator },
  { id: 'buydown', label: 'Rate Buydown Comparison', icon: TrendingDown },
  { id: 'hidden', label: 'Hidden Costs', icon: Home },
];

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('payment');
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 555-0100';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="utah-hero-bg text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Calculator size={14} className="text-gold-400" />
            Free Utah New Construction Tools
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Utah New Construction{' '}
            <span className="text-gold-400">Calculators</span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Run the real numbers before you sign anything.
          </p>
        </div>
      </section>

      {/* Tab navigation + content */}
      <section className="flex-1 bg-gray-50 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-300 hover:bg-navy-50'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active calculator card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-6 pb-5 border-b border-gray-100">
              {activeTab === 'payment' && (
                <>
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <Calculator size={20} className="text-gold-500" />
                    Monthly Payment Estimator
                  </h2>
                  <p className="text-navy-500 text-sm mt-1">
                    Includes principal, interest, taxes, insurance, and HOA.
                  </p>
                </>
              )}
              {activeTab === 'buydown' && (
                <>
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <TrendingDown size={20} className="text-gold-500" />
                    Rate Buydown Comparison
                  </h2>
                  <p className="text-navy-500 text-sm mt-1">
                    Compare how to best use a builder credit — no buydown, 2-1 buydown, or permanent points.
                  </p>
                </>
              )}
              {activeTab === 'hidden' && (
                <>
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <Home size={20} className="text-gold-500" />
                    Hidden Costs of New Construction
                  </h2>
                  <p className="text-navy-500 text-sm mt-1">
                    Budget for what the purchase price doesn't include.
                  </p>
                </>
              )}
            </div>

            {activeTab === 'payment' && <PaymentCalculator />}
            {activeTab === 'buydown' && <BuydownCalculator />}
            {activeTab === 'hidden' && <HiddenCostsCalculator />}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy-900 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <DollarSign size={32} className="text-gold-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Questions about your numbers?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            We'll walk through them with you — no pressure, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
            >
              Schedule Free Consultation
            </Link>
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-all text-base"
            >
              <Phone size={18} />
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
