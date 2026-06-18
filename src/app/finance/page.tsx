'use client'

import { useFinanceData } from '@/lib/useFinanceData'
import FinanceShell from '@/components/finance/FinanceShell'
import Link from 'next/link'
import { useMemo } from 'react'
import {
  TrendingDown, TrendingUp, DollarSign, Home, CreditCard,
  TrendingUp as InvIcon, RefreshCw, ChevronRight, Inbox,
  Loader2, AlertCircle, Repeat
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

function fmt(n: number, decimals = 0) {
  return Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: decimals })
}

function fmtShort(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}k`
  return `$${abs.toFixed(0)}`
}

const CAT_COLORS: Record<string, string> = {
  'Mortgage': '#ef4444', 'Food & Dining': '#f97316', 'Shopping': '#8b5cf6',
  'Housing': '#3b82f6', 'Utilities': '#06b6d4', 'Subscriptions': '#ec4899',
  'Transportation': '#eab308', 'Travel': '#6366f1', 'Health & Medical': '#22c55e',
  'Insurance': '#64748b', 'Airbnb': '#a855f7', 'Business': '#0ea5e9',
  'Venmo': '#3d82c4', 'Other': '#6b7280',
}

export default function Dashboard() {
  const { accounts, transactions, investmentAccounts, airbnbEntries, loading } = useFinanceData()

  // ── This month ────────────────────────────────────────────────────────────
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()

  const INCOME_CATS = new Set(['Income', 'Transfer'])

  const thisMonthTxns = transactions.filter(t => t.date?.startsWith(thisMonth))
  const lastMonthTxns = transactions.filter(t => t.date?.startsWith(lastMonth))

  const calcFlow = (txns: typeof transactions) => {
    const income = txns.filter(t => t.amount > 0 && !INCOME_CATS.has(t.category || '')).reduce((s, t) => s + t.amount, 0)
    const expenses = txns.filter(t => t.amount < 0 && !INCOME_CATS.has(t.category || '')).reduce((s, t) => s + t.amount, 0)
    return { income, expenses, net: income + expenses }
  }

  const thisFlow = calcFlow(thisMonthTxns)
  const lastFlow = calcFlow(lastMonthTxns)

  // ── Net worth ─────────────────────────────────────────────────────────────
  const cashTotal = accounts.reduce((s, a) => s + (a.balance || 0), 0)
  const investTotal = investmentAccounts.reduce((s, a) => s + (a.totalValue || 0), 0)
  const netWorth = cashTotal + investTotal

  // ── Subscriptions & recurring ─────────────────────────────────────────────
  const subscriptions = useMemo(() => {
    const sub = transactions.filter(t =>
      t.category === 'Subscriptions' || t.category === 'Utilities'
    )
    const byMerchant = new Map<string, { name: string; amount: number; category: string; count: number }>()
    sub.forEach(t => {
      const key = t.description?.toLowerCase() || ''
      if (!byMerchant.has(key)) byMerchant.set(key, { name: t.description || '', amount: t.amount, category: t.category || '', count: 0 })
      byMerchant.get(key)!.count++
    })
    return [...byMerchant.values()]
      .filter(m => m.count >= 1)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 12)
  }, [transactions])

  const monthlySubTotal = subscriptions.reduce((s, m) => s + Math.abs(m.amount), 0)

  // ── Monthly chart ─────────────────────────────────────────────────────────
  const monthlyChart = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {}
    transactions.forEach(t => {
      const mo = t.date?.slice(0, 7) || ''
      if (!mo) return
      if (!map[mo]) map[mo] = { income: 0, expenses: 0 }
      if (t.amount > 0 && !INCOME_CATS.has(t.category || '')) map[mo].income += t.amount
      if (t.amount < 0 && !INCOME_CATS.has(t.category || '')) map[mo].expenses += Math.abs(t.amount)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-8)
      .map(([mo, d]) => ({ mo: mo.slice(5), ...d }))
  }, [transactions])

  // ── Top categories this month ─────────────────────────────────────────────
  const topCats = useMemo(() => {
    const map: Record<string, number> = {}
    thisMonthTxns.filter(t => t.amount < 0 && !INCOME_CATS.has(t.category || '')).forEach(t => {
      const c = t.category || 'Other'
      map[c] = (map[c] || 0) + Math.abs(t.amount)
    })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 6)
  }, [thisMonthTxns])

  // ── Airbnb this month ─────────────────────────────────────────────────────
  const airbnbThisMonth = airbnbEntries.filter(e => e.date?.startsWith(thisMonth))
  const airbnbIncome = airbnbThisMonth.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const airbnbExpenses = airbnbThisMonth.filter(e => e.type === 'expense').reduce((s, e) => s + Math.abs(e.amount), 0)

  // ── Uncategorized ─────────────────────────────────────────────────────────
  const uncategorized = transactions.filter(t => !t.category || t.category === 'Other').length

  if (loading) return (
    <FinanceShell>
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>
    </FinanceShell>
  )

  const hasData = transactions.length > 0

  return (
    <FinanceShell>
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/30 text-sm uppercase tracking-widest font-semibold mb-1">Big Picture</p>
        <h1 className="text-3xl font-bold text-white">
          {netWorth > 0 ? fmt(netWorth) : 'Rose Family Finances'}
        </h1>
        {netWorth > 0 && <p className="text-white/30 text-sm mt-1">Total net worth · cash + investments</p>}
      </div>

      {!hasData ? (
        /* ── Empty state ── */
        <div className="bg-[#16181f] rounded-2xl border border-white/5 p-10 text-center">
          <Inbox size={36} className="text-white/15 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-1">No data yet</p>
          <p className="text-white/30 text-sm mb-6">Upload your bank statements, credit cards, and documents to see your full financial picture</p>
          <Link href="/finance/inbox" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <Inbox size={15} /> Go to Inbox
          </Link>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Uncategorized alert ── */}
          {uncategorized > 0 && (
            <Link href="/finance/merchants" className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3.5 hover:bg-amber-500/15 transition-colors group">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm font-medium flex-1">
                {uncategorized} transaction{uncategorized !== 1 ? 's' : ''} need a category
              </p>
              <span className="text-amber-400/60 text-xs group-hover:text-amber-400 transition-colors flex items-center gap-1">Assign now <ChevronRight size={12} /></span>
            </Link>
          )}

          {/* ── This month summary ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BigCard label="Income" value={thisFlow.income} color="emerald" icon={<TrendingUp size={16} />} prev={lastFlow.income} />
            <BigCard label="Expenses" value={Math.abs(thisFlow.expenses)} color="rose" icon={<TrendingDown size={16} />} prev={Math.abs(lastFlow.expenses)} invert />
            <BigCard label="Net" value={thisFlow.net} color={thisFlow.net >= 0 ? 'emerald' : 'rose'} icon={<DollarSign size={16} />} />
            <BigCard label="Investments" value={investTotal} color="indigo" icon={<InvIcon size={16} />} sub={cashTotal > 0 ? `+ ${fmtShort(cashTotal)} cash` : undefined} />
          </div>

          {/* ── Monthly chart + top categories ── */}
          <div className="grid md:grid-cols-2 gap-5">
            {monthlyChart.length > 1 && (
              <div className="bg-[#16181f] rounded-2xl border border-white/5 p-5">
                <p className="text-white font-semibold mb-4 text-sm">Monthly Cash Flow</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyChart} barGap={3}>
                    <XAxis dataKey="mo" tick={{ fill: '#ffffff30', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff30', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
                    <Tooltip contentStyle={{ background: '#1e2028', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']} />
                    <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topCats.length > 0 && (
              <div className="bg-[#16181f] rounded-2xl border border-white/5 p-5">
                <p className="text-white font-semibold mb-4 text-sm">This Month — Top Spending</p>
                <div className="space-y-2.5">
                  {topCats.map(([cat, amt]) => {
                    const max = topCats[0][1]
                    const pct = (amt / max) * 100
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[cat] || '#6b7280' }} />
                        <span className="text-white/60 text-xs w-28 truncate">{cat}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: CAT_COLORS[cat] || '#6b7280' }} />
                        </div>
                        <span className="text-white text-xs font-semibold w-14 text-right">{fmtShort(amt)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Accounts ── */}
          {accounts.length > 0 && (
            <div className="bg-[#16181f] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-semibold text-sm">Accounts</p>
                <Link href="/finance/accounts" className="text-white/25 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">View all <ChevronRight size={11} /></Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {accounts.slice(0, 8).map(a => (
                  <div key={a.id} className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={12} className="text-white/30" />
                      <span className="text-white/40 text-xs truncate">{a.institution || a.name}</span>
                    </div>
                    <p className="text-white font-bold text-base">{fmt(a.balance)}</p>
                    <p className="text-white/25 text-xs truncate mt-0.5">{a.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Subscriptions & recurring ── */}
          {subscriptions.length > 0 && (
            <div className="bg-[#16181f] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Repeat size={15} className="text-indigo-400" />
                  <p className="text-white font-semibold text-sm">Recurring & Subscriptions</p>
                  <span className="text-white/30 text-xs ml-1">~{fmt(monthlySubTotal)}/mo</span>
                </div>
                <Link href="/finance/merchants" className="text-white/25 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">Manage <ChevronRight size={11} /></Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subscriptions.map(s => (
                  <div key={s.name} className="flex items-center gap-2.5 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-[10px] font-bold">{s.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/70 text-xs font-medium truncate">{s.name}</p>
                      <p className="text-rose-400 text-xs font-semibold">{fmt(Math.abs(s.amount))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Airbnb snapshot ── */}
          {(airbnbIncome > 0 || airbnbExpenses > 0) && (
            <div className="bg-[#16181f] rounded-2xl border border-violet-500/15 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Home size={15} className="text-violet-400" />
                  <p className="text-white font-semibold text-sm">Airbnb This Month</p>
                </div>
                <Link href="/finance/airbnb" className="text-white/25 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">Details <ChevronRight size={11} /></Link>
              </div>
              <div className="flex gap-6">
                <div><p className="text-white/30 text-xs mb-0.5">Income</p><p className="text-emerald-400 font-bold text-lg">{fmt(airbnbIncome)}</p></div>
                <div><p className="text-white/30 text-xs mb-0.5">Expenses</p><p className="text-rose-400 font-bold text-lg">{fmt(airbnbExpenses)}</p></div>
                <div><p className="text-white/30 text-xs mb-0.5">Net</p><p className={`font-bold text-lg ${airbnbIncome - airbnbExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(airbnbIncome - airbnbExpenses)}</p></div>
              </div>
            </div>
          )}

          {/* ── Quick links ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/finance/spending', label: 'All Spending', sub: `${transactions.filter(t => t.amount < 0).length} transactions`, icon: TrendingDown, color: 'text-indigo-400' },
              { href: '/finance/merchants', label: 'Merchants', sub: 'Assign & organize', icon: RefreshCw, color: 'text-amber-400' },
              { href: '/finance/airbnb', label: 'Airbnb P&L', sub: '3 properties', icon: Home, color: 'text-violet-400' },
              { href: '/finance/taxes', label: 'Tax Hub', sub: '2025 & 2026', icon: DollarSign, color: 'text-rose-400' },
            ].map(({ href, label, sub, icon: Icon, color }) => (
              <Link key={href} href={href} className="bg-[#16181f] rounded-2xl border border-white/5 p-4 hover:border-white/10 hover:bg-white/2 transition-all group">
                <Icon size={18} className={`${color} mb-3`} />
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/25 text-xs mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </FinanceShell>
  )
}

// ── Big summary card ──────────────────────────────────────────────────────────
function BigCard({ label, value, color, icon, prev, sub, invert }: {
  label: string; value: number; color: string; icon: React.ReactNode
  prev?: number; sub?: string; invert?: boolean
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400', rose: 'text-rose-400',
    indigo: 'text-indigo-400', amber: 'text-amber-400',
  }
  const change = prev !== undefined && prev > 0 ? ((value - prev) / prev) * 100 : null
  const changeGood = invert ? (change !== null && change < 0) : (change !== null && change > 0)

  return (
    <div className="bg-[#16181f] rounded-2xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/30 text-xs font-medium">{label}</span>
        <span className={colors[color] || 'text-white/30'}>{icon}</span>
      </div>
      <p className={`text-xl font-bold ${colors[color] || 'text-white'}`}>{fmtShort(value)}</p>
      {sub && <p className="text-white/20 text-xs mt-0.5">{sub}</p>}
      {change !== null && (
        <p className={`text-xs mt-1 ${changeGood ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(0)}% vs last mo
        </p>
      )}
    </div>
  )
}
