import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET — list all merchant rules
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('finance_merchant_rules')
    .select('*')
    .order('merchant', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST — upsert a merchant rule
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { merchant, category, entity, is_recurring, display_name } = body

  const { data, error } = await supabaseAdmin
    .from('finance_merchant_rules')
    .upsert({
      merchant: merchant.toLowerCase().trim(),
      category,
      entity: entity || 'personal',
      is_recurring: is_recurring || false,
      display_name: display_name || merchant,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'merchant' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Apply rule to all existing transactions matching this merchant
  if (category) {
    await supabaseAdmin
      .from('finance_transactions')
      .update({ category, entity })
      .ilike('description', `%${merchant.trim()}%`)
  }

  return NextResponse.json({ ok: true, rule: data })
}

// DELETE — remove a merchant rule
export async function DELETE(req: NextRequest) {
  const { merchant } = await req.json()
  await supabaseAdmin
    .from('finance_merchant_rules')
    .delete()
    .eq('merchant', merchant.toLowerCase().trim())
  return NextResponse.json({ ok: true })
}
