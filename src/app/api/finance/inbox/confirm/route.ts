import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { uploadToDrive } from '@/lib/googleDrive'
import { autoCategory, defaultStore } from '@/lib/financeStore'

function fixSigns(txns: { date: string; description: string; amount: number }[]) {
  if (txns.length === 0) return txns
  const positiveCount = txns.filter(t => Number(t.amount) > 0).length
  const isCreditCard = positiveCount / txns.length > 0.6
  return isCreditCard ? txns.map(t => ({ ...t, amount: -Number(t.amount) })) : txns
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    const { data: item, error } = await supabaseAdmin
      .from('finance_inbox_items')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const d = item.parsed_data as Record<string, unknown>
    const section = item.section as string

    // ── Save to finance tables ────────────────────────────────────────────────

    if (section === 'spending') {
      const accountId = `acct_inbox_${Date.now()}`
      const institution = (d.institution as string) || item.account_name || 'Bank'
      await supabaseAdmin.from('finance_accounts').insert({
        id: accountId,
        name: item.account_name || institution,
        institution,
        type: 'checking',
        balance: 0,
        last_updated: new Date().toISOString(),
      })

      const rawTxns = fixSigns(
        Array.isArray(d.transactions)
          ? (d.transactions as { date: string; description: string; amount: number }[])
          : []
      )

      if (rawTxns.length > 0) {
        // Pull existing transactions for duplicate check
        const { data: existing } = await supabaseAdmin
          .from('finance_transactions')
          .select('date, description, amount')

        const existingKeys = new Set(
          (existing || []).map(t => `${t.date}|${t.description?.trim().toLowerCase()}|${Number(t.amount).toFixed(2)}`)
        )

        const newTxns = rawTxns
          .filter(t => {
            const key = `${t.date}|${t.description?.trim().toLowerCase()}|${Number(t.amount).toFixed(2)}`
            return !existingKeys.has(key)
          })
          .map((t, i) => ({
            id: `${accountId}_${i}`,
            account_id: accountId,
            date: t.date || '',
            description: t.description || '',
            amount: Number(t.amount) || 0,
            // Use Claude's category if provided, fall back to keyword rules
            category: (t as { date: string; description: string; amount: number; category?: string }).category
              || autoCategory(t.description || '', defaultStore.categoryRules),
          }))

        const skipped = rawTxns.length - newTxns.length
        if (newTxns.length > 0) await supabaseAdmin.from('finance_transactions').insert(newTxns)

        // Store skip count for response
        ;(d as Record<string, unknown>)._skipped = skipped
        ;(d as Record<string, unknown>)._imported = newTxns.length
      }
    }

    else if (section === 'airbnb') {
      await supabaseAdmin.from('finance_airbnb_entries').insert({
        id: `airbnb_inbox_${Date.now()}`,
        property_name: item.property_name || 'Zen Den',
        date: (d.date as string) || new Date().toISOString().slice(0, 10),
        type: 'expense',
        description: (d.merchant as string) || (d.description as string) || item.label || 'Expense',
        amount: Number(d.amount || 0),
        year: new Date().getFullYear(),
      })
    }

    else if (section === 'investments') {
      const accountId = `inv_inbox_${Date.now()}`
      await supabaseAdmin.from('finance_investment_accounts').insert({
        id: accountId,
        name: item.account_name || (d.institution as string) || 'Brokerage',
        institution: (d.institution as string) || 'Brokerage',
        last_updated: new Date().toISOString(),
        total_value: Number(d.totalValue || 0),
      })
      const holdings = Array.isArray(d.holdings)
        ? (d.holdings as { symbol: string; name?: string; shares: number; price: number; value: number }[]).map(h => ({
            account_id: accountId,
            symbol: h.symbol || '',
            name: h.name || h.symbol || '',
            shares: Number(h.shares) || 0,
            price: Number(h.price) || 0,
            value: Number(h.value) || 0,
          }))
        : []
      if (holdings.length > 0) await supabaseAdmin.from('finance_investment_holdings').insert(holdings)
    }

    else if (section === 'taxes') {
      await supabaseAdmin.from('finance_tax_documents').insert({
        id: `tax_inbox_${Date.now()}`,
        year: item.tax_year || 2026,
        type: item.tax_type || 'other',
        description: `Imported from ${item.file_name}`,
        payer: item.tax_payer || '',
        amount: item.tax_amount || 0,
        uploaded_at: new Date().toISOString(),
        file_name: item.file_name,
      })
    }

    // ── Upload original file to Google Drive ─────────────────────────────────

    let driveLink: string | null = null
    try {
      const { data: fileData } = await supabaseAdmin.storage
        .from('finance-documents')
        .download(item.file_path)

      if (fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const fileName = item.file_name as string
        const mimeType = fileName.endsWith('.pdf') ? 'application/pdf'
          : fileName.endsWith('.csv') ? 'text/csv'
          : fileName.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg'
          : fileName.endsWith('.png') ? 'image/png'
          : 'application/octet-stream'

        const year = section === 'taxes' ? (item.tax_year || new Date().getFullYear())
          : section === 'spending' ? (d.transactions && Array.isArray(d.transactions) && d.transactions[0]
              ? parseInt((d.transactions[0] as { date: string }).date?.slice(0, 4)) || new Date().getFullYear()
              : new Date().getFullYear())
          : new Date().getFullYear()

        const { webViewLink } = await uploadToDrive({
          fileName,
          fileBuffer: buffer,
          mimeType,
          section,
          label: item.label,
          year,
        })
        driveLink = webViewLink
      }
    } catch (driveErr) {
      // Drive upload failure doesn't block confirm — just log it
      console.error('Drive upload failed:', driveErr)
    }

    // ── Mark confirmed ────────────────────────────────────────────────────────

    await supabaseAdmin
      .from('finance_inbox_items')
      .update({
        status: 'confirmed',
        drive_link: driveLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ ok: true, driveLink })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
