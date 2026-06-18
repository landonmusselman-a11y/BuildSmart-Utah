'use client'

import { useState } from 'react'
import { useFinanceData } from '@/lib/useFinanceData'
import { TaxDocument } from '@/types/finance'
import FinanceShell from '@/components/finance/FinanceShell'
import DocumentUploader, { ParsedDocument } from '@/components/finance/DocumentUploader'
import { FileText, Trash2, AlertCircle, Loader2, Sparkles } from 'lucide-react'

const DOC_TYPES: TaxDocument['type'][] = ['1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV','W2','K1','mortgage_interest','property_tax','other']
const DOC_LABELS: Record<TaxDocument['type'], string> = {
  '1099-NEC': '1099-NEC', '1099-MISC': '1099-MISC', '1099-K': '1099-K (Airbnb/payments)',
  '1099-INT': '1099-INT (Interest)', '1099-DIV': '1099-DIV (Dividends)', 'W2': 'W-2',
  'K1': 'K-1', 'mortgage_interest': 'Mortgage Interest (1098)', 'property_tax': 'Property Tax', 'other': 'Other',
}

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }

export default function TaxesPage() {
  const { taxDocuments, airbnbEntries, loading, addTaxDocument, deleteTaxDocument } = useFinanceData()
  const [year, setYear] = useState<2025 | 2026>(2025)
  const [showAdd, setShowAdd] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [form, setForm] = useState({ type: '1099-K' as TaxDocument['type'], description: '', payer: '', amount: '', fileName: '' })

  function handleAIParsed(result: ParsedDocument) {
    const d = result.data
    let type: TaxDocument['type'] = 'other'
    let payer = ''
    let amount = 0
    let docYear: number = year

    const docTypeStr = (d.docType as string) || ''

    if (docTypeStr === '1098' || docTypeStr === 'mortgage') {
      // Form 1098 — Mortgage Interest Statement
      type = 'mortgage_interest'
      payer = (d.lender as string) || ''
      // Box 1 is always the deductible mortgage interest
      amount = Number(d.box1_interestPaid ?? d.interest ?? d.interestPaid ?? d.box1 ?? 0)
      docYear = Number(d.year) || year
    } else if (docTypeStr.startsWith('1099') || docTypeStr.includes('1099')) {
      type = (DOC_TYPES.includes(docTypeStr as TaxDocument['type']) ? docTypeStr : '1099-NEC') as TaxDocument['type']
      payer = (d.payer as string) || ''
      amount = Number(d.amount ?? d.ordinaryDividends ?? 0)
      docYear = Number(d.year) || year
    } else if (docTypeStr === 'W2') {
      type = 'W2'
      payer = (d.employer as string) || ''
      amount = Number(d.wagesBox1) || 0
      docYear = Number(d.year) || year
    } else if (docTypeStr === 'K1') {
      type = 'K1'
      payer = (d.partnership as string) || ''
      amount = Number(d.ordinaryIncome ?? d.amount ?? 0)
      docYear = Number(d.year) || year
    } else if (docTypeStr === 'property_tax') {
      type = 'property_tax'
      payer = (d.assessor as string) || ''
      amount = Number(d.amount) || 0
      docYear = Number(d.year) || year
    }

    const doc: TaxDocument = {
      id: `tax_ai_${Date.now()}`,
      year: (docYear === 2025 || docYear === 2026) ? docYear : year,
      type,
      description: `Imported from ${result.fileName}`,
      payer,
      amount,
      uploadedAt: new Date().toISOString(),
      fileName: result.fileName,
    }
    addTaxDocument(doc)
    setShowAI(false)
  }

  async function addDoc() {
    if (!form.payer) return
    const doc: TaxDocument = {
      id: `tax_${Date.now()}`,
      year,
      type: form.type,
      description: form.description || DOC_LABELS[form.type],
      payer: form.payer,
      amount: parseFloat(form.amount) || 0,
      uploadedAt: new Date().toISOString(),
      fileName: form.fileName,
    }
    await addTaxDocument(doc)
    setForm({ type: '1099-K', description: '', payer: '', amount: '', fileName: '' })
    setShowAdd(false)
  }

  if (loading) return <FinanceShell><div className="flex justify-center h-64 items-center"><Loader2 size={28} className="text-indigo-400 animate-spin" /></div></FinanceShell>

  const docs = taxDocuments.filter(d => d.year === year)
  const totalIncome = docs.filter(d => ['1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV','W2'].includes(d.type)).reduce((s, d) => s + d.amount, 0)
  const totalDeductions = docs.filter(d => ['mortgage_interest','property_tax'].includes(d.type)).reduce((s, d) => s + d.amount, 0)
  const airbnbEntries_year = airbnbEntries.filter(e => e.year === year)
  const airbnbIncome = airbnbEntries_year.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const airbnbExpenses = airbnbEntries_year.filter(e => e.type !== 'income').reduce((s, e) => s + Math.abs(e.amount), 0)
  const airbnbNet = airbnbIncome - airbnbExpenses

  return (
    <FinanceShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Taxes</h1>
          <p className="text-white/40 text-sm mt-1">Documents, Airbnb P&L, and filing checklist</p>
        </div>
      </div>

      <div className="flex bg-[#16181f] border border-white/5 rounded-lg overflow-hidden w-fit mb-6">
        {([2025, 2026] as const).map(y => (
          <button key={y} onClick={() => setYear(y)} className={`px-6 py-2.5 text-sm font-medium transition-colors ${year === y ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}>
            {y} Taxes
            {y === 2025 && <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Unfiled</span>}
          </button>
        ))}
      </div>

      {year === 2025 && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">2025 Taxes Not Yet Filed</p>
            <p className="text-amber-400/60 text-xs mt-0.5">Extended deadline: October 15, 2025. Upload all documents below to prepare.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Reported Income</p>
          <p className="text-white font-bold text-xl">{fmt(totalIncome)}</p>
          <p className="text-white/25 text-xs">from {docs.filter(d => ['1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV','W2'].includes(d.type)).length} docs</p>
        </div>
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Deductions</p>
          <p className="text-emerald-400 font-bold text-xl">{fmt(totalDeductions)}</p>
          <p className="text-white/25 text-xs">mortgage + property tax</p>
        </div>
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Airbnb Net ({year})</p>
          <p className={`font-bold text-xl ${airbnbNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(airbnbNet)}</p>
          <p className="text-white/25 text-xs">from Tax P&L</p>
        </div>
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Documents</p>
          <p className="text-white font-bold text-xl">{docs.length}</p>
          <p className="text-white/25 text-xs">uploaded for {year}</p>
        </div>
      </div>

      {airbnbEntries_year.length > 0 && (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Airbnb Tax P&L — {year}</h3>
            <a href="/finance/airbnb" className="text-indigo-400 text-xs hover:underline">Edit in Airbnb →</a>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-white/40 text-xs">Gross Income</p><p className="text-emerald-400 font-medium">{fmt(airbnbIncome)}</p></div>
            <div><p className="text-white/40 text-xs">Total Expenses</p><p className="text-rose-400 font-medium">({fmt(airbnbExpenses)})</p></div>
            <div><p className="text-white/40 text-xs">Net</p><p className={`font-bold ${airbnbNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(airbnbNet)}</p></div>
          </div>
        </div>
      )}

      {/* AI Upload — always visible */}
      <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-6">
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">✦ Upload Tax Document — Claude reads it automatically</p>
        <DocumentUploader label="Drop 1099, W-2, 1098, or any tax document" hint="PDF, photo, or screenshot — Claude extracts all fields automatically" onParsed={handleAIParsed} />
        <p className="text-white/20 text-xs mt-2">Supports 1099-K, 1099-NEC, W-2, 1098 mortgage interest, property tax, K-1, and more</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Tax Documents — {year}</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">+ Add Manually</button>
      </div>

      {showAdd && (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TaxDocument['type'] }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
                {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Payer / Source</label>
              <input value={form.payer} onChange={e => setForm(f => ({ ...f, payer: e.target.value }))} placeholder="e.g. Airbnb, Robinhood" className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none placeholder-white/20" />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Amount</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addDoc} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)} className="bg-white/5 text-white text-sm px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-10 text-center">
          <FileText size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No documents for {year} yet.</p>
        </div>
      ) : (
        <div className="bg-[#16181f] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="text-left text-white/30 font-medium px-4 py-3">Type</th>
              <th className="text-left text-white/30 font-medium px-4 py-3">Payer</th>
              <th className="text-left text-white/30 font-medium px-4 py-3">File</th>
              <th className="text-right text-white/30 font-medium px-4 py-3">Amount</th>
              <th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id} className="border-b border-white/3 hover:bg-white/2">
                  <td className="px-4 py-3"><span className="text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-mono">{doc.type}</span></td>
                  <td className="px-4 py-3 text-white/70">{doc.payer}</td>
                  <td className="px-4 py-3 text-white/30 text-xs font-mono truncate max-w-xs">{doc.fileName || doc.description}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{fmt(doc.amount)}</td>
                  <td className="px-4 py-3"><button onClick={() => deleteTaxDocument(doc.id)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={3} className="px-4 py-3 text-white/40 text-sm font-medium">Total Income Reported</td>
                <td className="px-4 py-3 text-right text-white font-bold">{fmt(totalIncome)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </FinanceShell>
  )
}
