import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Returns all unique merchants from transactions with spend totals and frequency
export async function GET() {
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('description, amount, category, entity, date')

  if (!txns || txns.length === 0) return NextResponse.json([])

  const { data: rules } = await supabaseAdmin
    .from('finance_merchant_rules')
    .select('*')

  type Rule = { merchant: string; display_name?: string; category?: string; entity?: string; is_recurring?: boolean }
  const ruleMap = new Map((rules || []).map((r: Rule) => [r.merchant, r]))

  // Aggregate by normalized merchant name
  const map = new Map<string, {
    merchant: string
    displayName: string
    totalSpent: number
    count: number
    category: string
    entity: string
    isRecurring: boolean
    hasRule: boolean
    lastSeen: string
    amounts: number[]
  }>()

  for (const t of txns) {
    const raw = (t.description || '').trim()
    const key = raw.toLowerCase()
    if (!map.has(key)) {
      const rule = ruleMap.get(key)
      map.set(key, {
        merchant: key,
        displayName: rule?.display_name || raw,
        totalSpent: 0,
        count: 0,
        category: rule?.category || t.category || 'Other',
        entity: rule?.entity || t.entity || 'personal',
        isRecurring: rule?.is_recurring || false,
        hasRule: !!rule,
        lastSeen: t.date || '',
        amounts: [],
      })
    }
    const m = map.get(key)!
    m.totalSpent += Number(t.amount)
    m.count++
    m.amounts.push(Number(t.amount))
    if ((t.date || '') > m.lastSeen) m.lastSeen = t.date
  }

  // Detect likely recurring: same merchant appears in 2+ different months
  const result = Array.from(map.values()).map(m => {
    // Check if amounts are similar (within 20%) — strong recurring signal
    if (!m.isRecurring && m.count >= 2) {
      const abs = m.amounts.map(Math.abs)
      const avg = abs.reduce((a, b) => a + b, 0) / abs.length
      const allClose = abs.every(a => Math.abs(a - avg) / avg < 0.25)
      if (allClose && avg < 500) m.isRecurring = true
    }
    return m
  })

  return NextResponse.json(
    result.sort((a, b) => Math.abs(b.totalSpent) - Math.abs(a.totalSpent))
  )
}
