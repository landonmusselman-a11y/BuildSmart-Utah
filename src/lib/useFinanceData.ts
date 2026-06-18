'use client'

import { useState, useEffect, useCallback } from 'react'
import { Account, Transaction, AirbnbEntry, InvestmentAccount, TaxDocument, DEFAULT_CATEGORY_RULES } from '@/types/finance'

export interface FinanceData {
  accounts: Account[]
  transactions: Transaction[]
  airbnbEntries: AirbnbEntry[]
  investmentAccounts: InvestmentAccount[]
  taxDocuments: TaxDocument[]
  monthlyBudget: number
  loading: boolean
}

const mapAccount = (r: Record<string, unknown>): Account => ({
  id: r.id as string,
  name: r.name as string,
  institution: (r.institution as string) || '',
  type: (r.type as Account['type']) || 'checking',
  balance: Number(r.balance) || 0,
  lastUpdated: (r.last_updated as string) || new Date().toISOString(),
})

const mapTransaction = (r: Record<string, unknown>): Transaction => ({
  id: r.id as string,
  accountId: (r.account_id as string) || '',
  date: (r.date as string) || '',
  description: (r.description as string) || '',
  amount: Number(r.amount) || 0,
  category: (r.category as string) || 'Other',
  subcategory: r.subcategory as string | undefined,
  notes: r.notes as string | undefined,
  isAirbnb: Boolean(r.is_airbnb),
})

const mapAirbnb = (r: Record<string, unknown>): AirbnbEntry => ({
  id: r.id as string,
  propertyName: (r.property_name as string) || '',
  date: (r.date as string) || '',
  type: (r.type as AirbnbEntry['type']) || 'other_expense',
  description: (r.description as string) || '',
  amount: Number(r.amount) || 0,
  year: Number(r.year) || new Date().getFullYear(),
})

const mapInvestmentAccount = (r: Record<string, unknown>): InvestmentAccount => ({
  id: r.id as string,
  name: (r.name as string) || '',
  institution: (r.institution as string) || '',
  lastUpdated: (r.last_updated as string) || new Date().toISOString(),
  totalValue: Number(r.total_value) || 0,
  holdings: ((r.finance_investment_holdings as Record<string, unknown>[]) || []).map(h => ({
    symbol: (h.symbol as string) || '',
    name: (h.name as string) || '',
    shares: Number(h.shares) || 0,
    price: Number(h.price) || 0,
    value: Number(h.value) || 0,
    costBasis: h.cost_basis !== null ? Number(h.cost_basis) : undefined,
    gainLoss: h.gain_loss !== null ? Number(h.gain_loss) : undefined,
  })),
})

const mapTaxDoc = (r: Record<string, unknown>): TaxDocument => ({
  id: r.id as string,
  year: Number(r.year) || new Date().getFullYear(),
  type: (r.type as TaxDocument['type']) || 'other',
  description: (r.description as string) || '',
  payer: (r.payer as string) || '',
  amount: Number(r.amount) || 0,
  uploadedAt: (r.uploaded_at as string) || new Date().toISOString(),
  fileName: (r.file_name as string) || '',
})

export function useFinanceData(): FinanceData & {
  refetch: () => void
  addAccount: (a: Account) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  addTransactions: (txns: Transaction[]) => Promise<void>
  recategorize: (id: string, category: string) => Promise<void>
  addAirbnbEntries: (entries: AirbnbEntry[]) => Promise<void>
  deleteAirbnbEntry: (id: string) => Promise<void>
  upsertInvestmentAccount: (a: InvestmentAccount) => Promise<void>
  deleteInvestmentAccount: (id: string) => Promise<void>
  addTaxDocument: (d: TaxDocument) => Promise<void>
  deleteTaxDocument: (id: string) => Promise<void>
  updateBudget: (n: number) => Promise<void>
  categoryRules: typeof DEFAULT_CATEGORY_RULES
} {
  const [data, setData] = useState<FinanceData>({
    accounts: [], transactions: [], airbnbEntries: [],
    investmentAccounts: [], taxDocuments: [], monthlyBudget: 10000, loading: true,
  })

  const fetchAll = useCallback(async () => {
    setData(d => ({ ...d, loading: true }))
    try {
      const [accts, txns, airbnb, investments, taxes, settings] = await Promise.all([
        fetch('/api/finance/accounts').then(r => r.json()),
        fetch('/api/finance/transactions').then(r => r.json()),
        fetch('/api/finance/airbnb').then(r => r.json()),
        fetch('/api/finance/investments').then(r => r.json()),
        fetch('/api/finance/taxes').then(r => r.json()),
        fetch('/api/finance/settings').then(r => r.json()),
      ])
      setData({
        accounts: Array.isArray(accts) ? accts.map(mapAccount) : [],
        transactions: Array.isArray(txns) ? txns.map(mapTransaction) : [],
        airbnbEntries: Array.isArray(airbnb) ? airbnb.map(mapAirbnb) : [],
        investmentAccounts: Array.isArray(investments) ? investments.map(mapInvestmentAccount) : [],
        taxDocuments: Array.isArray(taxes) ? taxes.map(mapTaxDoc) : [],
        monthlyBudget: settings?.monthly_budget || 10000,
        loading: false,
      })
    } catch {
      setData(d => ({ ...d, loading: false }))
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addAccount = async (a: Account) => {
    await fetch('/api/finance/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, name: a.name, institution: a.institution, type: a.type, balance: a.balance, last_updated: a.lastUpdated }),
    })
    setData(d => ({ ...d, accounts: [...d.accounts.filter(x => x.id !== a.id), a] }))
  }

  const deleteAccount = async (id: string) => {
    await fetch('/api/finance/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await fetch('/api/finance/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: id }) })
    setData(d => ({ ...d, accounts: d.accounts.filter(a => a.id !== id), transactions: d.transactions.filter(t => t.accountId !== id) }))
  }

  const addTransactions = async (txns: Transaction[]) => {
    const rows = txns.map(t => ({ id: t.id, account_id: t.accountId, date: t.date, description: t.description, amount: t.amount, category: t.category, subcategory: t.subcategory, notes: t.notes, is_airbnb: t.isAirbnb }))
    await fetch('/api/finance/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) })
    setData(d => ({ ...d, transactions: [...d.transactions, ...txns] }))
  }

  const recategorize = async (id: string, category: string) => {
    await fetch('/api/finance/transactions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, category }) })
    setData(d => ({ ...d, transactions: d.transactions.map(t => t.id === id ? { ...t, category } : t) }))
  }

  const addAirbnbEntries = async (entries: AirbnbEntry[]) => {
    const rows = entries.map(e => ({ id: e.id, property_name: e.propertyName, date: e.date, type: e.type, description: e.description, amount: e.amount, year: e.year }))
    await fetch('/api/finance/airbnb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) })
    setData(d => ({ ...d, airbnbEntries: [...d.airbnbEntries, ...entries] }))
  }

  const deleteAirbnbEntry = async (id: string) => {
    await fetch('/api/finance/airbnb', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setData(d => ({ ...d, airbnbEntries: d.airbnbEntries.filter(e => e.id !== id) }))
  }

  const upsertInvestmentAccount = async (a: InvestmentAccount) => {
    await fetch('/api/finance/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, name: a.name, institution: a.institution, last_updated: a.lastUpdated, total_value: a.totalValue, holdings: a.holdings }),
    })
    setData(d => ({ ...d, investmentAccounts: [...d.investmentAccounts.filter(x => x.id !== a.id), a] }))
  }

  const deleteInvestmentAccount = async (id: string) => {
    await fetch('/api/finance/investments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setData(d => ({ ...d, investmentAccounts: d.investmentAccounts.filter(a => a.id !== id) }))
  }

  const addTaxDocument = async (doc: TaxDocument) => {
    await fetch('/api/finance/taxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, year: doc.year, type: doc.type, description: doc.description, payer: doc.payer, amount: doc.amount, uploaded_at: doc.uploadedAt, file_name: doc.fileName }),
    })
    setData(d => ({ ...d, taxDocuments: [...d.taxDocuments, doc] }))
  }

  const deleteTaxDocument = async (id: string) => {
    await fetch('/api/finance/taxes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setData(d => ({ ...d, taxDocuments: d.taxDocuments.filter(d2 => d2.id !== id) }))
  }

  const updateBudget = async (n: number) => {
    await fetch('/api/finance/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monthly_budget: n }) })
    setData(d => ({ ...d, monthlyBudget: n }))
  }

  return {
    ...data,
    refetch: fetchAll,
    addAccount, deleteAccount, addTransactions, recategorize,
    addAirbnbEntries, deleteAirbnbEntry,
    upsertInvestmentAccount, deleteInvestmentAccount,
    addTaxDocument, deleteTaxDocument,
    updateBudget,
    categoryRules: DEFAULT_CATEGORY_RULES,
  }
}
