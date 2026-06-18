import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// ── Pre-configured Airbnb expense rules ───────────────────────────────────────
// keyword match is case-insensitive substring. allocation_pct = % of amount that is Airbnb.

const DEFAULT_RULES = [
  // Mortgages — all properties
  { keyword: 'mr cooper',       displayName: 'Mr. Cooper Mortgage',    type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'mr. cooper',      displayName: 'Mr. Cooper Mortgage',    type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'pennymac',        displayName: 'PennyMac Mortgage',      type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'penny mac',       displayName: 'PennyMac Mortgage',      type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'loandepot',       displayName: 'LoanDepot Mortgage',     type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'shellpoint',      displayName: 'Shellpoint Mortgage',    type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'newrez',          displayName: 'NewRez Mortgage',        type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'loancare',        displayName: 'LoanCare Mortgage',      type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'nationstar',      displayName: 'Nationstar Mortgage',    type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'rocket mortgage', displayName: 'Rocket Mortgage',        type: 'mortgage',       property: 'all', pct: 100 },
  { keyword: 'bsi financial',   displayName: 'BSI Financial',          type: 'mortgage',       property: 'all', pct: 100 },

  // Internet / Utilities
  { keyword: 'starlink',        displayName: 'Starlink Internet',      type: 'utility',        property: 'all', pct: 100 },

  // Wolf Creek — HOA + property fees
  { keyword: 'wolf creek',      displayName: 'Wolf Creek',             type: 'other_expense',  property: 'all', pct: 100 },

  // Cleaning
  { keyword: 'haynes',          displayName: 'Haynes & Co Cleaning',   type: 'expense',        property: 'all', pct: 100 },
  { keyword: 'turno',           displayName: 'Turno Cleaning',         type: 'expense',        property: 'all', pct: 100 },
  { keyword: 'cleaning',        displayName: 'Cleaning Service',       type: 'expense',        property: 'all', pct: 100 },

  // Airbnb-related descriptions
  { keyword: '🏠',              displayName: 'Property Expense',       type: 'expense',        property: 'all', pct: 100 },
  { keyword: 'airbnb',          displayName: 'Airbnb Fee',             type: 'airbnb_fee',     property: 'all', pct: 100 },

  // Amazon — 80% allocated to Airbnb supplies
  { keyword: 'amazon',          displayName: 'Amazon (Airbnb supplies)', type: 'supply',       property: 'all', pct: 80  },

  // Costco — 80% allocated to Airbnb supplies
  { keyword: 'costco',          displayName: 'Costco (Airbnb supplies)', type: 'supply',       property: 'all', pct: 80  },
]

// GET — preview: returns all matching transactions not yet in Airbnb entries
export async function GET() {
  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount, category')
    .order('date', { ascending: false })

  if (!txns) return NextResponse.json({ matches: [] })

  // Get already-synced source IDs to avoid dupes
  const { data: existing } = await supabaseAdmin
    .from('finance_airbnb_entries')
    .select('source_transaction_id')
    .not('source_transaction_id', 'is', null)

  const syncedIds = new Set((existing || []).map(e => e.source_transaction_id))

  const matches: {
    transaction: typeof txns[0]
    rule: typeof DEFAULT_RULES[0]
    airbnbAmount: number
    alreadySynced: boolean
  }[] = []

  for (const t of txns) {
    const desc = (t.description || '').toLowerCase()
    for (const rule of DEFAULT_RULES) {
      if (desc.includes(rule.keyword.toLowerCase())) {
        const airbnbAmount = Math.abs(Number(t.amount)) * (rule.pct / 100)
        matches.push({
          transaction: t,
          rule,
          airbnbAmount,
          alreadySynced: syncedIds.has(t.id),
        })
        break // only match first rule per transaction
      }
    }
  }

  return NextResponse.json({ matches, rules: DEFAULT_RULES, total: matches.length })
}

// POST — actually sync the selected transactions into airbnb_entries
export async function POST(req: NextRequest) {
  const { transactionIds, propertyOverrides } = await req.json() as {
    transactionIds: string[]
    propertyOverrides: Record<string, string> // txn id → property name
  }

  const { data: txns } = await supabaseAdmin
    .from('finance_transactions')
    .select('id, date, description, amount')
    .in('id', transactionIds)

  if (!txns || txns.length === 0) return NextResponse.json({ synced: 0 })

  // Get already-synced to skip
  const { data: existing } = await supabaseAdmin
    .from('finance_airbnb_entries')
    .select('source_transaction_id')
    .not('source_transaction_id', 'is', null)
  const syncedIds = new Set((existing || []).map(e => e.source_transaction_id))

  const toInsert = []

  for (const t of txns) {
    if (syncedIds.has(t.id)) continue

    const desc = (t.description || '').toLowerCase()
    const rule = DEFAULT_RULES.find(r => desc.includes(r.keyword.toLowerCase()))
    if (!rule) continue

    const airbnbAmount = Math.abs(Number(t.amount)) * (rule.pct / 100)
    const property = propertyOverrides[t.id] || 'Zen Den'
    const year = parseInt((t.date || '').slice(0, 4)) || new Date().getFullYear()

    toInsert.push({
      id: `airbnb_sync_${t.id}`,
      property_name: property,
      date: t.date,
      type: rule.type,
      description: rule.pct < 100
        ? `${rule.displayName} (${rule.pct}% of ${Math.abs(Number(t.amount)).toFixed(2)})`
        : rule.displayName || t.description,
      amount: -airbnbAmount, // expenses are negative
      year,
      source_transaction_id: t.id,
    })
  }

  if (toInsert.length > 0) {
    await supabaseAdmin.from('finance_airbnb_entries').insert(toInsert)
  }

  return NextResponse.json({ synced: toInsert.length })
}
