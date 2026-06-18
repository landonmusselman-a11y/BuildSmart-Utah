import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Mortgage', 'Housing', 'Utilities', 'Subscriptions',
  'Transportation', 'Travel', 'Health & Medical', 'Insurance', 'Airbnb', 'Business',
  'Kids & Family', 'Personal Care', 'Income', 'Transfer', 'Venmo', 'Taxes & Fees', 'Other',
]

const ENTITIES = ['personal', 'business', 'airbnb']

// GET — returns transactions that need review (uncategorized, wrong sign, or Other)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'needs_review'
  const year = searchParams.get('year') || new Date().getFullYear().toString()

  let query = supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount, category, entity')
    .order('date', { ascending: false })

  if (year !== 'all') {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
  }

  if (mode === 'needs_review') {
    // Only transactions that are uncategorized, 'Other', or potentially wrong
    query = query.or('category.is.null,category.eq.Other,category.eq.Transfer,category.eq.Venmo')
  }

  const { data: txns } = await query.limit(500)
  return NextResponse.json({ transactions: txns || [], total: txns?.length || 0 })
}

// POST — AI categorizes a batch of transactions
export async function POST(req: NextRequest) {
  const { transactionIds } = await req.json() as { transactionIds: string[] }

  if (!transactionIds || transactionIds.length === 0) {
    return NextResponse.json({ suggestions: [] })
  }

  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount, category')
    .in('id', transactionIds)

  if (!txns || txns.length === 0) return NextResponse.json({ suggestions: [] })

  // Build the batch prompt
  const txnList = txns.map((t, i) =>
    `${i + 1}. [${t.date}] "${t.description}" | $${Number(t.amount).toFixed(2)} | current: ${t.category || 'None'}`
  ).join('\n')

  const prompt = `You are categorizing financial transactions for Landon Rose, a Utah real estate agent with 3 Airbnb properties (Zen Den, Still Nest, Zen Nest) and a Robinhood investment account.

For each transaction below, return the best category and entity (who it belongs to).

CATEGORIES: ${CATEGORIES.join(', ')}

ENTITY OPTIONS:
- "personal" — personal/household expense
- "business" — real estate agent business expense (Schedule C deductible)
- "airbnb" — Airbnb property expense (Schedule E deductible)

IMPORTANT RULES:
- Mortgage payments → category: "Mortgage", entity: "airbnb" (all properties are rentals)
- Starlink, Wolf Creek → entity: "airbnb"
- Turno, Haynes, cleaning → category: "Airbnb", entity: "airbnb"
- MLS fees, real estate marketing, E&O insurance → category: "Business", entity: "business"
- Costco, Amazon → usually "Shopping" personal, but if description mentions property → "Airbnb" airbnb
- Credit card payments, bank transfers between own accounts → category: "Transfer", entity: "personal"
- Zelle/Venmo with a person's name and no clear purpose → category: "Venmo", entity: "personal"
- Zelle/Venmo with clear purpose (dinner, etc.) → use appropriate category
- Payroll, commissions, direct deposits → category: "Income"
- Signs this is a business expense: MLS, realtor, real estate, commission, lockbox, sign rider, E&O, errors & omissions
- Signs this is airbnb: cleaning, turno, property supply, wolf creek, starlink (if for rental)

Transactions:
${txnList}

Return ONLY a JSON array, one object per transaction in the same order:
[
  {"id":"${txns[0]?.id}","category":"Food & Dining","entity":"personal","confidence":"high","reason":"Restaurant name"},
  ...
]

confidence: "high" (obvious), "medium" (likely), "low" (guessing)
Respond with the array only — no explanation, no markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  const start = cleaned.indexOf('['), end = cleaned.lastIndexOf(']')
  if (start !== -1 && end > start) cleaned = cleaned.slice(start, end + 1)

  let suggestions: { id: string; category: string; entity: string; confidence: string; reason: string }[] = []
  try {
    suggestions = JSON.parse(cleaned)
    // Ensure IDs are correct (AI sometimes reorders)
    suggestions = suggestions.map((s, i) => ({ ...s, id: txns[i]?.id || s.id }))
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 422 })
  }

  return NextResponse.json({ suggestions })
}

// PATCH — apply approved suggestions
export async function PATCH(req: NextRequest) {
  const { approvals } = await req.json() as {
    approvals: { id: string; category: string; entity: string }[]
  }

  let updated = 0
  for (const a of approvals) {
    await supabaseAdmin
      .from('finance_transactions')
      .update({ category: a.category, entity: a.entity })
      .eq('id', a.id)
    updated++
  }

  return NextResponse.json({ updated })
}
