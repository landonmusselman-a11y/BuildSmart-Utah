import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('finance_inbox_items')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...patch } = body
  const { error } = await supabaseAdmin
    .from('finance_inbox_items')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  // also remove from storage
  const { data: item } = await supabaseAdmin
    .from('finance_inbox_items')
    .select('file_path')
    .eq('id', id)
    .single()
  if (item?.file_path) {
    await supabaseAdmin.storage.from('finance-documents').remove([item.file_path])
  }
  await supabaseAdmin.from('finance_inbox_items').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
