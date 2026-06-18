'use client'

import { FinanceStore, DEFAULT_CATEGORY_RULES, Transaction, CategoryRule } from '@/types/finance'

const STORAGE_KEY = 'finance_tracker_v1'

export const defaultStore: FinanceStore = {
  accounts: [],
  transactions: [],
  categoryRules: DEFAULT_CATEGORY_RULES,
  airbnbEntries: [],
  investmentAccounts: [],
  taxDocuments: [],
  monthlyBudget: 10000,
}

export function loadStore(): FinanceStore {
  if (typeof window === 'undefined') return defaultStore
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStore
    return { ...defaultStore, ...JSON.parse(raw) }
  } catch {
    return defaultStore
  }
}

export function saveStore(store: FinanceStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function autoCategory(description: string, rules: CategoryRule[]): string {
  const lower = description.toLowerCase()
  for (const rule of rules) {
    if (lower.includes(rule.keyword.toLowerCase())) return rule.category
  }
  return 'Other'
}

export function getMonthlySpending(transactions: Transaction[], year: number, month: number): number {
  return transactions
    .filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month && t.amount < 0
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
}

export function getAvgMonthlySpend(transactions: Transaction[]): number {
  if (!transactions.length) return 0
  const spending = transactions.filter(t => t.amount < 0 && t.category !== 'Transfer')
  if (!spending.length) return 0
  const dates = spending.map(t => new Date(t.date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const months = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1)
  return spending.reduce((sum, t) => sum + Math.abs(t.amount), 0) / months
}

export function getSpendingByCategory(transactions: Transaction[]): Record<string, number> {
  const result: Record<string, number> = {}
  transactions
    .filter(t => t.amount < 0 && t.category !== 'Transfer' && t.category !== 'Income')
    .forEach(t => {
      result[t.category] = (result[t.category] || 0) + Math.abs(t.amount)
    })
  return result
}

export function getMonthlyTotals(transactions: Transaction[]): { month: string; spending: number; income: number }[] {
  const map: Record<string, { spending: number; income: number }> = {}
  transactions.forEach(t => {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = { spending: 0, income: 0 }
    if (t.amount < 0 && t.category !== 'Transfer') map[key].spending += Math.abs(t.amount)
    if (t.amount > 0 && t.category !== 'Transfer') map[key].income += t.amount
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, ...vals }))
}
