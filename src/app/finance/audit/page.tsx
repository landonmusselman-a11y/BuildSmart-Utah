'use client'

import { useState, useEffect, useCallback } from 'react'
import FinanceShell from '@/components/finance/FinanceShell'
import { Sparkles, Check, X, ChevronDown, ChevronRight, Loader2, RefreshCw, CheckCheck } from 'lucide-react'

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Mortgage', 'Housing', 'Utilities', 'Subscriptions',
  'Transportation', 'Travel', 'Health & Medical', 'Insurance', 'Airbnb', 'Business',
  'Kids & Family', 'Personal Care', 'Income', 'Transfer', 'Venmo', 'Taxes & Fees', 'Other',
]

const ENTITIES = ['personal', 'business', 'airbnb'] as const
type Entity = typeof ENTITIES[number]

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string | null
  entity: string | null
}

interface Suggestion {
  id: string
  category: string
  entity: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

interface AuditRow extends Transaction {
  suggestion?: Suggestion
  status: 'pending' | 'loading' | 'suggested' | 'approved' | 'edited' | 'rejected'
  editedCategory?: string
  editedEntity?: string
}

const CONFIDENCE_COLOR = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-rose-400' }
const CONFIDENCE_BG = { high: 'bg-emerald-500/10', medium: 'bg-amber-500/10', low: 'bg-rose-500/10' }

const BATCH_SIZE = 25

export default function AuditPage() {
  const [year, setYear] = useState<'2025' | '2026'>('2026')
  const [mode, setMode] = useState<'needs_review' | 'all'>('needs_review')
  const [rows, setRows] = useState<AuditRow[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    setLoadingData(true)
    const res = await fetch(`/api/finance/audit-ai?mode=${mode}&year=${year}`)
    const data = await res.json()
    setRows((data.transactions || []).map((t: Transaction) => ({
      ...t,
      status: 'pending' as const,
    })))
    setLoadingData(false)
    setSavedCount(0)
    setProgress({ done: 0, total: 0 })
  }, [mode, year])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  async function runAudit() {
    const pendingRows = rows.filter(r => r.status === 'pending' || r.status === 'suggested')
    if (pendingRows.length === 0) return

    setProcessing(true)
    setProgress({ done: 0, total: pendingRows.length })

    setRows(prev => prev.map(r =>
      pendingRows.find(p => p.id === r.id) ? { ...r, status: 'loading' as const } : r
    ))

    for (let i = 0; i < pendingRows.length; i += BATCH_SIZE) {
      const batch = pendingRows.slice(i, i + BATCH_SIZE)
      const ids = batch.map(r => r.id)

      try {
        const res = await fetch('/api/finance/audit-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionIds: ids }),
        })
        const data = await res.json()
        const suggestions: Suggestion[] = data.suggestions || []

        setRows(prev => prev.map(r => {
          const sug = suggestions.find(s => s.id === r.id)
          if (!sug) return r
          return { ...r, suggestion: sug, status: 'suggested' as const, editedCategory: sug.category, editedEntity: sug.entity }
        }))
      } catch (e) {
        console.error('Batch failed', e)
        setRows(prev => prev.map(r => batch.find(b => b.id === r.id) ? { ...r, status: 'pending' as const } : r))
      }

      setProgress(prev => ({ ...prev, done: Math.min(prev.done + batch.length, pendingRows.length) }))
    }

    setProcessing(false)
  }

  async function approveAll() {
    const toApprove = rows.filter(r => r.status === 'suggested' || r.status === 'edited')
    if (toApprove.length === 0) return

    setSaving(true)
    const approvals = toApprove.map(r => ({
      id: r.id,
      category: r.editedCategory || r.suggestion?.category || r.category || 'Other',
      entity: r.editedEntity || r.suggestion?.entity || r.entity || 'personal',
    }))

    await fetch('/api/finance/audit-ai', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvals }),
    })

    setRows(prev => prev.map(r =>
      toApprove.find(a => a.id === r.id) ? { ...r, status: 'approved' as const } : r
    ))
    setSavedCount(toApprove.length)
    setSaving(false)
  }

  async function approveOne(id: string) {
    const row = rows.find(r => r.id === id)
    if (!row) return
    await fetch('/api/finance/audit-ai', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvals: [{ id, category: row.editedCategory || row.suggestion?.category || row.category || 'Other', entity: row.editedEntity || row.suggestion?.entity || row.entity || 'personal' }] }),
    })
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r))
  }

  function rejectOne(id: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
  }

  function updateRow(id: string, field: 'editedCategory' | 'editedEntity', value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value, status: r.status === 'approved' ? 'approved' as const : 'edited' as const } : r))
  }

  const pendingCount = rows.filter(r => r.status === 'pending').length
  const suggestedCount = rows.filter(r => r.status === 'suggested' || r.status === 'edited').length
  const approvedCount = rows.filter(r => r.status === 'approved').length
  const rejectedCount = rows.filter(r => r.status === 'rejected').length
  const loadingCount = rows.filter(r => r.status === 'loading').length

  return (
    <FinanceShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-400" />
            AI Transaction Audit
          </h1>
          <p className="text-white/40 text-sm mt-1">Claude reviews each transaction and suggests the right category</p>
        </div>
        <div className="flex items-center gap-2">
          {savedCount > 0 && (
            <span className="text-emerald-400 text-sm font-medium">✓ {savedCount} saved</span>
          )}
          {suggestedCount > 0 && (
            <button onClick={approveAll} disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Approve All ({suggestedCount})
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-[#16181f] border border-white/5 rounded-lg overflow-hidden">
          {(['2025', '2026'] as const).map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${year === y ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>
              {y}
            </button>
          ))}
        </div>

        <div className="flex bg-[#16181f] border border-white/5 rounded-lg overflow-hidden">
          <button onClick={() => setMode('needs_review')}
            className={`px-4 py-2 text-sm transition-colors ${mode === 'needs_review' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            Needs Review
          </button>
          <button onClick={() => setMode('all')}
            className={`px-4 py-2 text-sm transition-colors ${mode === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            All Transactions
          </button>
        </div>

        <button onClick={loadTransactions} disabled={loadingData}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
          <RefreshCw size={13} className={loadingData ? 'animate-spin' : ''} />
          Reload
        </button>

        {pendingCount > 0 && !processing && (
          <button onClick={runAudit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ml-auto">
            <Sparkles size={14} />
            Run AI Audit ({pendingCount})
          </button>
        )}

        {processing && (
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-48 bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
            <span className="text-white/40 text-sm">{progress.done}/{progress.total}</span>
            <Loader2 size={14} className="text-indigo-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Stats */}
      {rows.length > 0 && (
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span className="text-white/40">{rows.length} transactions</span>
          {loadingCount > 0 && <span className="text-indigo-400">⏳ {loadingCount} processing…</span>}
          {suggestedCount > 0 && <span className="text-amber-400">🤖 {suggestedCount} ready to review</span>}
          {approvedCount > 0 && <span className="text-emerald-400">✓ {approvedCount} approved</span>}
          {rejectedCount > 0 && <span className="text-white/30">✕ {rejectedCount} skipped</span>}
        </div>
      )}

      {/* Table */}
      {loadingData ? (
        <div className="flex justify-center h-48 items-center">
          <Loader2 size={28} className="text-indigo-400 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-12 text-center">
          <Sparkles size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No transactions need review for {year}.</p>
          <button onClick={() => setMode('all')} className="text-indigo-400 text-sm mt-2 hover:underline">
            Switch to All Transactions
          </button>
        </div>
      ) : (
        <div className="bg-[#16181f] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-white/30 font-medium px-4 py-3 w-20">Date</th>
                <th className="text-left text-white/30 font-medium px-4 py-3">Description</th>
                <th className="text-right text-white/30 font-medium px-4 py-3 w-24">Amount</th>
                <th className="text-left text-white/30 font-medium px-4 py-3 w-44">Category</th>
                <th className="text-left text-white/30 font-medium px-4 py-3 w-28">Entity</th>
                <th className="text-left text-white/30 font-medium px-4 py-3 w-20">Score</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isExpanded = expandedId === row.id
                const displayCategory = row.editedCategory || row.suggestion?.category || row.category || '—'
                const displayEntity = row.editedEntity || row.suggestion?.entity || row.entity || 'personal'
                const rowBg =
                  row.status === 'approved' ? 'bg-emerald-500/5' :
                  row.status === 'rejected' ? 'opacity-30' :
                  row.status === 'loading' ? 'opacity-50' :
                  (row.status === 'suggested' || row.status === 'edited') ? 'bg-indigo-500/5' : ''

                return (
                  <>
                    <tr key={row.id}
                      className={`border-b border-white/3 hover:bg-white/[0.02] cursor-pointer transition-all ${rowBg}`}
                      onClick={() => setExpandedId(isExpanded ? null : row.id)}>
                      <td className="px-4 py-2.5 text-white/40 font-mono text-xs">{row.date?.slice(5)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {row.status === 'loading' && <Loader2 size={11} className="text-indigo-400 animate-spin flex-shrink-0" />}
                          {row.status === 'approved' && <Check size={11} className="text-emerald-400 flex-shrink-0" />}
                          {row.status === 'rejected' && <X size={11} className="text-white/30 flex-shrink-0" />}
                          <span className="text-white/75 truncate max-w-sm text-xs">{row.description}</span>
                          {isExpanded
                            ? <ChevronDown size={11} className="text-white/20 flex-shrink-0 ml-1" />
                            : <ChevronRight size={11} className="text-white/10 flex-shrink-0 ml-1" />}
                        </div>
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono text-xs font-medium ${Number(row.amount) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {Number(row.amount) < 0 ? '-' : '+'}${Math.abs(Number(row.amount)).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        {(row.status === 'suggested' || row.status === 'edited' || row.status === 'approved') ? (
                          <select value={displayCategory} onChange={e => updateRow(row.id, 'editedCategory', e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 focus:outline-none w-full">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className="text-white/40 text-xs">{displayCategory}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        {(row.status === 'suggested' || row.status === 'edited' || row.status === 'approved') ? (
                          <select value={displayEntity} onChange={e => updateRow(row.id, 'editedEntity', e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-xs rounded px-2 py-1 focus:outline-none">
                            {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        ) : (
                          <span className="text-white/30 text-xs">{displayEntity}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.suggestion && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CONFIDENCE_BG[row.suggestion.confidence]} ${CONFIDENCE_COLOR[row.suggestion.confidence]}`}>
                            {row.suggestion.confidence}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        {(row.status === 'suggested' || row.status === 'edited') && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => approveOne(row.id)}
                              className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="Approve">
                              <Check size={11} />
                            </button>
                            <button onClick={() => rejectOne(row.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/30 transition-colors" title="Skip">
                              <X size={11} />
                            </button>
                          </div>
                        )}
                        {row.status === 'approved' && <span className="text-emerald-500/50 text-xs">✓</span>}
                      </td>
                    </tr>
                    {isExpanded && row.suggestion && (
                      <tr key={`${row.id}_exp`} className="border-b border-white/3">
                        <td colSpan={7} className="px-6 py-3 bg-indigo-950/20">
                          <div className="flex items-start gap-2">
                            <Sparkles size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs"><span className="text-indigo-300 font-medium">AI: </span><span className="text-white/50">{row.suggestion.reason}</span></p>
                          </div>
                          <div className="flex gap-4 mt-1.5 text-xs text-white/25">
                            <span>Original: {row.category || 'None'}</span>
                            <span>Entity was: {row.entity || 'None'}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>

          {suggestedCount > 0 && (
            <div className="px-4 py-3 border-t border-white/5 bg-indigo-950/30 flex items-center justify-between">
              <span className="text-white/50 text-sm">{suggestedCount} reviewed — approve to save changes</span>
              <button onClick={approveAll} disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                Approve All {suggestedCount}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'needs_review' && rows.length > 0 && rows.every(r => r.status === 'approved' || r.status === 'rejected') && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
          <Check size={24} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-300 font-semibold">All transactions reviewed!</p>
          <p className="text-emerald-400/60 text-sm mt-1">Switch to &quot;All Transactions&quot; to audit everything, or go to Spending.</p>
        </div>
      )}
    </FinanceShell>
  )
}
