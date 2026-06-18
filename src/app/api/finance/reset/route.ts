import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  // Delete in order (respect foreign keys)
  await supabaseAdmin.from('finance_transactions').delete().neq('id', 'none')
  await supabaseAdmin.from('finance_accounts').delete().neq('id', 'none')
  await supabaseAdmin.from('finance_investment_holdings').delete().neq('id', 0)
  await supabaseAdmin.from('finance_investment_accounts').delete().neq('id', 'none')
  await supabaseAdmin.from('finance_airbnb_entries').delete().neq('id', 'none')
  await supabaseAdmin.from('finance_tax_documents').delete().neq('id', 'none')
  await supabaseAdmin.from('finance_inbox_items').delete().neq('id', 'none')
  // Clean up storage
  const { data: files } = await supabaseAdmin.storage.from('finance-documents').list('inbox')
  if (files && files.length > 0) {
    await supabaseAdmin.storage.from('finance-documents').remove(files.map(f => `inbox/${f.name}`))
  }
  return NextResponse.json({ ok: true })
}
