import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data: accounts, error } = await supabaseAdmin
    .from('finance_investment_accounts')
    .select('*, finance_investment_holdings(*)')
    .order('last_updated', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { holdings, ...account } = body

  const { data: acct, error: acctErr } = await supabaseAdmin
    .from('finance_investment_accounts')
    .upsert(account)
    .select()
    .single()
  if (acctErr) return NextResponse.json({ error: acctErr.message }, { status: 500 })

  if (holdings?.length) {
    await supabaseAdmin.from('finance_investment_holdings').delete().eq('account_id', acct.id)
    const rows = holdings.map((h: Record<string, unknown>) => ({ ...h, account_id: acct.id }))
    const { error: hErr } = await supabaseAdmin.from('finance_investment_holdings').insert(rows)
    if (hErr) return NextResponse.json({ error: hErr.message }, { status: 500 })
  }

  return NextResponse.json(acct)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('finance_investment_accounts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
