'use client'

import { useFinanceData } from '@/lib/useFinanceData'
import FinanceShell from '@/components/finance/FinanceShell'
import Link from 'next/link'
import {
  CheckCircle2, AlertCircle, Circle, Upload, CreditCard,
  Building2, Wallet, TrendingUp, Home, Loader2, ExternalLink
} from 'lucide-react'
import { useMemo } from 'react'

// ── Your known accounts ───────────────────────────────────────────────────────
// These are Landon's actual accounts — update as needed

const KNOWN_ACCOUNTS = [
  // Personal banking
  { id: 'afcu_personal', label: 'America First Personal Checking', institution: 'America First', type: 'checking', icon: Building2, group: 'Personal Banking', priority: 'high', note: 'Personal day-to-day account' },

  // Business banking
  { id: 'afcu_business', label: 'America First Business Checking (...6089)', institution: 'America First', type: 'checking', icon: Home, group: 'Business Banking', priority: 'high', note: 'All Airbnb income deposits here' },

  // Business credit cards
  { id: 'chase_9278', label: 'Chase Business Card (...9278)', institution: 'Chase', type: 'credit', icon: CreditCard, group: 'Business Credit Cards', priority: 'high', note: 'Chase business credit card' },
  { id: 'amex_biz', label: 'American Express (Business)', institution: 'American Express', type: 'credit', icon: CreditCard, group: 'Business Credit Cards', priority: 'high', note: 'Amex business card' },
  { id: 'robinhood_card', label: 'Robinhood Credit Card', institution: 'Robinhood', type: 'credit', icon: CreditCard, group: 'Business Credit Cards', priority: 'high', note: 'Robinhood credit card' },

  // Digital / payments
  { id: 'venmo', label: 'Venmo', institution: 'Venmo', type: 'checking', icon: Wallet, group: 'Digital Payments', priority: 'medium', note: 'Personal & business payments' },

  // Investments
  { id: 'robinhood_inv', label: 'Robinhood (Investment Account)', institution: 'Robinhood', type: 'investment', icon: TrendingUp, group: 'Investments', priority: 'high', note: 'Stocks, ETFs, crypto' },
]

const GROUPS = ['Personal Banking', 'Business Banking', 'Business Credit Cards', 'Digital Payments', 'Investments']

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function monthsBack(n: number): string[] {
  const months = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export default function AccountsPage() {
  const { accounts, transactions, loading } = useFinanceData()

  // Figure out which institutions/types have uploaded data
  const coverage = useMemo(() => {
    const recentMonths = monthsBack(6)
    const result: Record<string, { hasData: boolean; monthsCovered: string[]; txnCount: number; balance?: number }> = {}

    KNOWN_ACCOUNTS.forEach(ka => {
      const institutionLower = ka.institution.toLowerCase()

      // Account-number-aware matching
      const matchedAccounts = accounts.filter(a => {
        const name = (a.name || '').toLowerCase()
        const inst = (a.institution || '').toLowerCase()
        if (ka.id === 'afcu_business') return (name.includes('6089') || inst.includes('6089') || name.includes('america first') && name.includes('business'))
        if (ka.id === 'afcu_personal') return (inst.includes('america first') || name.includes('america first')) && !name.includes('business') && !name.includes('6089')
        if (ka.id === 'chase_9278') return name.includes('9278') || (inst.includes('chase') && name.includes('9278'))
        if (ka.id === 'amex_biz') return inst.includes('american express') || inst.includes('amex') || name.includes('amex')
        if (ka.id === 'robinhood_card') return (inst.includes('robinhood') || name.includes('robinhood')) && (name.includes('card') || name.includes('credit'))
        if (ka.id === 'robinhood_inv') return (inst.includes('robinhood') || name.includes('robinhood')) && !name.includes('card')
        return inst.includes(institutionLower) || name.includes(institutionLower)
      })

      // Match transactions
      const matchedTxns = transactions.filter(t => {
        const desc = (t.description || '').toLowerCase()
        if (ka.id === 'venmo') return desc.includes('venmo')
        if (ka.id === 'robinhood_card') return false // card txns tracked via account
        if (ka.id === 'robinhood_inv') return desc.includes('robinhood')
        return matchedAccounts.some(a => a.id === t.accountId)
      })

      const monthsCovered = [...new Set(matchedTxns.map(t => t.date?.slice(0, 7)).filter(Boolean))]
        .filter(m => recentMonths.includes(m as string)) as string[]

      result[ka.id] = {
        hasData: matchedAccounts.length > 0 || matchedTxns.length > 0,
        monthsCovered,
        txnCount: matchedTxns.length,
        balance: matchedAccounts.reduce((s, a) => s + (a.balance || 0), 0),
      }
    })

    return result
  }, [accounts, transactions])

  const totalCovered = Object.values(coverage).filter(c => c.hasData).length
  const totalAccounts = KNOWN_ACCOUNTS.length
  const highPriorityMissing = KNOWN_ACCOUNTS.filter(a => a.priority === 'high' && !coverage[a.id]?.hasData)

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  if (loading) return (
    <FinanceShell>
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>
    </FinanceShell>
  )

  return (
    <FinanceShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-0.5">Accounts</h1>
        <p className="text-white/30 text-sm">
          {totalCovered} of {totalAccounts} accounts have data uploaded
          {totalBalance > 0 && ` · ${fmt(totalBalance)} total balance tracked`}
        </p>
      </div>

      {/* Coverage summary */}
      <div className={`rounded-xl border p-4 mb-6 ${
        highPriorityMissing.length === 0
          ? 'bg-emerald-500/8 border-emerald-500/20'
          : 'bg-amber-500/8 border-amber-500/20'
      }`}>
        <div className="flex items-start gap-3">
          {highPriorityMissing.length === 0
            ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            {highPriorityMissing.length === 0 ? (
              <p className="text-emerald-300 font-semibold text-sm">All key accounts are covered</p>
            ) : (
              <>
                <p className="text-amber-300 font-semibold text-sm mb-1">
                  {highPriorityMissing.length} important account{highPriorityMissing.length !== 1 ? 's' : ''} still need statements
                </p>
                <p className="text-white/40 text-xs">
                  {highPriorityMissing.map(a => a.label).join(' · ')}
                </p>
              </>
            )}
          </div>
          <Link href="/finance/inbox" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
            <Upload size={11} /> Upload
          </Link>
        </div>
      </div>

      {/* Account groups */}
      <div className="space-y-5">
        {GROUPS.map(group => {
          const groupAccounts = KNOWN_ACCOUNTS.filter(a => a.group === group)
          return (
            <div key={group} className="bg-[#16181f] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{group}</p>
                <p className="text-white/20 text-xs">
                  {groupAccounts.filter(a => coverage[a.id]?.hasData).length}/{groupAccounts.length} uploaded
                </p>
              </div>
              <div className="divide-y divide-white/3">
                {groupAccounts.map(acct => {
                  const cov = coverage[acct.id]
                  const Icon = acct.icon
                  const recentMonths = monthsBack(3)
                  const missingRecent = recentMonths.filter(m => !cov?.monthsCovered.includes(m))

                  return (
                    <div key={acct.id} className="flex items-center gap-4 px-5 py-4">
                      {/* Status icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        cov?.hasData ? 'bg-emerald-500/10' : 'bg-white/3'
                      }`}>
                        <Icon size={16} className={cov?.hasData ? 'text-emerald-400' : 'text-white/20'} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white text-sm font-medium">{acct.label}</p>
                          {acct.priority === 'high' && !cov?.hasData && (
                            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold">NEEDED</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {'note' in acct && <p className="text-white/25 text-xs italic">{acct.note as string}</p>}
                          {cov?.hasData ? (
                            <>
                              <span className="text-white/20 text-xs">{cov.txnCount} transactions</span>
                              {cov.balance !== undefined && cov.balance !== 0 && (
                                <span className="text-white/30 text-xs">{fmt(cov.balance)}</span>
                              )}
                              {missingRecent.length > 0 && (
                                <span className="text-amber-400/70 text-xs">
                                  ⚠ missing {missingRecent.map(m => m.slice(5)).join(', ')}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-white/20 text-xs">No statements uploaded yet</span>
                          )}
                        </div>
                      </div>

                      {/* Status / action */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {cov?.hasData ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <>
                            <Circle size={16} className="text-white/15" />
                            <Link href="/finance/inbox" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                              Upload <Upload size={10} />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-[#16181f] rounded-2xl border border-white/5 p-5">
        <p className="text-white font-semibold text-sm mb-3">Where to download your statements</p>
        <div className="space-y-2.5 text-xs text-white/40">
          {[
            { name: 'Chase (...9278)', url: 'chase.com', path: 'Statements & Documents → Download PDF or CSV' },
            { name: 'Amex (Business)', url: 'americanexpress.com', path: 'Account Services → Statements → View All → Download' },
            { name: 'America First Personal', url: 'americafirst.com', path: 'Accounts → Statements → Download PDF' },
            { name: 'America First Biz (...6089)', url: 'americafirst.com', path: 'Switch to business account → Statements → Download' },
            { name: 'Robinhood Card', url: 'robinhood.com', path: 'Credit Card → Statements → Download' },
            { name: 'Robinhood Invest', url: 'robinhood.com', path: 'Account (person icon) → Statements & History → Monthly Statements' },
            { name: 'Venmo', url: 'venmo.com/account/statement/monthly', path: 'Go to venmo.com → Statements → Download CSV' },
          ].map(({ name, url, path }) => (
            <div key={name} className="flex items-start gap-3">
              <span className="text-white/60 font-semibold w-28 flex-shrink-0">{name}</span>
              <span className="flex-1">{path}</span>
              <a href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0">
                <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </FinanceShell>
  )
}
