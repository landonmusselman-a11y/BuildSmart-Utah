import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a financial document parser for Landon Rose, a Utah real estate agent with 3 Airbnb properties (Zen Den, Still Nest, Zen Nest) and a Robinhood investment account. Extract ALL financial data and return ONLY valid JSON — no explanation, no markdown, no code blocks.

## SIGN CONVENTION — CRITICAL
- Money LEAVING (purchases, expenses, fees, payments made) = NEGATIVE
- Money ENTERING (deposits, income, refunds, payments received) = POSITIVE
- CREDIT CARD: purchases → NEGATIVE. Payments to card → POSITIVE.
- BANK: withdrawals/debits → NEGATIVE. Deposits/credits → POSITIVE.
- VENMO: money sent out → NEGATIVE. Money received → POSITIVE. "Payment" to someone = NEGATIVE. "Charge" you received = POSITIVE.

## CATEGORIES — assign each transaction exactly one:
- "Food & Dining" — restaurants, groceries, Costco, DoorDash, Starbucks, Instacart, fast food
- "Shopping" — Amazon, Walmart, Target, Home Depot, Lowe's, online retail
- "Mortgage" — ANY payment to a mortgage servicer (Mr. Cooper, PennyMac, Chase Mortgage, LoanDepot, Wells Fargo Home, Nationstar, PHH, NewRez, loancare, BSI, SPS, Shellpoint, any "mortgage" or "home loan" payment). Use "Mortgage" NOT "Housing".
- "Housing" — rent, HOA, home improvement, repairs that are NOT mortgage payments
- "Utilities" — power, gas, water, internet, phone, Starlink, AT&T, Verizon, Rocky Mountain Power, Questar
- "Subscriptions" — Netflix, Hulu, Spotify, YouTube TV, Disney+, OpenAI, ChatGPT, Apple, iCloud, Adobe, Patreon
- "Transportation" — gas stations, Uber, Lyft, parking, auto repair, Maverik, Shell, Chevron, oil change
- "Travel" — airlines, hotels, Airbnb stays (as guest), ski resorts, Wolf Creek, vacation
- "Health & Medical" — pharmacy, CVS, Walgreens, doctor, dentist, gym, fitness
- "Insurance" — any insurance payment (home, auto, health, umbrella)
- "Airbnb" — Turno, cleaning fees, supplies for rental properties, anything clearly for Zen Den/Still Nest/Zen Nest
- "Business" — MLS fees, real estate marketing, office supplies, professional services, E&O insurance
- "Kids & Family" — school, daycare, children's activities, family expenses
- "Personal Care" — salon, barber, spa, beauty
- "Income" — payroll, direct deposit, commission, real estate commission, rental income
- "Transfer" — Zelle, bank-to-bank transfer, credit card payments, loan payments between own accounts
- "Venmo" — Venmo transactions where purpose is unclear from the note. If purpose IS clear from note, use that category instead.
- "Taxes & Fees" — IRS, Utah State Tax, government fees, tax payments
- "Other" — truly uncategorizable

## VENMO SPECIAL RULES
Venmo exports have a "Note" field. Use the note to determine the real category:
- Note mentions food/restaurant/dinner/lunch/pizza → "Food & Dining"
- Note mentions rent/mortgage/utilities → appropriate category
- Note is vague ("thanks", "💸", person's name only, blank) → "Venmo"
- Note mentions airbnb/cleaning/Turno/property → "Airbnb"
- Venmo transactions to/from Ashlan Rose → "Transfer"
- Include the note text in the description field: "Venmo - [Name]: [note]"
- SIGN: "Payment" row = you sent money = NEGATIVE. "Standard Transfer" or "Charge" received = POSITIVE.

## MORTGAGE DETECTION IN BANK STATEMENTS
When you see a payment in a bank statement to any mortgage servicer, categorize it as "Mortgage" and add a "propertyHint" field if you can guess the property. Common servicers: Mr. Cooper, PennyMac, LoanDepot, Chase Home, Wells Fargo Mortgage, Nationstar, Shellpoint, NewRez, BSI Financial, LoanCare, SPS.

## OUTPUT FORMATS

Bank or credit card statement:
{"docType":"bank_statement","institution":"Chase","statementType":"checking","transactions":[{"date":"2026-01-15","description":"MR COOPER MORTGAGE","amount":-1850.00,"category":"Mortgage","propertyHint":"primary"},{"date":"2026-01-14","description":"AMAZON.COM","amount":-89.99,"category":"Shopping"}]}

Venmo CSV or statement:
{"docType":"venmo","transactions":[{"date":"2026-01-10","description":"Venmo - Jake Smith: dinner last night","amount":-24.00,"category":"Food & Dining"},{"date":"2026-01-08","description":"Venmo - Sarah Jones: thanks","amount":40.00,"category":"Venmo"}]}

Mortgage statement (standalone document):
{"docType":"mortgage","lender":"Mr. Cooper","propertyAddress":"123 Main St, Salt Lake City UT","monthlyPayment":1850.00,"principal":420.00,"interest":1380.00,"escrow":50.00,"balance":285000.00,"date":"2026-01-01"}

1099 (any type):
{"docType":"1099-K","payer":"Airbnb","amount":12500.00,"year":2025}

Investment / brokerage:
{"docType":"investment_statement","institution":"Robinhood","totalValue":45230.00,"holdings":[{"symbol":"AAPL","name":"Apple Inc","shares":10.5,"price":189.50,"value":1989.75}]}

Expense receipt or utility bill:
{"docType":"expense","merchant":"Rocky Mountain Power","amount":-142.50,"date":"2026-01-10","category":"Utilities","propertyHint":"Zen Den"}

Property tax:
{"docType":"property_tax","assessor":"Salt Lake County","propertyAddress":"123 Main St","amount":-2400.00,"year":2025}

W-2:
{"docType":"W2","employer":"Company Name","wagesBox1":75000.00,"federalTaxBox2":12000.00,"year":2025}

Unknown:
{"docType":"unknown","rawText":"...first 500 chars..."}

Extract EVERY transaction without exception. Never summarize, skip, or truncate. Always include year.`

function routeDoc(data: Record<string, unknown>) {
  const t = (data.docType as string)?.toLowerCase() || ''
  if (t === 'bank_statement' || t === 'credit_card') {
    const count = Array.isArray(data.transactions) ? data.transactions.length : 0
    const label = t === 'credit_card' ? 'Credit Card Statement' : 'Bank Statement'
    return { section: 'spending', label, summary: `${data.institution || 'Bank'} · ${count} transactions` }
  }
  if (t === 'venmo') {
    const count = Array.isArray(data.transactions) ? data.transactions.length : 0
    return { section: 'spending', label: 'Venmo History', summary: `Venmo · ${count} transactions` }
  }
  if (t === 'mortgage') {
    // Standalone mortgage statement → taxes section for interest tracking
    const interest = Number(data.interest || 0)
    return { section: 'taxes', label: 'Mortgage Statement', summary: `${data.lender || 'Lender'} · $${interest.toLocaleString()} interest` }
  }
  if (t.startsWith('1099') || t === 'w2' || t === 'k1' || t === 'property_tax') {
    const label = t === 'w2' ? 'W-2' : t === 'property_tax' ? 'Property Tax' : data.docType as string
    return { section: 'taxes', label, summary: `${data.payer || data.employer || data.assessor || ''} · $${Number(data.amount || data.wagesBox1 || 0).toLocaleString()}` }
  }
  if (t === 'investment_statement') {
    return { section: 'investments', label: 'Investment Statement', summary: `${data.institution || 'Brokerage'} · $${Number(data.totalValue || 0).toLocaleString()}` }
  }
  if (t === 'expense' || t === 'airbnb_statement') {
    return { section: 'airbnb', label: t === 'expense' ? 'Expense Receipt' : 'Airbnb Statement', summary: `${data.merchant || data.institution || ''} · $${Number(data.amount || 0).toLocaleString()}` }
  }
  return { section: 'unknown', label: 'Unknown Document', summary: 'Could not identify document type' }
}

export async function POST() {
  try {
    // Unstick any item that's been "processing" for more than 3 minutes
    const stuckCutoff = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('finance_inbox_items')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('status', 'processing')
      .lt('updated_at', stuckCutoff)

    // Check if already processing something
    const { data: processing } = await supabaseAdmin
      .from('finance_inbox_items')
      .select('id')
      .eq('status', 'processing')
      .limit(1)
    if (processing && processing.length > 0) return NextResponse.json({ ok: true, skipped: 'already processing' })

    // Get next queued item (skip 'identified' — those wait for user approval)
    const { data: queued } = await supabaseAdmin
      .from('finance_inbox_items')
      .select('*')
      .in('status', ['queued', 'approved'])
      .order('created_at', { ascending: true })
      .limit(1)
    if (!queued || queued.length === 0) return NextResponse.json({ ok: true, skipped: 'nothing queued' })

    const item = queued[0]

    // Mark as processing
    await supabaseAdmin
      .from('finance_inbox_items')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', item.id)

    try {
      // Download file from storage
      const { data: fileData, error: dlError } = await supabaseAdmin.storage
        .from('finance-documents')
        .download(item.file_path)
      if (dlError || !fileData) throw new Error(dlError?.message || 'Could not download file')

      const bytes = await fileData.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const fileName = item.file_name as string
      const mimeType = fileName.endsWith('.csv') ? 'text/csv'
        : fileName.endsWith('.pdf') ? 'application/pdf'
        : fileName.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg'
        : fileName.endsWith('.png') ? 'image/png'
        : fileName.endsWith('.webp') ? 'image/webp'
        : 'application/octet-stream'

      let content: Anthropic.MessageParam['content']

      if (mimeType === 'text/csv') {
        const text = Buffer.from(bytes).toString('utf-8')
        content = [{ type: 'text', text: `Parse this CSV file named "${fileName}":\n\n${text.slice(0, 8000)}` }]
      } else if (mimeType === 'application/pdf') {
        content = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } } as Anthropic.DocumentBlockParam,
          { type: 'text', text: 'Extract all financial data from this document.' },
        ]
      } else if (mimeType.startsWith('image/')) {
        content = [
          { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 } },
          { type: 'text', text: 'Extract all financial data from this image.' },
        ]
      } else {
        throw new Error('Unsupported file type')
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
      const jsonStart = cleaned.indexOf('{')
      const jsonEnd = cleaned.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd > jsonStart) cleaned = cleaned.slice(jsonStart, jsonEnd + 1)

      const parsed = JSON.parse(cleaned) as Record<string, unknown>

      // Fix transaction sign convention:
      // Credit card statements: charges are positive (should be negative = expense)
      //                         payments/credits are negative (should be positive = income)
      // Bank statements: debits are negative (already correct)
      //                  deposits are positive (already correct)
      // Heuristic: if >60% of transactions are positive, it's likely a credit card — flip signs
      if (Array.isArray(parsed.transactions) && parsed.transactions.length > 0) {
        const txns = parsed.transactions as { date: string; description: string; amount: number }[]
        const positiveCount = txns.filter(t => Number(t.amount) > 0).length
        const isCreditCard = positiveCount / txns.length > 0.6
        if (isCreditCard) {
          parsed.transactions = txns.map(t => ({ ...t, amount: -Number(t.amount) }))
        }
      }

      const { section, label, summary } = routeDoc(parsed)
      const taxYear = Number(parsed.year) || 2026

      const TAX_TYPES = ['1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV','W2','K1','mortgage_interest','property_tax','other']
      const rawType = (parsed.docType as string) || ''
      const taxType = TAX_TYPES.includes(rawType) ? rawType
        : rawType === 'mortgage' ? 'mortgage_interest'
        : rawType === 'W2' ? 'W2'
        : 'other'

      await supabaseAdmin
        .from('finance_inbox_items')
        .update({
          status: 'ready',
          parsed_data: parsed,
          section,
          label,
          summary,
          account_name: (parsed.institution as string) || fileName.replace(/\.[^.]+$/, ''),
          property_name: (parsed.propertyHint as string) || 'Zen Den',
          tax_year: taxYear,
          tax_type: taxType,
          tax_payer: (parsed.payer || parsed.employer || parsed.lender || parsed.assessor || '') as string,
          tax_amount: Number(parsed.amount || parsed.wagesBox1 || parsed.interest || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process'
      await supabaseAdmin
        .from('finance_inbox_items')
        .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    }

    // Chain: process next item
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/finance/inbox/process`, { method: 'POST' }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
