import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a financial document parser for Landon Rose. Extract ALL financial data and return ONLY valid JSON — no explanation, no markdown, no code blocks.

## SIGN CONVENTION
- Expenses/payments = NEGATIVE. Income/deposits = POSITIVE.
- Credit card purchases → NEGATIVE. Bank withdrawals → NEGATIVE. Deposits → POSITIVE.

## TAX DOCUMENT FORMATS — USE THESE EXACTLY

Form 1098 (Mortgage Interest Statement):
{"docType":"1098","lender":"Servbank","propertyAddress":"123 Main St","box1_interestPaid":8420.50,"box2_outstandingBalance":285000.00,"box3_originationDate":"2021-03-01","box5_mortgageInsurance":0,"year":2025}
CRITICAL: box1_interestPaid is the mortgage interest deduction amount (Box 1 on the form). Always extract this — it is NEVER zero unless the form literally shows $0.00 in Box 1.

Form 1099-K: {"docType":"1099-K","payer":"Airbnb","amount":65789.00,"year":2025}
Form 1099-NEC: {"docType":"1099-NEC","payer":"Company Name","amount":12000.00,"year":2025}
Form 1099-INT: {"docType":"1099-INT","payer":"Servbank","amount":27.00,"year":2025}
Form 1099-DIV: {"docType":"1099-DIV","payer":"Robinhood","ordinaryDividends":150.00,"qualifiedDividends":150.00,"year":2025}
Form 1099-MISC: {"docType":"1099-MISC","payer":"Company","amount":500.00,"year":2025}
W-2: {"docType":"W2","employer":"Company","wagesBox1":75000.00,"federalTaxBox2":12000.00,"stateTaxBox17":4500.00,"year":2025}
K-1: {"docType":"K1","partnership":"Entity Name","ordinaryIncome":5000.00,"year":2025}
Property Tax: {"docType":"property_tax","assessor":"Salt Lake County","propertyAddress":"123 Main St","amount":2400.00,"year":2025}

## BANK / CREDIT CARD / VENMO

Bank or credit card statement:
{"docType":"bank_statement","institution":"Chase","statementType":"checking","transactions":[{"date":"2026-01-15","description":"AMAZON.COM","amount":-89.99,"category":"Shopping"}]}

Venmo:
{"docType":"venmo","transactions":[{"date":"2026-01-10","description":"Venmo - Jake: dinner","amount":-24.00,"category":"Food & Dining"}]}

## INVESTMENT

{"docType":"investment_statement","institution":"Robinhood","totalValue":45230.00,"holdings":[{"symbol":"AAPL","name":"Apple Inc","shares":10.5,"price":189.50,"value":1989.75}]}

## RECEIPTS / BILLS

{"docType":"expense","merchant":"Rocky Mountain Power","amount":142.50,"date":"2026-01-10","category":"Utilities","propertyHint":"Zen Den"}

Unknown: {"docType":"unknown","rawText":"first 300 chars of document"}

Extract EVERY field visible on the document. Never return 0 for an amount that is clearly printed on the form.`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const fileName = file.name || 'document'
    const nameLower = fileName.toLowerCase()

    // Detect by filename first (more reliable than file.type when dragged)
    const mimeType = nameLower.endsWith('.pdf') ? 'application/pdf'
      : nameLower.endsWith('.csv') ? 'text/csv'
      : nameLower.endsWith('.png') ? 'image/png'
      : nameLower.match(/\.jpe?g$/) ? 'image/jpeg'
      : nameLower.endsWith('.webp') ? 'image/webp'
      : nameLower.endsWith('.heic') ? 'image/jpeg'
      : file.type || 'application/octet-stream'

    let content: Anthropic.MessageParam['content']

    if (mimeType === 'text/csv' || nameLower.endsWith('.csv')) {
      const text = Buffer.from(bytes).toString('utf-8')
      content = [
        {
          type: 'text',
          text: `Parse this CSV file named "${fileName}":\n\n${text.slice(0, 8000)}`,
        },
      ]
    } else if (mimeType === 'application/pdf') {
      content = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64,
          },
        } as Anthropic.DocumentBlockParam,
        { type: 'text', text: 'Extract all financial data from this document.' },
      ]
    } else if (mimeType.startsWith('image/')) {
      const imgType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      content = [
        {
          type: 'image',
          source: { type: 'base64', media_type: imgType, data: base64 },
        },
        { type: 'text', text: 'Extract all financial data from this image.' },
      ]
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, image, or CSV.' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip markdown fences and extract JSON
    let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    // If there's prose before/after the JSON, extract just the JSON object
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1)
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Could not parse document', raw: text }, { status: 422 })
    }

    return NextResponse.json({ ok: true, data: parsed, fileName })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
