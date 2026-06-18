import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('accountId')
  let query = supabaseAdmin.from('finance_transactions').select('*').order('date', { ascending: false })
  if (accountId) query = query.eq('account_id', accountId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // body can be a single object or array
  const rows = Array.isArray(body) ? body : [body]
  const { data, error } = await supabaseAdmin.from('finance_transactions').upsert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { id, category } = await req.json()
  const { error } = await supabaseAdmin.from('finance_transactions').update({ category }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { accountId } = await req.json()
  const { error } = await supabaseAdmin.from('finance_transactions').delete().eq('account_id', accountId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
