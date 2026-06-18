import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Words that indicate a transaction is genuinely income/positive
const INCOME_KEYWORDS = [
  'direct deposit', 'payroll', 'deposit', 'refund', 'credit', 'return',
  'cashback', 'cash back', 'reward', 'interest earned', 'dividend',
  'payment received', 'thank you', 'transfer in', 'zelle from',
]

// Categories that should always be negative (expenses)
const EXPENSE_CATEGORIES = [
  'Housing', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Health & Medical', 'Utilities', 'Insurance', 'Travel', 'Business',
  'Airbnb', 'Kids & Family', 'Personal Care', 'Subscriptions', 'Taxes & Fees', 'Other',
]

export async function GET() {
  // Find all positive transactions in expense categories — these are likely wrong-sign
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount, category, account_id')
    .gt('amount', 0)
    .in('category', EXPENSE_CATEGORIES)
    .order('date', { ascending: false })

  if (!txns) return NextResponse.json({ suspects: [] })

  // Filter out ones that look genuinely positive (refunds, credits, etc.)
  const suspects = txns.filter(t => {
    const lower = (t.description || '').toLowerCase()
    return !INCOME_KEYWORDS.some(kw => lower.includes(kw))
  })

  return NextResponse.json({ suspects, total: suspects.length })
}

export async function POST(req: NextRequest) {
  const { ids } = await req.json()
  if (!ids || ids.length === 0) return NextResponse.json({ flipped: 0 })

  // Flip signs on all specified transaction IDs
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, amount')
    .in('id', ids)

  let flipped = 0
  for (const t of txns || []) {
    await supabaseAdmin
      .from('finance_transactions')
      .update({ amount: -Math.abs(Number(t.amount)) })
      .eq('id', t.id)
    flipped++
  }

  return NextResponse.json({ flipped })
}
