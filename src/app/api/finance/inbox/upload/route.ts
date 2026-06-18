import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const id = `inbox_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const filePath = `inbox/${id}/${file.name}`

    // Check for duplicate by filename + size
    const { data: existing } = await supabaseAdmin
      .from('finance_inbox_items')
      .select('id')
      .eq('file_name', file.name)
      .eq('file_size', file.size)
      .not('status', 'eq', 'confirmed')
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true, id: existing[0].id })
    }

    // Upload to storage
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
      .from('finance-documents')
      .upload(filePath, bytes, { contentType: file.type || 'application/octet-stream' })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    // Insert inbox row
    const { error: insertError } = await supabaseAdmin
      .from('finance_inbox_items')
      .insert({
        id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    // Kick off background processing (fire and forget)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/finance/inbox/process`, { method: 'POST' }).catch(() => {})

    return NextResponse.json({ ok: true, id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
