import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create client if credentials are configured
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface LeadRecord {
  id?: number;
  created_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  budget: string;
  areas: string;
  priorities: string;
  home_type: string;
  timeline: string;
  pre_approval: string;
  matched_communities: string;
  builder_interest: string;
  community_interest: string;
  message: string;
}

export async function saveLeadToSupabase(lead: LeadRecord): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    // Supabase not configured — skip silently (dev mode)
    return { ok: true };
  }
  try {
    const { error } = await supabase.from('leads').insert([lead]);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}
