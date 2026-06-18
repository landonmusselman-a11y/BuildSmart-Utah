import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data: txns, error } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount, category, account_id')
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Duplicate = exact same date + description + amount only.
  // Same merchant on different days is NOT a duplicate (e.g. Netflix every month).
  const groups: Record<string, typeof txns> = {}
  for (const t of txns || []) {
    const key = `${t.date}|${t.description?.trim().toLowerCase()}|${Number(t.amount).toFixed(2)}`
    if (!groups[key]) groups[key] = []
    groups[key]!.push(t)
  }

  const duplicates = Object.values(groups)
    .filter(g => g.length > 1)
    .map(g => ({
      date: g[0].date,
      description: g[0].description,
      amount: Number(g[0].amount),
      count: g.length,
      ids: g.map(t => t.id),
      // Keep the first, flag the rest as duplicates
      keepId: g[0].id,
      removeIds: g.slice(1).map(t => t.id),
    }))

  return NextResponse.json({ duplicates, total: duplicates.length })
}

export async function DELETE() {
  // Remove all detected duplicates (keep first occurrence of each)
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount')
    .order('date', { ascending: true })

  const seen = new Set<string>()
  const toDelete: string[] = []

  for (const t of txns || []) {
    const key = `${t.date}|${t.description?.trim().toLowerCase()}|${Number(t.amount).toFixed(2)}`
    if (seen.has(key)) {
      toDelete.push(t.id)
    } else {
      seen.add(key)
    }
  }

  if (toDelete.length > 0) {
    await supabaseAdmin.from('finance_transactions').delete().in('id', toDelete)
  }

  return NextResponse.json({ removed: toDelete.length })
}

export async function POST() {
  // Re-run auto-categorization on all existing transactions
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, description')

  if (!txns || txns.length === 0) return NextResponse.json({ updated: 0 })

  // Import rules server-side
  const { autoCategory, defaultStore } = await import('@/lib/financeStore')

  let updated = 0
  for (const t of txns) {
    const category = autoCategory(t.description || '', defaultStore.categoryRules)
    if (category !== 'Other') {
      await supabaseAdmin
        .from('finance_transactions')
        .update({ category })
        .eq('id', t.id)
      updated++
    }
  }

  return NextResponse.json({ updated })
}
