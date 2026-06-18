'use client'

import { useState, useEffect, useMemo } from 'react'
import FinanceShell from '@/components/finance/FinanceShell'
import {
  FolderOpen, FileText, CreditCard, Home, TrendingUp,
  ExternalLink, Pencil, Check, X, Trash2, Loader2,
  ChevronDown, ChevronRight, Search
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocItem {
  id: string
  file_name: string
  file_size: number
  status: string
  section: string
  label: string
  summary: string
  account_name?: string
  property_name?: string
  tax_year?: number
  tax_type?: string
  tax_payer?: string
  tax_amount?: number
  drive_link?: string
  identity?: {
    docType: string
    institution?: string
    dateRange?: string
    isIncome?: boolean
    summary?: string
  }
  created_at: string
}

// ── Config ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'spending', label: 'Spending & Bank', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'taxes', label: 'Taxes', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'airbnb', label: 'Airbnb', icon: Home, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { key: 'investments', label: 'Investments', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'other', label: 'Other', icon: FolderOpen, color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10' },
]

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [items, setItems] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editSection, setEditSection] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/finance/inbox')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Group by section ────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = items.filter(i =>
      !q ||
      i.file_name.toLowerCase().includes(q) ||
      i.label?.toLowerCase().includes(q) ||
      i.account_name?.toLowerCase().includes(q) ||
      i.identity?.institution?.toLowerCase().includes(q) ||
      i.summary?.toLowerCase().includes(q)
    )

    const map: Record<string, DocItem[]> = {}
    filtered.forEach(item => {
      const s = item.section || 'other'
      if (!map[s]) map[s] = []
      map[s].push(item)
    })
    // Sort each group newest first
    Object.values(map).forEach(arr => arr.sort((a, b) => b.created_at.localeCompare(a.created_at)))
    return map
  }, [items, search])

  const totalDocs = items.length
  const confirmedDocs = items.filter(i => i.status === 'confirmed').length

  // ── Edit helpers ────────────────────────────────────────────────────────────
  function startEdit(item: DocItem) {
    setEditing(item.id)
    setEditLabel(item.label || item.file_name)
    setEditSection(item.section || 'spending')
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await fetch('/api/finance/inbox', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, label: editLabel, section: editSection }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, label: editLabel, section: editSection } : i))
    setEditing(null)
    setSaving(false)
  }

  async function deleteItem(id: string) {
    await fetch('/api/finance/inbox', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function toggleSection(key: string) {
    setCollapsedSections(prev => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  }

  if (loading) return (
    <FinanceShell>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    </FinanceShell>
  )

  return (
    <FinanceShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FolderOpen size={22} className="text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Documents</h1>
          </div>
          <p className="text-white/30 text-sm">
            {totalDocs} file{totalDocs !== 1 ? 's' : ''} uploaded
            {confirmedDocs > 0 && ` · ${confirmedDocs} processed`}
          </p>
        </div>
      </div>

      {/* Search */}
      {totalDocs > 0 && (
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by filename, institution, label..."
            className="w-full bg-[#16181f] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      )}

      {totalDocs === 0 ? (
        <div className="text-center py-20 text-white/20">
          <FolderOpen size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No documents yet</p>
          <p className="text-sm">Upload files in the Inbox — they'll be organized here automatically</p>
        </div>
      ) : (
        <div className="space-y-5">
          {SECTIONS.map(sec => {
            const docs = grouped[sec.key] || []
            if (docs.length === 0 && !search) return null
            if (docs.length === 0) return null
            const isCollapsed = collapsedSections.has(sec.key)
            const Icon = sec.icon

            return (
              <div key={sec.key} className={`rounded-2xl border ${sec.border} overflow-hidden`}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(sec.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${sec.bg} flex items-center justify-center`}>
                    <Icon size={15} className={sec.color} />
                  </div>
                  <span className="text-white font-semibold flex-1 text-left">{sec.label}</span>
                  <span className="text-white/30 text-sm">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
                  {isCollapsed ? <ChevronRight size={15} className="text-white/20" /> : <ChevronDown size={15} className="text-white/20" />}
                </button>

                {/* Document rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-white/5">
                    {docs.map(item => (
                      <DocRow
                        key={item.id}
                        item={item}
                        isEditing={editing === item.id}
                        editLabel={editLabel}
                        editSection={editSection}
                        saving={saving}
                        onStartEdit={() => startEdit(item)}
                        onSaveEdit={() => saveEdit(item.id)}
                        onCancelEdit={() => setEditing(null)}
                        onDelete={() => deleteItem(item.id)}
                        onLabelChange={setEditLabel}
                        onSectionChange={setEditSection}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </FinanceShell>
  )
}

// ── Doc Row ───────────────────────────────────────────────────────────────────

function DocRow({
  item, isEditing, editLabel, editSection, saving,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  onLabelChange, onSectionChange,
}: {
  item: DocItem
  isEditing: boolean
  editLabel: string
  editSection: string
  saving: boolean
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onLabelChange: (v: string) => void
  onSectionChange: (v: string) => void
}) {
  const statusDot: Record<string, string> = {
    confirmed: 'bg-emerald-400',
    ready: 'bg-indigo-400',
    identified: 'bg-amber-400',
    processing: 'bg-indigo-400 animate-pulse',
    approved: 'bg-indigo-400 animate-pulse',
    queued: 'bg-white/20',
    error: 'bg-rose-400',
  }

  const displayLabel = item.label || item.file_name.replace(/\.[^.]+$/, '')
  const institution = item.identity?.institution || item.account_name || ''
  const dateRange = item.identity?.dateRange || ''

  return (
    <div className="px-5 py-4 hover:bg-white/2 transition-colors group">
      {isEditing ? (
        /* Edit mode */
        <div className="space-y-3">
          <div>
            <label className="text-white/30 text-xs mb-1 block">Label</label>
            <input
              value={editLabel}
              onChange={e => onLabelChange(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-white/30 text-xs mb-1 block">Section</label>
            <div className="flex gap-2 flex-wrap">
              {SECTIONS.filter(s => s.key !== 'other').map(s => (
                <button
                  key={s.key}
                  onClick={() => onSectionChange(s.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${editSection === s.key ? `${s.bg} ${s.border} ${s.color}` : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onSaveEdit} disabled={saving} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
            </button>
            <button onClick={onCancelEdit} className="text-xs bg-white/5 text-white/50 px-3 py-1.5 rounded-lg"><X size={12} /></button>
          </div>
        </div>
      ) : (
        /* View mode */
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[item.status] || 'bg-white/10'}`} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white text-sm font-medium">{displayLabel}</span>
              {institution && <span className="text-white/35 text-xs">· {institution}</span>}
              {dateRange && <span className="text-white/25 text-xs">· {dateRange}</span>}
              {item.identity?.isIncome !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${item.identity.isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {item.identity.isIncome ? '↑ Income' : '↓ Expense'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-white/20 text-xs truncate max-w-[260px]">{item.file_name}</span>
              {item.file_size > 0 && <span className="text-white/15 text-xs">{fmt(item.file_size)}</span>}
              <span className="text-white/15 text-xs">{fmtDate(item.created_at)}</span>
              {item.status === 'error' && <span className="text-rose-400 text-xs">Error</span>}
            </div>
          </div>

          {/* Actions — show on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.drive_link && (
              <a
                href={item.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-white/20 hover:text-indigo-400 transition-colors"
                title="View in Google Drive"
              >
                <ExternalLink size={14} />
              </a>
            )}
            <button onClick={onStartEdit} className="p-1.5 text-white/20 hover:text-white transition-colors" title="Rename / move">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-white/15 hover:text-rose-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
