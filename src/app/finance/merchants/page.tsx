'use client'

import { useState, useEffect, useMemo } from 'react'
import FinanceShell from '@/components/finance/FinanceShell'
import {
  RefreshCw, Check, ChevronRight, ChevronLeft, Search,
  Repeat, Tag, Building2, Loader2, CheckCircle2, X
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface MerchantSummary {
  merchant: string
  displayName: string
  totalSpent: number
  count: number
  category: string
  entity: string
  isRecurring: boolean
  hasRule: boolean
  lastSeen: string
}

// ── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Housing', 'Utilities', 'Subscriptions',
  'Transportation', 'Travel', 'Health & Medical', 'Insurance', 'Airbnb',
  'Business', 'Kids & Family', 'Personal Care', 'Income', 'Transfer',
  'Taxes & Fees', 'Other',
]

const ENTITIES = [
  { key: 'personal', label: 'Personal', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
  { key: 'business', label: 'Agent Business', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { key: 'airbnb', label: 'Airbnb', color: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
]

const CAT_COLORS: Record<string, string> = {
  'Food & Dining': '#f97316', 'Shopping': '#8b5cf6', 'Housing': '#3b82f6',
  'Utilities': '#06b6d4', 'Subscriptions': '#ec4899', 'Transportation': '#eab308',
  'Travel': '#6366f1', 'Health & Medical': '#22c55e', 'Insurance': '#64748b',
  'Airbnb': '#a855f7', 'Business': '#0ea5e9', 'Other': '#6b7280',
  'Income': '#10b981', 'Transfer': '#94a3b8', 'Taxes & Fees': '#ef4444',
}

function fmt(n: number) {
  return Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [tab, setTab] = useState<'queue' | 'all'>('queue')
  const [queueIdx, setQueueIdx] = useState(0)
  const [search, setSearch] = useState('')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [edits, setEdits] = useState<Record<string, Partial<MerchantSummary>>>({})
  const [saved, setSaved] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const res = await fetch('/api/finance/merchants/summary')
    if (res.ok) setMerchants(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Queue: merchants without a confirmed rule ─────────────────────────────
  const queue = useMemo(() =>
    merchants.filter(m => !m.hasRule && !saved.has(m.merchant) && m.category === 'Other')
  , [merchants, saved])

  // ── All list with filters ─────────────────────────────────────────────────
  const allFiltered = useMemo(() => {
    const q = search.toLowerCase()
    return merchants.filter(m => {
      if (q && !m.displayName.toLowerCase().includes(q) && !m.merchant.includes(q)) return false
      if (filterEntity !== 'all' && (edits[m.merchant]?.entity || m.entity) !== filterEntity) return false
      if (filterCat !== 'all' && (edits[m.merchant]?.category || m.category) !== filterCat) return false
      return true
    })
  }, [merchants, search, filterEntity, filterCat, edits])

  // ── Save a rule ───────────────────────────────────────────────────────────
  async function saveRule(merchant: string, patch?: Partial<MerchantSummary>) {
    const base = merchants.find(m => m.merchant === merchant)!
    const e = edits[merchant] || {}
    const merged = { ...base, ...e, ...(patch || {}) }
    setSaving(merchant)
    await fetch('/api/finance/merchants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant: merged.merchant,
        display_name: merged.displayName,
        category: merged.category,
        entity: merged.entity,
        is_recurring: merged.isRecurring,
      }),
    })
    setMerchants(prev => prev.map(m => m.merchant === merchant ? { ...m, ...merged, hasRule: true } : m))
    setSaved(prev => new Set([...prev, merchant]))
    setSaving(null)
    // Advance queue
    if (tab === 'queue') setQueueIdx(i => Math.min(i, queue.length - 2))
  }

  function patchEdit(merchant: string, patch: Partial<MerchantSummary>) {
    setEdits(prev => ({ ...prev, [merchant]: { ...(prev[merchant] || {}), ...patch } }))
  }

  function getMerged(m: MerchantSummary) {
    return { ...m, ...(edits[m.merchant] || {}) }
  }

  // ── Queue UI ──────────────────────────────────────────────────────────────
  const queueItem = queue[queueIdx]

  return (
    <FinanceShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Tag size={20} className="text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Merchants</h1>
          </div>
          <p className="text-white/30 text-sm">
            {merchants.length} merchants · {queue.length} need a category
          </p>
        </div>
        <button onClick={load} className="p-2 text-white/20 hover:text-white/60 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setTab('queue')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'queue' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white'}`}>
          Review Queue {queue.length > 0 && <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{queue.length}</span>}
        </button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
          All Merchants
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
      ) : tab === 'queue' ? (
        /* ── QUEUE TAB ──────────────────────────────────────────── */
        queue.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-1">All caught up!</p>
            <p className="text-white/30 text-sm">Every merchant has been assigned. Switch to "All Merchants" to review or edit.</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4 text-xs text-white/30">
              <span>{queueIdx + 1} of {queue.length}</span>
              <div className="flex-1 mx-4 bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 bg-amber-500 rounded-full transition-all" style={{ width: `${((queueIdx + 1) / queue.length) * 100}%` }} />
              </div>
              <span>{queue.length - queueIdx - 1} remaining</span>
            </div>

            {/* Card */}
            {queueItem && <QueueCard
              key={queueItem.merchant}
              item={getMerged(queueItem)}
              saving={saving === queueItem.merchant}
              onPatch={p => patchEdit(queueItem.merchant, p)}
              onSave={() => saveRule(queueItem.merchant)}
              onSkip={() => setQueueIdx(i => Math.min(i + 1, queue.length - 1))}
              canGoBack={queueIdx > 0}
              onBack={() => setQueueIdx(i => Math.max(i - 1, 0))}
            />}
          </div>
        )
      ) : (
        /* ── ALL TAB ────────────────────────────────────────────── */
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchants..."
                className="w-full bg-[#16181f] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none" />
            </div>
            <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="bg-[#16181f] border border-white/8 text-white/60 text-sm rounded-lg px-3 py-2 focus:outline-none">
              <option value="all">All entities</option>
              {ENTITIES.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-[#16181f] border border-white/8 text-white/60 text-sm rounded-lg px-3 py-2 focus:outline-none">
              <option value="all">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#16181f] rounded-2xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-[1fr_140px_140px_80px_60px] gap-0 text-xs text-white/25 uppercase tracking-wider font-semibold px-5 py-3 border-b border-white/5">
              <span>Merchant</span>
              <span>Category</span>
              <span>Entity</span>
              <span className="text-right">Spent</span>
              <span className="text-right">Txns</span>
            </div>
            <div className="divide-y divide-white/3 max-h-[600px] overflow-y-auto">
              {allFiltered.map(m => {
                const merged = getMerged(m)
                const isSaved = saved.has(m.merchant) || m.hasRule
                return (
                  <div key={m.merchant} className="grid grid-cols-[1fr_140px_140px_80px_60px] gap-0 items-center px-5 py-3 hover:bg-white/2 transition-colors group">
                    {/* Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      {isSaved && <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />}
                      {merged.isRecurring && !isSaved && <Repeat size={11} className="text-indigo-400 flex-shrink-0" />}
                      <span className="text-white/70 text-sm truncate">{merged.displayName}</span>
                    </div>
                    {/* Category */}
                    <div>
                      <select
                        value={merged.category}
                        onChange={e => {
                          patchEdit(m.merchant, { category: e.target.value })
                          saveRule(m.merchant, { category: e.target.value })
                        }}
                        className="bg-transparent text-xs focus:outline-none cursor-pointer hover:text-white transition-colors"
                        style={{ color: CAT_COLORS[merged.category] || '#ffffff50' }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e2028', color: '#fff' }}>{c}</option>)}
                      </select>
                    </div>
                    {/* Entity */}
                    <div>
                      <select
                        value={merged.entity}
                        onChange={e => {
                          patchEdit(m.merchant, { entity: e.target.value })
                          saveRule(m.merchant, { entity: e.target.value })
                        }}
                        className="bg-transparent text-white/40 text-xs focus:outline-none cursor-pointer hover:text-white transition-colors"
                      >
                        {ENTITIES.map(e => <option key={e.key} value={e.key} style={{ background: '#1e2028', color: '#fff' }}>{e.label}</option>)}
                      </select>
                    </div>
                    {/* Amount */}
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${merged.totalSpent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {fmt(merged.totalSpent)}
                      </span>
                    </div>
                    {/* Count */}
                    <div className="text-right text-white/25 text-xs">{merged.count}</div>
                  </div>
                )
              })}
              {allFiltered.length === 0 && (
                <div className="text-center py-10 text-white/20 text-sm">No merchants match your filters</div>
              )}
            </div>
          </div>
        </div>
      )}
    </FinanceShell>
  )
}

// ── Queue Card ────────────────────────────────────────────────────────────────

function QueueCard({ item, saving, onPatch, onSave, onSkip, canGoBack, onBack }: {
  item: MerchantSummary
  saving: boolean
  onPatch: (p: Partial<MerchantSummary>) => void
  onSave: () => void
  onSkip: () => void
  canGoBack: boolean
  onBack: () => void
}) {
  return (
    <div className="bg-[#16181f] rounded-2xl border border-white/8 p-6 space-y-5">
      {/* Merchant name */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
          <span className="text-white/50 font-bold text-lg">{item.displayName.slice(0, 2).toUpperCase()}</span>
        </div>
        <p className="text-white font-bold text-xl">{item.displayName}</p>
        <p className="text-white/30 text-sm mt-1">
          {fmt(Math.abs(item.totalSpent))} · {item.count} transaction{item.count !== 1 ? 's' : ''}
          {item.lastSeen && ` · last ${item.lastSeen}`}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="text-white/30 text-xs uppercase tracking-wider font-semibold block mb-2">Category</label>
        <div className="grid grid-cols-3 gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => onPatch({ category: c })}
              className={`text-xs px-2 py-2 rounded-lg border transition-colors text-left ${item.category === c ? 'border-transparent text-white font-semibold' : 'bg-white/3 border-white/5 text-white/40 hover:text-white hover:bg-white/5'}`}
              style={item.category === c ? { background: CAT_COLORS[c] + '25', borderColor: CAT_COLORS[c] + '60', color: CAT_COLORS[c] } : {}}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Entity */}
      <div>
        <label className="text-white/30 text-xs uppercase tracking-wider font-semibold block mb-2">Belongs to</label>
        <div className="flex gap-2">
          {ENTITIES.map(e => (
            <button
              key={e.key}
              onClick={() => onPatch({ entity: e.key })}
              className={`flex-1 text-xs py-2 rounded-lg border transition-colors font-medium ${item.entity === e.key ? e.color : 'bg-white/3 border-white/5 text-white/40 hover:text-white'}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring toggle */}
      <button
        onClick={() => onPatch({ isRecurring: !item.isRecurring })}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${item.isRecurring ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-white/3 border-white/5 text-white/30 hover:border-white/10'}`}
      >
        <Repeat size={14} />
        <span className="text-sm font-medium">Recurring / subscription</span>
        <div className={`ml-auto w-9 h-5 rounded-full transition-colors ${item.isRecurring ? 'bg-indigo-500' : 'bg-white/10'}`}>
          <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${item.isRecurring ? 'translate-x-4' : ''}`} />
        </div>
      </button>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canGoBack && (
          <button onClick={onBack} className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl transition-colors">
            <ChevronLeft size={16} />
          </button>
        )}
        <button onClick={onSkip} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 py-2.5 rounded-xl transition-colors text-sm">
          <X size={14} /> Skip
        </button>
        <button onClick={onSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save Rule
        </button>
        <button onClick={onSkip} className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
