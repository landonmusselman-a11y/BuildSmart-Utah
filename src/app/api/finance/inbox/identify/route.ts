import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const IDENTIFY_PROMPT = `You are identifying a financial document for Landon Rose. Look at the document and return ONLY valid JSON identifying what it is.

Return this structure:
{
  "docType": one of: "bank_statement" | "credit_card" | "venmo" | "tax_1099" | "tax_w2" | "tax_other" | "investment" | "mortgage_statement" | "property_tax" | "airbnb_income" | "expense_receipt" | "utility_bill" | "insurance" | "unknown",
  "institution": "name of bank, company, or issuer",
  "dateRange": "e.g. January 2026 or 2025",
  "accountLast4": "last 4 digits of account if visible",
  "section": one of: "spending" | "taxes" | "airbnb" | "investments",
  "isIncome": true or false (is this primarily income coming IN, or expenses going OUT?),
  "summary": "one sentence describing what this document is",
  "confidence": "high" | "medium" | "low"
}

Examples:
- Chase credit card statement → docType: "credit_card", section: "spending", isIncome: false
- Venmo transaction history CSV → docType: "venmo", section: "spending", isIncome: false, summary: "Venmo transaction history - mixed payments sent and received"
- Mr. Cooper or PennyMac mortgage statement → docType: "mortgage_statement", section: "spending", isIncome: false
- Airbnb 1099-K → docType: "tax_1099", section: "taxes", isIncome: true
- America First bank statement → docType: "bank_statement", section: "spending", isIncome: false
- Robinhood statement → docType: "investment", section: "investments", isIncome: false
- W-2 → docType: "tax_w2", section: "taxes", isIncome: true
- Rocky Mountain Power bill → docType: "utility_bill", section: "spending", isIncome: false
- Airbnb earnings CSV → docType: "airbnb_income", section: "airbnb", isIncome: true`

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()

    const { data: item } = await supabaseAdmin
      .from('finance_inbox_items')
      .select('*')
      .eq('id', id)
      .single()
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: fileData } = await supabaseAdmin.storage
      .from('finance-documents')
      .download(item.file_path)
    if (!fileData) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    const bytes = await fileData.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const fileName = item.file_name as string
    const nameLower = fileName.toLowerCase()
    const mimeType = nameLower.endsWith('.pdf') ? 'application/pdf'
      : nameLower.endsWith('.csv') ? 'text/csv'
      : nameLower.match(/\.jpe?g$/) ? 'image/jpeg'
      : nameLower.endsWith('.png') ? 'image/png'
      : nameLower.endsWith('.webp') ? 'image/webp'
      : nameLower.endsWith('.heic') ? 'image/jpeg'
      : 'application/pdf' // default to PDF for unknown

    let content: Anthropic.MessageParam['content']
    if (mimeType === 'text/csv') {
      const text = Buffer.from(bytes).toString('utf-8')
      content = [{ type: 'text', text: `Identify this CSV file named "${fileName}":\n\n${text.slice(0, 3000)}` }]
    } else if (mimeType === 'application/pdf') {
      content = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } } as Anthropic.DocumentBlockParam,
        { type: 'text', text: 'Identify this financial document.' },
      ]
    } else {
      content = [
        { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png', data: base64 } },
        { type: 'text', text: 'Identify this financial document.' },
      ]
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: IDENTIFY_PROMPT,
      messages: [{ role: 'user', content }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}')
    if (s !== -1 && e > s) cleaned = cleaned.slice(s, e + 1)

    const identity = JSON.parse(cleaned)

    await supabaseAdmin
      .from('finance_inbox_items')
      .update({
        status: 'identified',
        identity,
        section: identity.section,
        label: identity.summary,
        summary: `${identity.institution || ''} · ${identity.dateRange || ''}`.trim().replace(/^·\s*/, ''),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ ok: true, identity })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
