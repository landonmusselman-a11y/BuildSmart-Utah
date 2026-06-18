'use client'

import { useState, useMemo, useCallback } from 'react'
import { useFinanceData } from '@/lib/useFinanceData'
import FinanceShell from '@/components/finance/FinanceShell'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  TrendingDown, TrendingUp, DollarSign, ChevronDown, ChevronRight,
  AlertTriangle, RefreshCw, Loader2, ArrowDownLeft, Zap
} from 'lucide-react'

function fmt(n: number) {
  return Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const CAT_COLORS: Record<string, string> = {
  'Mortgage': '#ef4444', 'Food & Dining': '#f97316', 'Shopping': '#8b5cf6',
  'Housing': '#3b82f6', 'Utilities': '#06b6d4', 'Subscriptions': '#ec4899',
  'Transportation': '#eab308', 'Travel': '#6366f1', 'Health & Medical': '#22c55e',
  'Insurance': '#64748b', 'Airbnb': '#a855f7', 'Business': '#0ea5e9',
  'Kids & Family': '#f43f5e', 'Personal Care': '#fb7185', 'Income': '#10b981',
  'Transfer': '#94a3b8', 'Venmo': '#3d82c4', 'Taxes & Fees': '#dc2626', 'Other': '#6b7280',
}

// Keywords that confirm something is genuinely income
const REAL_INCOME_KEYWORDS = [
  'direct deposit', 'payroll', 'refund', 'cashback', 'cash back', 'reward',
  'interest earned', 'dividend', 'zelle from', 'commission', 'airbnb payout',
  'deposit from', 'tax refund', 'payment received',
]

// Keywords that are dead giveaways it's a withdrawal/expense
const WITHDRAWAL_KEYWORDS = [
  'withdrawal', 'atm', 'withdraw', 'transfer out', 'debit', 'purchase',
  'pos ', 'check #', 'check paid', 'bill pay', 'online payment',
]

function isLikelyWithdrawal(description: string): boolean {
  const lower = description.toLowerCase()
  if (REAL_INCOME_KEYWORDS.some(k => lower.includes(k))) return false
  return WITHDRAWAL_KEYWORDS.some(k => lower.includes(k))
}

export default function SpendingPage() {
  const { transactions, loading, refetch } = useFinanceData()
  const [fixingCats, setFixingCats] = useState(false)
  const [auditDupes, setAuditDupes] = useState<{ removeIds: string[]; date: string; description: string; amount: number; count: number }[] | null>(null)
  const [auditing, setAuditing] = useState(false)
  const [removingDupes, setRemovingDupes] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [selectedYear, setSelectedYear] = useState<string>('2026')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [showAllIncome, setShowAllIncome] = useState(false)
  const [flipping, setFlipping] = useState<Set<string>>(new Set())
  const [autoFixing, setAutoFixing] = useState(false)

  const INCOME_CATS = new Set(['Income', 'Transfer'])
  const YEARS = ['2025', '2026', '2027']

  // ── Years & months with data ────────────────────────────────────────────
  const yearsWithData = useMemo(() => {
    const s = new Set<string>()
    transactions.forEach(t => { if (t.date) s.add(t.date.slice(0, 4)) })
    return YEARS.filter(y => s.has(y) || y === new Date().getFullYear().toString())
  }, [transactions])

  const monthsInYear = useMemo(() => {
    const s = new Set<string>()
    transactions.forEach(t => { if (t.date?.startsWith(selectedYear)) s.add(t.date.slice(0, 7)) })
    return [...s].sort().reverse()
  }, [transactions, selectedYear])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date?.startsWith(selectedYear)) return false
      if (selectedMonth !== 'all' && !t.date.startsWith(selectedMonth)) return false
      return true
    })
  }, [transactions, selectedYear, selectedMonth])

  const expenses = filtered.filter(t => t.amount < 0 && !INCOME_CATS.has(t.category || ''))
  const income = filtered.filter(t => t.amount > 0 && !INCOME_CATS.has(t.category || ''))
  const transfers = filtered.filter(t => INCOME_CATS.has(t.category || ''))

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const net = totalIncome + totalExpenses

  // Flag suspicious "income" items
  const suspectIncome = income.filter(t => isLikelyWithdrawal(t.description || ''))

  // ── Flip a single transaction to expense ────────────────────────────────
  const flipOne = useCallback(async (id: string) => {
    setFlipping(prev => new Set([...prev, id]))
    await fetch('/api/finance/audit-signs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setFlipping(prev => { const n = new Set(prev); n.delete(id); return n })
    refetch()
  }, [refetch])

  // ── Auto-flip all obvious withdrawals ───────────────────────────────────
  const autoFlipWithdrawals = useCallback(async () => {
    const ids = suspectIncome.map(t => t.id)
    if (ids.length === 0) return
    setAutoFixing(true)
    await fetch('/api/finance/audit-signs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    setAutoFixing(false)
    refetch()
  }, [suspectIncome, refetch])

  // ── Category breakdown ──────────────────────────────────────────────────
  const catTotals = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(t => {
      const c = t.category || 'Other'
      map[c] = (map[c] || 0) + Math.abs(t.amount)
    })
    return Object.entries(map).map(([cat, total]) => ({ cat, total })).sort((a, b) => b.total - a.total)
  }, [expenses])

  // ── Monthly chart ────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {}
    transactions.filter(t => t.date?.startsWith(selectedYear)).forEach(t => {
      const mo = t.date?.slice(0, 7) || 'Unknown'
      if (!map[mo]) map[mo] = { income: 0, expenses: 0 }
      if (t.amount > 0 && !INCOME_CATS.has(t.category || '')) map[mo].income += t.amount
      if (t.amount < 0 && !INCOME_CATS.has(t.category || '')) map[mo].expenses += Math.abs(t.amount)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .map(([mo, d]) => ({
        mo: new Date(mo + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income: d.income,
        expenses: d.expenses,
      }))
  }, [transactions, selectedYear])

  // ── Actions ──────────────────────────────────────────────────────────────
  async function fixCategories() {
    setFixingCats(true)
    await fetch('/api/finance/audit', { method: 'POST' })
    setFixingCats(false)
    refetch()
  }

  async function runAudit() {
    setAuditing(true)
    const res = await fetch('/api/finance/audit')
    const json = await res.json()
    setAuditDupes(json.duplicates || [])
    setAuditing(false)
  }

  async function removeDupes() {
    setRemovingDupes(true)
    await fetch('/api/finance/audit', { method: 'DELETE' })
    setAuditDupes(null)
    setRemovingDupes(false)
    refetch()
  }

  function toggleCat(cat: string) {
    setExpandedCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n })
  }

  if (loading) return (
    <FinanceShell>
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>
    </FinanceShell>
  )

  return (
    <FinanceShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">Spending Summary</h1>
          <p className="text-white/30 text-sm">{filtered.length} transactions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fixCategories} disabled={fixingCats} className="text-sm bg-white/5 hover:bg-white/10 text-white/60 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50">
            {fixingCats ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Fix Categories
          </button>
          <button onClick={runAudit} disabled={auditing} className="text-sm bg-white/5 hover:bg-white/10 text-white/60 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50">
            {auditing ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />} Audit Dupes
          </button>
        </div>
      </div>

      {/* Year tabs + month filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
          {YEARS.map(y => {
            const hasData = yearsWithData.includes(y)
            return (
              <button
                key={y}
                onClick={() => { setSelectedYear(y); setSelectedMonth('all') }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors relative ${
                  selectedYear === y
                    ? 'bg-indigo-600 text-white'
                    : hasData
                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                    : 'text-white/20 hover:text-white/40 hover:bg-white/3'
                }`}
              >
                {y}
                {!hasData && <span className="ml-1 text-[9px] opacity-50">no data</span>}
              </button>
            )
          })}
        </div>
        {monthsInYear.length > 0 && (
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white/5 border border-white/8 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="all">All of {selectedYear}</option>
            {monthsInYear.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dupe audit */}
      {auditDupes !== null && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          {auditDupes.length === 0 ? (
            <p className="text-amber-300 text-sm font-medium">✓ No duplicate transactions found.</p>
          ) : (
            <>
              <p className="text-amber-300 font-semibold mb-3">{auditDupes.length} duplicate groups found</p>
              <div className="space-y-1 max-h-40 overflow-y-auto mb-3">
                {auditDupes.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">{d.count}×</span>
                    <span>{d.date}</span>
                    <span className="flex-1 truncate">{d.description}</span>
                    <span className="text-rose-400">{fmt(d.amount)}</span>
                  </div>
                ))}
              </div>
              <button onClick={removeDupes} disabled={removingDupes} className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                {removingDupes ? 'Removing...' : `Remove ${auditDupes.reduce((s, d) => s + d.count - 1, 0)} duplicates`}
              </button>
            </>
          )}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-20 text-white/20">
          <DollarSign size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No transactions yet</p>
          <p className="text-sm">Upload documents in the Inbox to get started</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <SummaryCard label="Total Income" amount={totalIncome} icon={<TrendingUp size={18} />} color="emerald" />
            <SummaryCard label="Total Expenses" amount={Math.abs(totalExpenses)} icon={<TrendingDown size={18} />} color="rose" />
            <SummaryCard label="Net" amount={net} icon={<DollarSign size={18} />} color={net >= 0 ? 'emerald' : 'rose'} />
          </div>

          {/* Monthly chart */}
          {monthlyData.length > 1 && (
            <div className="bg-[#16181f] rounded-2xl border border-white/5 p-6 mb-6">
              <h2 className="text-white font-semibold mb-5">Monthly Overview</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis dataKey="mo" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ background: '#1e2028', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, '']} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-white/40"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Income</div>
                <div className="flex items-center gap-1.5 text-xs text-white/40"><div className="w-3 h-3 rounded-sm bg-rose-500" /> Expenses</div>
              </div>
            </div>
          )}

          {/* ── INCOME SECTION ─────────────────────────────────────────── */}
          <div className="bg-[#16181f] rounded-2xl border border-white/5 p-6 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <h2 className="text-white font-semibold">Income</h2>
                <span className="text-emerald-400 font-bold text-sm">{fmt(totalIncome)}</span>
              </div>
              <span className="text-white/25 text-xs">{income.length} transactions</span>
            </div>

            {/* Auto-fix banner */}
            {suspectIncome.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
                <p className="text-rose-300 text-sm flex-1">
                  <span className="font-semibold">{suspectIncome.length} item{suspectIncome.length !== 1 ? 's' : ''}</span> look like withdrawals, not income
                </p>
                <button
                  onClick={autoFlipWithdrawals}
                  disabled={autoFixing}
                  className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {autoFixing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  Fix all {suspectIncome.length}
                </button>
              </div>
            )}

            <IncomeList
              txns={showAllIncome ? income : income.slice(0, 10)}
              flipping={flipping}
              onFlip={flipOne}
            />
            {income.length > 10 && (
              <button onClick={() => setShowAllIncome(p => !p)} className="text-xs text-white/25 hover:text-white/50 mt-3 transition-colors">
                {showAllIncome ? 'Show less' : `Show all ${income.length} transactions`}
              </button>
            )}
          </div>

          {/* ── EXPENSES BY CATEGORY ───────────────────────────────────── */}
          <div className="bg-[#16181f] rounded-2xl border border-white/5 p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-rose-400" />
                <h2 className="text-white font-semibold">Expenses by Category</h2>
                <span className="text-rose-400 font-bold text-sm">{fmt(Math.abs(totalExpenses))}</span>
              </div>
              <span className="text-white/25 text-xs">{expenses.length} transactions</span>
            </div>
            <div className="space-y-1">
              {catTotals.map(({ cat, total }) => {
                const catTxns = expenses.filter(t => (t.category || 'Other') === cat)
                const isOpen = expandedCats.has(cat)
                const pct = Math.abs(totalExpenses) > 0 ? (total / Math.abs(totalExpenses)) * 100 : 0
                const color = CAT_COLORS[cat] || '#6b7280'
                return (
                  <div key={cat}>
                    <button onClick={() => toggleCat(cat)}
                      className="w-full flex items-center gap-3 py-2.5 hover:bg-white/3 rounded-lg px-2 transition-colors group">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-white/70 text-sm font-medium text-left flex-1">{cat}</span>
                      <div className="hidden sm:block flex-1 max-w-[120px] bg-white/5 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-white/40 text-xs w-8 text-right">{pct.toFixed(0)}%</span>
                      <span className="text-white font-semibold text-sm w-20 text-right">{fmt(total)}</span>
                      <span className="text-white/20 ml-1 group-hover:text-white/40">
                        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ml-5 mb-2 space-y-1 max-h-60 overflow-y-auto">
                        {catTxns.slice(0, 50).map(t => (
                          <div key={t.id} className="flex items-center gap-3 px-2 py-1.5 text-xs border-l border-white/5 ml-2">
                            <span className="text-white/25 w-20 flex-shrink-0">{t.date}</span>
                            <span className="text-white/50 flex-1 truncate">{t.description}</span>
                            <span className="text-rose-400 font-medium">{fmt(Math.abs(t.amount))}</span>
                          </div>
                        ))}
                        {catTxns.length > 50 && <p className="text-white/20 text-xs px-4 py-1">+{catTxns.length - 50} more</p>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── TRANSFERS — expandable with per-row recategorize ── */}
          {transfers.length > 0 && (
            <TransfersSection transfers={transfers} onRefetch={refetch} />
          )}
        </>
      )}
    </FinanceShell>
  )
}

// ── Income list with per-row flip button ──────────────────────────────────────

function IncomeList({ txns, flipping, onFlip }: {
  txns: { id: string; date: string; description: string; amount: number }[]
  flipping: Set<string>
  onFlip: (id: string) => void
}) {
  if (txns.length === 0) return <p className="text-white/20 text-sm text-center py-4">None</p>
  return (
    <div className="space-y-0.5">
      {txns.map(t => {
        const suspicious = isLikelyWithdrawal(t.description || '')
        return (
          <div key={t.id} className={`flex items-center gap-3 text-sm py-2 px-2 rounded-lg group transition-colors ${suspicious ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-white/3'}`}>
            <span className="text-white/25 text-xs w-20 flex-shrink-0">{t.date}</span>
            <span className={`flex-1 truncate ${suspicious ? 'text-white/50' : 'text-white/60'}`}>{t.description}</span>
            {suspicious && (
              <span className="text-rose-400/60 text-[10px] hidden sm:block flex-shrink-0">withdrawal?</span>
            )}
            <span className="text-emerald-400 font-semibold text-sm w-20 text-right flex-shrink-0">
              {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </span>
            <button
              onClick={() => onFlip(t.id)}
              disabled={flipping.has(t.id)}
              title="Move to expenses"
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-400/40 px-2 py-1 rounded transition-all disabled:opacity-30 flex-shrink-0"
            >
              {flipping.has(t.id) ? <Loader2 size={10} className="animate-spin" /> : <ArrowDownLeft size={10} />}
              expense
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({ label, amount, icon, color }: { label: string; amount: number; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    rose: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || 'border-white/5 bg-white/3 text-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/40 text-sm font-medium">{label}</span>
        <span className={colorMap[color]?.split(' ')[2] || 'text-white/30'}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color === 'emerald' ? 'text-emerald-400' : color === 'rose' ? 'text-rose-400' : amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
        {amount < 0 ? '-' : ''}{fmt(amount)}
      </p>
    </div>
  )
}

// ── Transfers section — expandable, per-row recategorize ──────────────────────

const ALL_CATS = [
  'Food & Dining','Shopping','Mortgage','Housing','Utilities','Subscriptions',
  'Transportation','Travel','Health & Medical','Insurance','Airbnb','Business',
  'Kids & Family','Personal Care','Income','Transfer','Venmo','Taxes & Fees','Other',
]

// True inter-account transfers that really should stay excluded
const TRUE_TRANSFER_KEYWORDS = [
  'credit card payment', 'card payment', 'autopay', 'online payment to',
  'transfer to ', 'transfer from ', 'bank transfer', 'mobile transfer',
  'account transfer', 'savings transfer', 'payment to chase', 'chase card',
  'payment to amex', 'american express payment', 'citi payment',
  'discover payment', 'capital one payment', 'payment to credit',
  'online transfer', 'funds transfer', 'external transfer',
  'payment thank you', 'thank you payment', 'mobile payment',
]

function isTrueTransfer(description: string): boolean {
  const lower = description.toLowerCase()
  return TRUE_TRANSFER_KEYWORDS.some(k => lower.includes(k))
}

function TransfersSection({ transfers, onRefetch }: {
  transfers: { id: string; date: string; description: string; amount: number; category: string }[]
  onRefetch: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const trueTransfers = transfers.filter(t => isTrueTransfer(t.description || ''))
  const suspectTransfers = transfers.filter(t => !isTrueTransfer(t.description || ''))

  async function recategorize(id: string, category: string) {
    setSaving(id)
    await fetch('/api/finance/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, category }),
    })
    setSaving(null)
    onRefetch()
  }

  const visible = showAll ? transfers : transfers.slice(0, 20)

  return (
    <div className="bg-[#16181f] rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
      >
        <DollarSign size={15} className="text-white/25" />
        <span className="text-white/50 font-medium text-sm flex-1 text-left">
          Transfers & Payments
          <span className="text-white/25 font-normal ml-2">— {transfers.length} excluded from totals</span>
        </span>
        {suspectTransfers.length > 0 && (
          <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
            {suspectTransfers.length} may need recategorizing
          </span>
        )}
        {open ? <ChevronDown size={14} className="text-white/20" /> : <ChevronRight size={14} className="text-white/20" />}
      </button>

      {open && (
        <div className="border-t border-white/5">
          {suspectTransfers.length > 0 && (
            <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10">
              <p className="text-amber-400/80 text-xs font-medium">
                ⚠ {suspectTransfers.length} of these don&apos;t look like true transfers — they may be real expenses. Use the dropdown to recategorize.
              </p>
            </div>
          )}
          <div className="divide-y divide-white/3 max-h-[500px] overflow-y-auto">
            {visible.map(t => {
              const suspect = !isTrueTransfer(t.description || '')
              return (
                <div key={t.id} className={`flex items-center gap-3 px-5 py-3 ${suspect ? 'bg-amber-500/3' : ''}`}>
                  <span className="text-white/20 text-xs w-20 flex-shrink-0">{t.date}</span>
                  <span className={`flex-1 truncate text-sm ${suspect ? 'text-white/60' : 'text-white/30'}`}>
                    {t.description}
                  </span>
                  <span className={`text-xs font-semibold w-16 text-right flex-shrink-0 ${t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {t.amount < 0 ? '-' : '+'}{fmt(Math.abs(t.amount))}
                  </span>
                  <div className="flex-shrink-0 w-36">
                    {saving === t.id ? (
                      <div className="flex items-center justify-end"><Loader2 size={12} className="animate-spin text-white/30" /></div>
                    ) : (
                      <select
                        defaultValue={t.category}
                        onChange={e => recategorize(t.id, e.target.value)}
                        className={`w-full bg-transparent text-xs focus:outline-none cursor-pointer rounded px-1 py-0.5 border transition-colors ${
                          suspect
                            ? 'border-amber-500/20 text-amber-400 hover:border-amber-400/40'
                            : 'border-white/5 text-white/25 hover:border-white/15'
                        }`}
                      >
                        {ALL_CATS.map(c => (
                          <option key={c} value={c} style={{ background: '#1e2028', color: '#fff' }}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {transfers.length > 20 && (
            <div className="px-5 py-3 border-t border-white/5">
              <button onClick={() => setShowAll(s => !s)} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                {showAll ? 'Show less' : `Show all ${transfers.length} transactions`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
