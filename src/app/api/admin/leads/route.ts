import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ leads: [], message: 'Supabase not configured' });
  }
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ leads: [], error: error.message });
  }
  return NextResponse.json({ leads: data || [] });
}
