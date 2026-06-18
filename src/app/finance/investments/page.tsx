'use client'

import { useEffect, useState, useCallback } from 'react'
import { loadStore, saveStore, getAvgMonthlySpend } from '@/lib/financeStore'
import { FinanceStore, InvestmentAccount, InvestmentHolding } from '@/types/finance'
import FinanceShell from '@/components/finance/FinanceShell'
import CSVUploader from '@/components/finance/CSVUploader'
import DocumentUploader, { ParsedDocument } from '@/components/finance/DocumentUploader'
import { TrendingUp, TrendingDown, Clock, Plus, Trash2 } from 'lucide-react'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function fmtPrecise(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

// Parse Robinhood CSV export
function parseRobinhoodCSV(rows: Record<string, string>[]): InvestmentHolding[] {
  return rows.map(row => {
    const symbol = row['Symbol'] || row['symbol'] || ''
    const name = row['Name'] || row['name'] || symbol
    const shares = parseFloat(row['Shares'] || row['Quantity'] || row['shares'] || '0')
    const price = parseFloat((row['Price'] || row['Last Price'] || row['price'] || '0').replace(/[$,]/g, ''))
    const value = parseFloat((row['Market Value'] || row['Total Value'] || row['value'] || '0').replace(/[$,]/g, '')) || shares * price
    const costBasis = parseFloat((row['Average Cost'] || row['Cost Basis'] || '0').replace(/[$,]/g, '')) * shares
    return { symbol, name, shares, price, value, costBasis: isNaN(costBasis) ? undefined : costBasis, gainLoss: costBasis ? value - costBasis : undefined }
  }).filter(h => h.symbol && !isNaN(h.value) && h.value > 0)
}

export default function InvestmentsPage() {
  const [store, setStore] = useState<FinanceStore | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newAcctName, setNewAcctName] = useState('')

  useEffect(() => { setStore(loadStore()) }, [])
  const update = useCallback((s: FinanceStore) => { setStore({ ...s }); saveStore(s) }, [])

  function handleCSV(rows: Record<string, string>[]) {
    if (!store) return
    const holdings = parseRobinhoodCSV(rows)
    const totalValue = holdings.reduce((s, h) => s + h.value, 0)
    const acct: InvestmentAccount = {
      id: `inv_${Date.now()}`,
      name: newAcctName || 'Robinhood',
      institution: 'Robinhood',
      lastUpdated: new Date().toISOString(),
      totalValue,
      holdings,
    }
    // Replace existing Robinhood account if same name
    const existing = store.investmentAccounts.findIndex(a => a.name === acct.name)
    const updated = existing >= 0
      ? store.investmentAccounts.map((a, i) => i === existing ? acct : a)
      : [...store.investmentAccounts, acct]
    update({ ...store, investmentAccounts: updated })
    setShowAdd(false)
    setNewAcctName('')
  }

  function handleAIParsed(result: ParsedDocument) {
    if (!store) return
    const d = result.data
    const holdings: InvestmentHolding[] = Array.isArray(d.holdings)
      ? (d.holdings as { symbol: string; name?: string; shares: number; price: number; value: number }[]).map(h => ({
          symbol: h.symbol || '',
          name: h.name || h.symbol || '',
          shares: Number(h.shares) || 0,
          price: Number(h.price) || 0,
          value: Number(h.value) || 0,
        }))
      : []
    const totalValue = holdings.reduce((s, h) => s + h.value, 0) || Number(d.totalValue) || 0
    const acct: InvestmentAccount = {
      id: `inv_ai_${Date.now()}`,
      name: newAcctName || (d.institution as string) || 'Brokerage',
      institution: (d.institution as string) || 'Brokerage',
      lastUpdated: new Date().toISOString(),
      totalValue,
      holdings,
    }
    update({ ...store, investmentAccounts: [...store.investmentAccounts, acct] })
    setShowAdd(false)
    setNewAcctName('')
  }

  function deleteAccount(id: string) {
    if (!store) return
    update({ ...store, investmentAccounts: store.investmentAccounts.filter(a => a.id !== id) })
  }

  if (!store) return null

  const totalValue = store.investmentAccounts.reduce((s, a) => s + a.totalValue, 0)
  const avgSpend = getAvgMonthlySpend(store.transactions)
  const runway = avgSpend > 0 ? Math.floor(totalValue / avgSpend) : null
  const totalGainLoss = store.investmentAccounts
    .flatMap(a => a.holdings)
    .reduce((s, h) => s + (h.gainLoss || 0), 0)

  return (
    <FinanceShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Investments</h1>
          <p className="text-white/40 text-sm mt-1">Portfolio value & runway</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={16} /> Upload CSV
        </button>
      </div>

      {/* Runway banner */}
      <div className={`mb-6 rounded-xl p-5 border flex items-center gap-4 ${
        !runway ? 'bg-white/5 border-white/5' :
        runway < 3 ? 'bg-red-500/10 border-red-500/30' :
        runway < 6 ? 'bg-amber-500/10 border-amber-500/30' :
        'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <Clock size={28} className={!runway ? 'text-white/30' : runway < 3 ? 'text-red-400' : runway < 6 ? 'text-amber-400' : 'text-emerald-400'} />
        <div>
          {runway !== null ? (
            <>
              <p className="text-white font-bold text-xl">{runway} months of runway</p>
              <p className="text-white/40 text-sm">{fmt(totalValue)} portfolio ÷ {fmt(avgSpend)}/mo avg spend</p>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-xl">{fmt(totalValue)} total portfolio</p>
              <p className="text-white/40 text-sm">Upload spending CSV to calculate runway</p>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Portfolio Value</p>
          <p className="text-white font-bold text-xl">{fmt(totalValue)}</p>
        </div>
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Gain / Loss</p>
          <p className={`font-bold text-xl ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{fmt(totalGainLoss)}
          </p>
        </div>
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Monthly Burn Rate</p>
          <p className="text-white font-bold text-xl">{avgSpend > 0 ? fmt(avgSpend) : '—'}</p>
        </div>
      </div>

      {/* Upload panel */}
      {showAdd && (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Add Investment Account</h3>
          <div className="mb-3">
            <label className="text-white/40 text-xs mb-1 block">Account Name</label>
            <input
              value={newAcctName}
              onChange={e => setNewAcctName(e.target.value)}
              placeholder="e.g. Robinhood, Fidelity, Vanguard"
              className="w-full max-w-xs bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none placeholder-white/20"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wider">CSV File</p>
              <CSVUploader label="Drop Robinhood / brokerage CSV" onParsed={handleCSV} />
              <p className="text-white/20 text-xs mt-1.5">Robinhood: Account → Statements → Export CSV</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wider">✦ PDF / Screenshot</p>
              <DocumentUploader label="Drop brokerage statement or screenshot" hint="Claude extracts your holdings and portfolio value" onParsed={handleAIParsed} />
              <p className="text-white/20 text-xs mt-1.5">Any brokerage statement or portfolio screenshot</p>
            </div>
          </div>
        </div>
      )}

      {/* Accounts */}
      {store.investmentAccounts.length === 0 ? (
        <div className="bg-[#16181f] border border-white/5 rounded-xl p-12 text-center text-white/30 text-sm">
          No investment accounts yet. Upload a Robinhood or brokerage CSV.
        </div>
      ) : (
        store.investmentAccounts.map(acct => {
          const acctGainLoss = acct.holdings.reduce((s, h) => s + (h.gainLoss || 0), 0)
          return (
            <div key={acct.id} className="bg-[#16181f] border border-white/5 rounded-xl mb-4 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <p className="text-white font-semibold">{acct.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">Updated {new Date(acct.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-bold">{fmt(acct.totalValue)}</p>
                    {acctGainLoss !== 0 && (
                      <p className={`text-xs ${acctGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {acctGainLoss >= 0 ? '+' : ''}{fmt(acctGainLoss)} G/L
                      </p>
                    )}
                  </div>
                  <button onClick={() => deleteAccount(acct.id)} className="text-white/20 hover:text-rose-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {acct.holdings.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-white/30 font-medium px-4 py-2">Symbol</th>
                        <th className="text-left text-white/30 font-medium px-4 py-2">Name</th>
                        <th className="text-right text-white/30 font-medium px-4 py-2">Shares</th>
                        <th className="text-right text-white/30 font-medium px-4 py-2">Price</th>
                        <th className="text-right text-white/30 font-medium px-4 py-2">Value</th>
                        <th className="text-right text-white/30 font-medium px-4 py-2">G/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acct.holdings.map((h, i) => (
                        <tr key={i} className="border-b border-white/3 hover:bg-white/2">
                          <td className="px-4 py-2.5 text-white font-mono font-semibold">{h.symbol}</td>
                          <td className="px-4 py-2.5 text-white/50 max-w-xs truncate">{h.name}</td>
                          <td className="px-4 py-2.5 text-right text-white/60">{h.shares.toFixed(4)}</td>
                          <td className="px-4 py-2.5 text-right text-white/60">{fmtPrecise(h.price)}</td>
                          <td className="px-4 py-2.5 text-right text-white font-medium">{fmt(h.value)}</td>
                          <td className={`px-4 py-2.5 text-right font-medium ${!h.gainLoss ? 'text-white/30' : h.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {h.gainLoss !== undefined ? `${h.gainLoss >= 0 ? '+' : ''}${fmt(h.gainLoss)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })
      )}
    </FinanceShell>
  )
}
