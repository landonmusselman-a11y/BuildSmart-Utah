import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('finance_settings')
    .select('*')
    .eq('id', 'default')
    .single()
  if (error) return NextResponse.json({ monthly_budget: 10000 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('finance_settings')
    .upsert({ id: 'default', ...body })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
