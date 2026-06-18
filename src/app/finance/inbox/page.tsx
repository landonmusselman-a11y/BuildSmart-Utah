'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import FinanceShell from '@/components/finance/FinanceShell'
import { TaxDocument } from '@/types/finance'
import {
  Upload, CheckCircle, AlertCircle, Loader2, Inbox,
  FileText, DollarSign, Home, TrendingUp, CreditCard,
  ChevronDown, ChevronUp, Trash2, Check, Clock, Eye,
  RefreshCw, AlertTriangle
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemStatus = 'queued' | 'identifying' | 'identified' | 'approved' | 'processing' | 'ready' | 'confirmed' | 'error'

interface DocIdentity {
  docType: string
  institution?: string
  dateRange?: string
  accountLast4?: string
  section: string
  isIncome: boolean
  summary: string
  confidence: 'high' | 'medium' | 'low'
}

interface InboxItem {
  id: string
  file_name: string
  file_size: number
  status: ItemStatus
  section?: string
  label?: string
  summary?: string
  error?: string
  identity?: DocIdentity
  account_name?: string
  property_name?: string
  tax_year?: number
  tax_type?: string
  tax_payer?: string
  tax_amount?: number
  drive_link?: string
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROPERTIES = ['Zen Den', 'Still Nest', 'Zen Nest']
const TAX_TYPES: TaxDocument['type'][] = ['1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV','W2','K1','mortgage_interest','property_tax','other']

const DOC_TYPE_LABELS: Record<string, string> = {
  bank_statement: 'Bank Statement',
  credit_card: 'Credit Card Statement',
  tax_1099: '1099',
  tax_w2: 'W-2',
  tax_other: 'Tax Document',
  investment: 'Investment Statement',
  mortgage: 'Mortgage Statement',
  property_tax: 'Property Tax',
  airbnb_income: 'Airbnb Income',
  expense_receipt: 'Expense Receipt',
  utility_bill: 'Utility Bill',
  insurance: 'Insurance',
  unknown: 'Unknown Document',
}

const SECTION_COLORS: Record<string, string> = {
  spending: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  taxes: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  airbnb: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
  investments: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  spending: <CreditCard size={14} />,
  taxes: <FileText size={14} />,
  airbnb: <Home size={14} />,
  investments: <TrendingUp size={14} />,
}

const SECTION_LABELS: Record<string, string> = {
  spending: 'Spending',
  taxes: 'Taxes',
  airbnb: 'Airbnb P&L',
  investments: 'Investments',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editState, setEditState] = useState<Record<string, Partial<InboxItem>>>({})
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const seenKeys = useRef<Set<string>>(new Set())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/finance/inbox')
    if (res.ok) setItems(await res.json())
  }, [])

  const kickQueue = useCallback(async () => {
    await fetch('/api/finance/inbox/process', { method: 'POST' })
  }, [])

  useEffect(() => {
    fetchItems()
    kickQueue()
    pollRef.current = setInterval(fetchItems, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchItems, kickQueue])

  // ── Upload ──────────────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    const key = `${file.name}__${file.size}`
    if (seenKeys.current.has(key)) return
    seenKeys.current.add(key)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/finance/inbox/upload', { method: 'POST', body: fd })
    const json = await res.json()
    // Kick off identification immediately after upload
    if (json.ok && json.id && !json.duplicate) {
      fetch('/api/finance/inbox/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: json.id }),
      }).catch(() => {})
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files) return
    setUploading(true)
    // Upload sequentially to avoid hammering Claude
    for (const file of Array.from(files)) {
      await uploadFile(file)
      await fetchItems()
      await new Promise(r => setTimeout(r, 1500))
    }
    await fetchItems()
    setUploading(false)
  }

  // ── Approve & Process ───────────────────────────────────────────────────────

  async function approveItem(item: InboxItem, overrides?: Partial<InboxItem>) {
    const patch: Record<string, unknown> = {
      id: item.id,
      status: 'approved',
      ...(overrides?.section && { section: overrides.section }),
      ...(overrides?.account_name && { account_name: overrides.account_name }),
      ...(overrides?.property_name && { property_name: overrides.property_name }),
      ...(overrides?.tax_year && { tax_year: overrides.tax_year }),
      ...(overrides?.tax_type && { tax_type: overrides.tax_type }),
    }
    await fetch('/api/finance/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    kickQueue()
    fetchItems()
  }

  async function approveAll() {
    const identified = items.filter(i => i.status === 'identified')
    for (const item of identified) await approveItem(item)
  }

  // ── Confirm ─────────────────────────────────────────────────────────────────

  async function confirmItem(item: InboxItem) {
    const edits = editState[item.id] || {}
    if (Object.keys(edits).length > 0) {
      await fetch('/api/finance/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, ...edits }),
      })
    }
    await fetch('/api/finance/inbox/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    })
    fetchItems()
  }

  async function confirmAll() {
    for (const item of items.filter(i => i.status === 'ready')) await confirmItem(item)
  }

  // ── Dismiss & Clear ─────────────────────────────────────────────────────────

  async function dismissItem(id: string) {
    await fetch('/api/finance/inbox', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function clearAll() {
    setClearing(true)
    await fetch('/api/finance/reset', { method: 'POST' })
    setItems([])
    seenKeys.current = new Set()
    setClearing(false)
    setShowClearConfirm(false)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function patchEdit(id: string, patch: Partial<InboxItem>) {
    setEditState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  const identifiedCount = items.filter(i => i.status === 'identified').length
  const readyCount = items.filter(i => i.status === 'ready').length
  const confirmedCount = items.filter(i => i.status === 'confirmed').length
  const processingCount = items.filter(i => ['queued','identifying','approved','processing'].includes(i.status)).length

  return (
    <FinanceShell>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Inbox size={22} className="text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Document Inbox</h1>
          </div>
          <p className="text-white/40 text-sm">Drop documents → Claude identifies each one → you approve → data is extracted</p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs text-white/25 hover:text-rose-400 transition-colors"
        >
          Clear all data
        </button>
      </div>

      {/* Clear confirm dialog */}
      {showClearConfirm && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 mb-6">
          <p className="text-white font-semibold mb-1">Clear all financial data?</p>
          <p className="text-white/50 text-sm mb-4">This deletes all transactions, accounts, investments, taxes, and inbox items. Cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={clearAll} disabled={clearing} className="bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
              {clearing ? 'Clearing...' : 'Yes, clear everything'}
            </button>
            <button onClick={() => setShowClearConfirm(false)} className="bg-white/5 text-white text-sm px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all mb-8 ${
          dragging ? 'border-indigo-500 bg-indigo-500/10 cursor-copy' :
          uploading ? 'border-indigo-500/30 bg-indigo-500/3 cursor-wait' :
          'border-white/10 hover:border-white/20 hover:bg-white/2 cursor-pointer'
        }`}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.csv,.jpg,.jpeg,.png,.webp,.heic" className="hidden" onChange={e => addFiles(e.target.files)} />
        {uploading ? (
          <>
            <Loader2 size={32} className="text-indigo-400 mx-auto mb-3 animate-spin" />
            <p className="text-white/60 font-semibold">Uploading & identifying...</p>
            <p className="text-white/25 text-sm mt-1">Processing one at a time for accuracy</p>
          </>
        ) : (
          <>
            <div className="relative inline-block mb-3">
              <Upload size={32} className="text-white/20" />
              <div className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">AI</span>
              </div>
            </div>
            <p className="text-white/60 font-semibold text-lg">Drop all your documents here</p>
            <p className="text-white/25 text-sm mt-1">PDF, CSV, photo, screenshot · any number of files</p>
          </>
        )}
      </div>

      {/* Flow legend */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-white/25 mb-5 flex-wrap">
          <span className="bg-white/5 px-2 py-1 rounded">① Upload</span>
          <span>→</span>
          <span className="bg-white/5 px-2 py-1 rounded">② AI Identifies</span>
          <span>→</span>
          <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">③ You Approve</span>
          <span>→</span>
          <span className="bg-white/5 px-2 py-1 rounded">④ AI Extracts Data</span>
          <span>→</span>
          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">⑤ You Confirm</span>
        </div>
      )}

      {/* Stats & bulk actions */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          {processingCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              {processingCount} in progress
            </div>
          )}
          {identifiedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <Eye size={13} />
              {identifiedCount} need approval
            </div>
          )}
          {readyCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-indigo-300">
              <Clock size={13} />
              {readyCount} ready to confirm
            </div>
          )}
          {confirmedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle size={13} />
              {confirmedCount} saved
            </div>
          )}
          <div className="ml-auto flex gap-2">
            {processingCount > 0 && (
              <button onClick={kickQueue} className="text-xs bg-white/5 hover:bg-white/10 text-white/40 hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <RefreshCw size={11} /> Unstick
              </button>
            )}
            {identifiedCount > 1 && (
              <button onClick={approveAll} className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold px-4 py-1.5 rounded-lg transition-colors border border-amber-500/20">
                Approve All ({identifiedCount})
              </button>
            )}
            {readyCount > 1 && (
              <button onClick={confirmAll} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
                Confirm All ({readyCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Item list */}
      <div className="space-y-3">
        {items.map(item => (
          <InboxCard
            key={item.id}
            item={item}
            isExpanded={expanded.has(item.id)}
            edits={editState[item.id] || {}}
            onToggleExpand={() => toggleExpand(item.id)}
            onApprove={overrides => approveItem(item, overrides)}
            onConfirm={() => confirmItem(item)}
            onDismiss={() => dismissItem(item.id)}
            onPatchEdit={patch => patchEdit(item.id, patch)}
          />
        ))}
      </div>

      {items.length === 0 && !uploading && (
        <p className="text-center text-white/20 text-sm py-8">No documents yet. Drop files above to get started.</p>
      )}
    </FinanceShell>
  )
}

// ── Inbox Card ────────────────────────────────────────────────────────────────

function InboxCard({
  item, isExpanded, edits,
  onToggleExpand, onApprove, onConfirm, onDismiss, onPatchEdit,
}: {
  item: InboxItem
  isExpanded: boolean
  edits: Partial<InboxItem>
  onToggleExpand: () => void
  onApprove: (overrides?: Partial<InboxItem>) => void
  onConfirm: () => void
  onDismiss: () => void
  onPatchEdit: (patch: Partial<InboxItem>) => void
}) {
  const merged = { ...item, ...edits }
  const section = merged.section || item.identity?.section || 'spending'
  const identity = item.identity

  const borderClass = item.status === 'confirmed' ? 'border-emerald-500/20 opacity-50'
    : item.status === 'error' ? 'border-rose-500/20'
    : item.status === 'identified' ? 'border-amber-500/20'
    : item.status === 'ready' ? 'border-indigo-500/20'
    : 'border-white/5'

  return (
    <div className={`bg-[#16181f] rounded-xl border transition-all ${borderClass}`}>
      <div className="flex items-center gap-3 px-5 py-4">

        {/* Status icon */}
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white/20">
          {item.status === 'queued' && <Clock size={16} className="text-white/20" />}
          {item.status === 'identifying' && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
          {item.status === 'identified' && <Eye size={16} className="text-amber-400" />}
          {item.status === 'approved' && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
          {item.status === 'processing' && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
          {item.status === 'ready' && <div className={`${SECTION_COLORS[section] || ''} rounded-lg p-1`}>{SECTION_ICONS[section] || <DollarSign size={14} />}</div>}
          {item.status === 'confirmed' && <CheckCircle size={16} className="text-emerald-400" />}
          {item.status === 'error' && <AlertCircle size={16} className="text-rose-400" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{item.file_name}</p>

          {item.status === 'queued' && <p className="text-white/25 text-xs mt-0.5">Waiting...</p>}
          {item.status === 'identifying' && <p className="text-white/40 text-xs mt-0.5">Claude is identifying this document...</p>}
          {item.status === 'approved' && <p className="text-white/40 text-xs mt-0.5">Approved — extracting data...</p>}
          {item.status === 'processing' && <p className="text-white/40 text-xs mt-0.5">Extracting transactions and data...</p>}
          {item.status === 'error' && <p className="text-rose-400 text-xs mt-0.5">{item.error}</p>}

          {item.status === 'identified' && identity && (
            <div className="mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${SECTION_COLORS[identity.section] || 'bg-white/5 border-white/10 text-white/40'}`}>
                  {SECTION_LABELS[identity.section] || identity.section}
                </span>
                <span className="text-white/60 text-xs font-medium">{DOC_TYPE_LABELS[identity.docType] || identity.docType}</span>
                {identity.institution && <span className="text-white/40 text-xs">· {identity.institution}</span>}
                {identity.dateRange && <span className="text-white/30 text-xs">· {identity.dateRange}</span>}
                <span className={`text-xs px-1.5 py-0.5 rounded ${identity.isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {identity.isIncome ? '↑ Income' : '↓ Expense'}
                </span>
                {identity.confidence === 'low' && (
                  <span className="text-xs text-amber-400/60 flex items-center gap-1"><AlertTriangle size={10} /> low confidence</span>
                )}
              </div>
              <p className="text-white/30 text-xs mt-1 truncate">{identity.summary}</p>
            </div>
          )}

          {item.status === 'ready' && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded border ${SECTION_COLORS[section] || ''}`}>
                {SECTION_LABELS[section] || section}
              </span>
              <span className="text-white/40 text-xs truncate">{item.summary}</span>
            </div>
          )}

          {item.status === 'confirmed' && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-emerald-400 text-xs">Saved to {SECTION_LABELS[section] || section}</p>
              {item.drive_link && (
                <a href={item.drive_link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 underline">View in Drive</a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* STEP 3: Approve identified document */}
          {item.status === 'identified' && (
            <>
              <button onClick={onToggleExpand} className="text-white/20 hover:text-white/50 p-1.5 transition-colors">
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button onClick={() => onApprove(edits)} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Check size={13} /> Approve
              </button>
            </>
          )}

          {/* STEP 5: Confirm extracted data */}
          {item.status === 'ready' && (
            <>
              <button onClick={onToggleExpand} className="text-white/20 hover:text-white/50 p-1.5 transition-colors">
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button onClick={onConfirm} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Check size={13} /> Save
              </button>
            </>
          )}

          {(item.status === 'ready' || item.status === 'identified' || item.status === 'error' || item.status === 'confirmed') && (
            <button onClick={onDismiss} className="text-white/15 hover:text-rose-400 p-1.5 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded edit panel */}
      {isExpanded && (item.status === 'identified' || item.status === 'ready') && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <p className="text-white/25 text-xs mb-3 uppercase tracking-wider font-medium">
            {item.status === 'identified' ? 'Correct if needed, then Approve' : 'Review before saving'}
          </p>

          {/* Section override */}
          {item.status === 'identified' && (
            <div className="mb-3">
              <p className="text-white/40 text-xs mb-1">Route to section</p>
              <div className="flex gap-2 flex-wrap">
                {['spending','taxes','airbnb','investments'].map(s => (
                  <button
                    key={s}
                    onClick={() => onPatchEdit({ section: s })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${(merged.section || identity?.section) === s ? SECTION_COLORS[s] : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                  >
                    {SECTION_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(section === 'spending') && (
            <EditInput label="Account Name" value={merged.account_name || identity?.institution || ''} onChange={v => onPatchEdit({ account_name: v })} placeholder="e.g. Chase Checking" />
          )}

          {section === 'taxes' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-white/40 text-xs mb-1">Type</p>
                <select value={merged.tax_type || 'other'} onChange={e => onPatchEdit({ tax_type: e.target.value })} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                  {TAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <EditInput label="Year" value={String(merged.tax_year || new Date().getFullYear())} onChange={v => onPatchEdit({ tax_year: parseInt(v) })} placeholder="2026" />
              <EditInput label="Payer" value={merged.tax_payer || identity?.institution || ''} onChange={v => onPatchEdit({ tax_payer: v })} placeholder="e.g. Airbnb" />
              <EditInput label="Amount ($)" value={String(merged.tax_amount || '')} onChange={v => onPatchEdit({ tax_amount: parseFloat(v) || 0 })} placeholder="0.00" />
            </div>
          )}

          {section === 'airbnb' && (
            <div>
              <p className="text-white/40 text-xs mb-1">Property</p>
              <select value={merged.property_name || PROPERTIES[0]} onChange={e => onPatchEdit({ property_name: e.target.value })} className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {section === 'investments' && (
            <EditInput label="Account Name" value={merged.account_name || identity?.institution || ''} onChange={v => onPatchEdit({ account_name: v })} placeholder="e.g. Robinhood" />
          )}
        </div>
      )}
    </div>
  )
}

function EditInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-white/20" />
    </div>
  )
}
