'use client'

import { useState, useRef } from 'react'
import { useFinanceData } from '@/lib/useFinanceData'
import { AirbnbEntry } from '@/types/finance'
import FinanceShell from '@/components/finance/FinanceShell'
import CSVUploader from '@/components/finance/CSVUploader'
import DocumentUploader, { ParsedDocument } from '@/components/finance/DocumentUploader'
import { Plus, Trash2, Loader2, Sparkles, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }

const PROPERTIES = ['Zen Den', 'Still Nest', 'Zen Nest']

const EXPENSE_TYPES: AirbnbEntry['type'][] = [
  'income','cleaning_fee','airbnb_fee','mortgage','utility','supply','repair','insurance','depreciation','tax','other_expense'
]

const TYPE_LABELS: Record<AirbnbEntry['type'], string> = {
  income: 'Gross Income',
  expense: 'Expense',
  cleaning_fee: 'Cleaning Fees (host)',
  airbnb_fee: 'Airbnb Platform Fees',
  mortgage: 'Mortgage',
  utility: 'Utilities',
  supply: 'Supplies',
  repair: 'Repairs & Maintenance',
  insurance: 'Insurance',
  depreciation: 'Depreciation (tax only)',
  tax: 'Property Tax',
  other_expense: 'Other Expense',
}

function calcPL(entries: AirbnbEntry[], includeTaxItems: boolean) {
  const income = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const cleaningIncome = entries.filter(e => e.type === 'cleaning_fee' && e.amount > 0).reduce((s, e) => s + e.amount, 0)
  const expenses = entries.filter(e => {
    if (e.type === 'income') return false
    if (!includeTaxItems && (e.type === 'depreciation' || e.type === 'tax')) return false
    return true
  }).reduce((s, e) => s + Math.abs(e.amount), 0)
  return { income, cleaningIncome, expenses, net: income + cleaningIncome - expenses }
}

export default function AirbnbPage() {
  const { airbnbEntries, loading, addAirbnbEntries, deleteAirbnbEntry } = useFinanceData()
  const [tab, setTab] = useState<'true' | 'tax'>('true')
  const [year, setYear] = useState(2026)
  const [property, setProperty] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [importToast, setImportToast] = useState('')
  const [form, setForm] = useState({
    propertyName: PROPERTIES[0],
    type: 'income' as AirbnbEntry['type'],
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  })

  function showToast(msg: string) {
    setImportToast(msg)
    setTimeout(() => setImportToast(''), 4000)
  }

  async function addEntry() {
    if (!form.amount) return
    const entry: AirbnbEntry = {
      id: `airbnb_${Date.now()}`,
      propertyName: form.propertyName,
      date: form.date,
      type: form.type,
      description: form.description || TYPE_LABELS[form.type],
      amount: parseFloat(form.amount),
      year,
    }
    await addAirbnbEntries([entry])
    setForm(f => ({ ...f, amount: '', description: '' }))
    setShowAdd(false)
  }

  async function handleCSV(rows: Record<string, string>[]) {
    const entries: AirbnbEntry[] = rows.map((row, i) => {
      const amount = parseFloat((row['Amount'] || row['Gross Earnings'] || row['amount'] || '0').replace(/[,$]/g, ''))
      const type: AirbnbEntry['type'] = amount > 0 ? 'income' : 'other_expense'
      const date = row['Date'] || row['Paid Out'] || new Date().toISOString().slice(0, 10)
      const propName = row['Listing'] || (property !== 'All' ? property : PROPERTIES[0])
      return {
        id: `airbnb_csv_${Date.now()}_${i}`,
        propertyName: propName,
        date,
        type,
        description: row['Type'] || row['Description'] || 'Airbnb Payout',
        amount,
        year: parseInt(date.slice(0, 4)) || year,
      }
    }).filter(e => !isNaN(e.amount))
    await addAirbnbEntries(entries)
    showToast(`✓ ${entries.length} rows imported from CSV`)
  }

  async function handleAIParsed(result: ParsedDocument) {
    const d = result.data
    const docType = (d.docType as string) || ''
    const propName = (d.propertyHint as string) || (property !== 'All' ? property : PROPERTIES[0])
    const today = new Date().toISOString().slice(0, 10)

    if (docType === 'airbnb_income' || docType === 'airbnb_earnings') {
      // Airbnb earnings/payout statement — may have a transactions array or a single total
      const txns = d.transactions as { date?: string; description?: string; amount?: number; type?: string }[] | undefined
      if (txns && txns.length > 0) {
        const entries: AirbnbEntry[] = txns.map((t, i) => ({
          id: `airbnb_ai_${Date.now()}_${i}`,
          propertyName: (t.description?.includes('Zen Den') ? 'Zen Den' : t.description?.includes('Still Nest') ? 'Still Nest' : t.description?.includes('Zen Nest') ? 'Zen Nest' : propName),
          date: t.date || today,
          type: (Number(t.amount) >= 0 ? 'income' : 'other_expense') as AirbnbEntry['type'],
          description: t.description || 'Airbnb Payout',
          amount: Number(t.amount) || 0,
          year: parseInt((t.date || today).slice(0, 4)) || year,
        })).filter(e => e.amount !== 0)
        await addAirbnbEntries(entries)
        showToast(`✓ ${entries.length} Airbnb payouts imported`)
      } else {
        // Single total payout
        const entry: AirbnbEntry = {
          id: `airbnb_ai_${Date.now()}`,
          propertyName: propName,
          date: (d.date as string) || today,
          type: 'income',
          description: `Airbnb Earnings — ${result.fileName}`,
          amount: Math.abs(Number(d.amount ?? d.totalEarnings ?? d.grossEarnings ?? 0)),
          year,
        }
        if (entry.amount > 0) { await addAirbnbEntries([entry]); showToast(`✓ Airbnb earnings added: $${entry.amount.toFixed(0)}`) }
        else showToast('⚠ No amount found — check document or add manually')
      }
    } else if (docType === 'expense' || docType === 'utility_bill' || docType === 'mortgage_statement' || docType === 'insurance') {
      const typeMap: Record<string, AirbnbEntry['type']> = {
        utility_bill: 'utility',
        mortgage_statement: 'mortgage',
        insurance: 'insurance',
        expense: 'other_expense',
      }
      const entry: AirbnbEntry = {
        id: `airbnb_ai_${Date.now()}`,
        propertyName: propName,
        date: (d.date as string) || today,
        type: typeMap[docType] || 'other_expense',
        description: (d.merchant as string) || (d.lender as string) || (d.institution as string) || result.fileName,
        amount: -(Math.abs(Number(d.amount ?? d.box1_interestPaid ?? 0))),
        year,
      }
      if (entry.amount !== 0) { await addAirbnbEntries([entry]); showToast(`✓ ${entry.description} added`) }
      else showToast('⚠ No amount found — add manually')
    } else if (docType === 'bank_statement' || docType === 'credit_card') {
      const txns = d.transactions as { date?: string; description?: string; amount?: number }[] | undefined
      if (txns && txns.length > 0) {
        const entries: AirbnbEntry[] = txns.map((t, i) => ({
          id: `airbnb_ai_${Date.now()}_${i}`,
          propertyName: propName,
          date: t.date || today,
          type: (Number(t.amount) >= 0 ? 'income' : 'other_expense') as AirbnbEntry['type'],
          description: t.description || 'Transaction',
          amount: Number(t.amount) || 0,
          year: parseInt((t.date || today).slice(0, 4)) || year,
        })).filter(e => e.amount !== 0)
        await addAirbnbEntries(entries)
        showToast(`✓ ${entries.length} transactions imported`)
      }
    } else {
      // Fallback — try to extract any amount as a generic expense
      const amount = Number(d.amount ?? d.totalAmount ?? d.total ?? 0)
      if (amount !== 0) {
        const entry: AirbnbEntry = {
          id: `airbnb_ai_${Date.now()}`,
          propertyName: propName,
          date: (d.date as string) || today,
          type: amount > 0 ? 'income' : 'other_expense',
          description: (d.merchant as string) || (d.institution as string) || result.fileName,
          amount,
          year,
        }
        await addAirbnbEntries([entry])
        showToast(`✓ Entry added (${docType || 'document'})`)
      } else {
        showToast(`⚠ Parsed as "${docType || 'unknown'}" but no amount found — add manually`)
      }
    }
    setShowAI(false)
  }

  if (loading) return <FinanceShell><div className="flex justify-center h-64 items-center"><Loader2 size={28} className="text-indigo-400 animate-spin" /></div></FinanceShell>

  const filteredEntries = airbnbEntries.filter(e => {
    if (e.year !== year) return false
    if (property !== 'All' && e.propertyName !== property) return false
    return true
  })

  const pl = calcPL(filteredEntries, tab === 'tax')
  const propertyBreakdown = (property === 'All' ? PROPERTIES : [property]).map(p => ({
    name: p, pl: calcPL(filteredEntries.filter(e => e.propertyName === p), tab === 'tax'), count: filteredEntries.filter(e => e.propertyName === p).length
  }))

  return (
    <FinanceShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Airbnb P&L</h1>
          <p className="text-white/40 text-sm mt-1">Zen Den · Still Nest · Zen Nest</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="flex bg-[#16181f] border border-white/5 rounded-lg overflow-hidden">
          <button onClick={() => setTab('true')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'true' ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>True P&L</button>
          <button onClick={() => setTab('tax')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'tax' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'}`}>Tax P&L</button>
        </div>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="bg-[#16181f] border border-white/5 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
        <select value={property} onChange={e => setProperty(e.target.value)} className="bg-[#16181f] border border-white/5 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
          <option value="All">All Properties</option>
          {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {tab === 'tax' && (
        <div className="mb-4 bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-3 text-sm text-violet-300">
          Tax P&L includes depreciation and property taxes to maximize deductions.
        </div>
      )}

      {showAdd && (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Add Entry</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Property</label>
              <select value={form.propertyName} onChange={e => setForm(f => ({ ...f, propertyName: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AirbnbEntry['type'] }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1200" className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none placeholder-white/20" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Description (optional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes..." className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none placeholder-white/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg">Save Entry</button>
            <button onClick={() => setShowAdd(false)} className="bg-white/5 text-white text-sm px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Import toast */}
      {importToast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${importToast.startsWith('⚠') ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'}`}>
          {importToast}
        </div>
      )}

      {/* Sync from Spending */}
      <SyncFromSpending properties={PROPERTIES} onSynced={() => window.location.reload()} />

      {/* Import section */}
      <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-6">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Import Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wider">Airbnb Earnings</p>
            <AirbnbUploader onCSV={handleCSV} onAI={handleAIParsed} />
            <p className="text-white/20 text-xs mt-1.5">CSV or PDF — Airbnb → Earnings → Export</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wider">✦ Receipt / Bill / Statement</p>
            <DocumentUploader label="Drop receipt, bill, or statement" hint="Utility bill, repair receipt, mortgage — Claude extracts the amount" onParsed={handleAIParsed} />
            <p className="text-white/20 text-xs mt-1.5">Any expense receipt or property document</p>
          </div>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Income', value: pl.income, positive: true },
          { label: 'Total Expenses', value: pl.expenses },
          { label: 'Net Profit', value: pl.net, highlight: true },
          { label: 'Entries', value: filteredEntries.length, isCount: true },
        ].map(({ label, value, positive, highlight, isCount }) => (
          <div key={label} className={`rounded-xl border p-4 ${highlight ? (value >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20') : 'bg-[#16181f] border-white/5'}`}>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            {isCount ? (
              <p className="text-white font-bold text-xl">{value}</p>
            ) : (
              <p className={`font-bold text-xl ${highlight ? (value >= 0 ? 'text-emerald-400' : 'text-rose-400') : positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(Math.abs(value))}
              </p>
            )}
          </div>
        ))}
      </div>

      {property === 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {propertyBreakdown.map(p => (
            <div key={p.name} className="bg-[#16181f] border border-white/5 rounded-xl p-4">
              <p className="text-white font-semibold text-sm mb-3">{p.name}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-white/40">Income</span><span className="text-emerald-400">{fmt(p.pl.income)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Expenses</span><span className="text-rose-400">({fmt(p.pl.expenses)})</span></div>
                <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span className="text-white/60 font-medium">Net</span><span className={p.pl.net >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{fmt(p.pl.net)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#16181f] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Line Items</h3>
          <span className="text-white/30 text-xs">{filteredEntries.length} entries</span>
        </div>
        {filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">No entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="text-left text-white/30 font-medium px-4 py-2">Date</th>
                <th className="text-left text-white/30 font-medium px-4 py-2">Property</th>
                <th className="text-left text-white/30 font-medium px-4 py-2">Type</th>
                <th className="text-left text-white/30 font-medium px-4 py-2">Description</th>
                <th className="text-right text-white/30 font-medium px-4 py-2">Amount</th>
                <th className="px-4 py-2" />
              </tr></thead>
              <tbody>
                {filteredEntries.map(e => (
                  <tr key={e.id} className="border-b border-white/3 hover:bg-white/2">
                    <td className="px-4 py-2.5 text-white/40">{e.date}</td>
                    <td className="px-4 py-2.5 text-white/60">{e.propertyName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === 'income' ? 'bg-emerald-500/15 text-emerald-400' : e.type === 'depreciation' || e.type === 'tax' ? 'bg-violet-500/15 text-violet-400' : 'bg-rose-500/15 text-rose-400'}`}>
                        {TYPE_LABELS[e.type]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-white/60">{e.description}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${e.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {e.type === 'income' ? '+' : '-'}{fmt(Math.abs(e.amount))}
                    </td>
                    <td className="px-4 py-2.5"><button onClick={() => deleteAirbnbEntry(e.id)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FinanceShell>
  )
}

// ── Sync from Spending ────────────────────────────────────────────────────────

interface SyncMatch {
  transaction: { id: string; date: string; description: string; amount: number; category: string }
  rule: { keyword: string; displayName: string; property: string; type: string; pct: number }
  airbnbAmount: number
  alreadySynced: boolean
}

function SyncFromSpending({ properties, onSynced }: { properties: string[]; onSynced: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [matches, setMatches] = useState<SyncMatch[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [propertyMap, setPropertyMap] = useState<Record<string, string>>({})
  const [done, setDone] = useState<number | null>(null)

  async function preview() {
    setLoading(true)
    setDone(null)
    const res = await fetch('/api/finance/airbnb/sync')
    const json = await res.json()
    const newMatches: SyncMatch[] = json.matches || []
    setMatches(newMatches)
    // Pre-select all unsynced
    const unsynced = new Set(newMatches.filter((m: SyncMatch) => !m.alreadySynced).map((m: SyncMatch) => m.transaction.id))
    setSelected(unsynced)
    // Default property map
    const pm: Record<string, string> = {}
    newMatches.forEach((m: SyncMatch) => { pm[m.transaction.id] = properties[0] })
    setPropertyMap(pm)
    setLoading(false)
    setOpen(true)
  }

  async function sync() {
    setSyncing(true)
    const res = await fetch('/api/finance/airbnb/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionIds: [...selected], propertyOverrides: propertyMap }),
    })
    const json = await res.json()
    setDone(json.synced)
    setSyncing(false)
    setOpen(false)
    onSynced()
  }

  const newCount = matches.filter(m => !m.alreadySynced).length

  return (
    <div className="bg-[#16181f] border border-violet-500/20 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Pull Expenses from Spending</h3>
          </div>
          <p className="text-white/30 text-xs">
            Scrapes your transactions for mortgages, Starlink, Wolf Creek, Haynes &amp; Co, cleaning, Amazon (80%), and more
          </p>
        </div>
        <button
          onClick={preview}
          disabled={loading}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {done !== null && (
        <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle size={14} /> {done} expense{done !== 1 ? 's' : ''} added to Airbnb P&amp;L
        </div>
      )}

      {open && matches.length > 0 && (
        <div className="mt-5 border-t border-white/5 pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm font-medium">
              {newCount} new match{newCount !== 1 ? 'es' : ''} found
              {matches.length - newCount > 0 && <span className="text-white/25 ml-2">· {matches.length - newCount} already synced</span>}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set(matches.filter(m => !m.alreadySynced).map(m => m.transaction.id)))}
                className="text-xs text-white/40 hover:text-white transition-colors">Select all</button>
              <button onClick={() => setSelected(new Set())}
                className="text-xs text-white/40 hover:text-white transition-colors">None</button>
            </div>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto mb-4">
            {matches.map(m => (
              <div key={m.transaction.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                m.alreadySynced ? 'opacity-40' : selected.has(m.transaction.id) ? 'bg-violet-500/8' : 'hover:bg-white/3'
              }`}>
                <input
                  type="checkbox"
                  checked={selected.has(m.transaction.id)}
                  disabled={m.alreadySynced}
                  onChange={e => {
                    setSelected(prev => {
                      const n = new Set(prev)
                      e.target.checked ? n.add(m.transaction.id) : n.delete(m.transaction.id)
                      return n
                    })
                  }}
                  className="accent-violet-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs font-medium truncate">{m.rule.displayName}</span>
                    {m.rule.pct < 100 && (
                      <span className="text-violet-400 text-[10px] bg-violet-500/10 px-1.5 py-0.5 rounded">{m.rule.pct}%</span>
                    )}
                    {m.alreadySynced && <span className="text-emerald-400 text-[10px]">✓ synced</span>}
                  </div>
                  <span className="text-white/25 text-[11px]">{m.transaction.date} · {m.transaction.description}</span>
                </div>
                {/* Property selector */}
                {!m.alreadySynced && selected.has(m.transaction.id) && (
                  <select
                    value={propertyMap[m.transaction.id] || properties[0]}
                    onChange={e => setPropertyMap(prev => ({ ...prev, [m.transaction.id]: e.target.value }))}
                    className="bg-white/5 border border-white/10 text-white/60 text-xs rounded px-2 py-1 focus:outline-none flex-shrink-0"
                  >
                    {properties.map(p => <option key={p} value={p} style={{ background: '#1e2028' }}>{p}</option>)}
                    <option value="all" style={{ background: '#1e2028' }}>All Properties</option>
                  </select>
                )}
                <span className={`text-sm font-semibold flex-shrink-0 w-16 text-right ${m.airbnbAmount > 0 ? 'text-rose-400' : 'text-white/30'}`}>
                  ${m.airbnbAmount.toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={sync}
              disabled={syncing || selected.size === 0}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {syncing ? 'Syncing...' : `Add ${selected.size} to Airbnb P&L`}
            </button>
            <button onClick={() => setOpen(false)} className="text-white/30 text-sm hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {open && matches.length === 0 && !loading && (
        <p className="mt-4 text-white/30 text-sm">No matching transactions found. Upload bank statements first.</p>
      )}
    </div>
  )
}

// ── Unified CSV + PDF uploader for Airbnb earnings ───────────────────────────

function AirbnbUploader({ onCSV, onAI }: {
  onCSV: (rows: Record<string, string>[]) => void
  onAI: (doc: ParsedDocument) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setStatus('loading')
    setMessage('')

    if (file.name.toLowerCase().endsWith('.csv')) {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          if (results.data.length === 0) {
            setStatus('error'); setMessage('No rows found in CSV'); return
          }
          setStatus('success'); setMessage(`${results.data.length} rows loaded`)
          onCSV(results.data)
        },
        error(err) { setStatus('error'); setMessage(err.message) },
      })
    } else {
      // PDF or image — send to Claude
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/finance/parse-document', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Parse failed')
        setStatus('success'); setMessage('PDF parsed successfully')
        onAI({ docType: json.data?.docType, fileName: json.fileName, data: json.data })
      } catch (e) {
        setStatus('error'); setMessage(e instanceof Error ? e.message : 'Failed to parse PDF')
      }
    }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-indigo-500 bg-indigo-500/10' :
        status === 'loading' ? 'border-indigo-500/30 bg-indigo-500/5 cursor-wait' :
        'border-white/10 hover:border-white/20 bg-white/2'
      }`}
    >
      <input ref={inputRef} type="file" accept=".csv,.pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />
      {status === 'loading' ? (
        <Loader2 size={28} className="text-indigo-400 mx-auto mb-2 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
      ) : status === 'error' ? (
        <AlertCircle size={28} className="text-rose-400 mx-auto mb-2" />
      ) : (
        <Upload size={28} className="text-white/30 mx-auto mb-2" />
      )}
      <p className="text-white/70 text-sm font-medium">Drop Airbnb earnings CSV or PDF</p>
      <p className="text-white/30 text-xs mt-1">{message || 'CSV or PDF accepted'}</p>
    </div>
  )
}
