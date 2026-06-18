import { NextRequest, NextResponse } from 'next/server';
import { addContactToBrevo, sendLeadNotificationEmail } from '@/lib/brevo';
import { saveLeadToSupabase, LeadRecord } from '@/lib/supabase';
import { LeadFormData } from '@/types';

export async function POST(request: NextRequest) {
  let body: Partial<LeadFormData>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { firstName, lastName, email, phone } = body;

  if (!firstName?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'First name, email, and phone are required.' }, { status: 422 });
  }

  const lead: LeadFormData = {
    firstName:         firstName.trim(),
    lastName:          (lastName ?? '').trim(),
    email:             email.trim().toLowerCase(),
    phone:             phone.trim(),
    builderInterest:   body.builderInterest?.trim()   || '',
    communityInterest: body.communityInterest?.trim() || '',
    message:           body.message?.trim()           || '',
    budget:            body.budget              || '',
    areas:             body.areas               || [],
    priorities:        body.priorities          || [],
    homeType:          body.homeType            || '',
    timeline:          body.timeline            || '',
    preApproval:       body.preApproval         || '',
    matchedCommunities: body.matchedCommunities || [],
    priceRange:        body.priceRange?.trim()  || body.budget || '',
    source:            body.source || 'BuildSmart Utah',
  };

  const supabaseLead: LeadRecord = {
    first_name:          lead.firstName,
    last_name:           lead.lastName,
    email:               lead.email,
    phone:               lead.phone,
    source:              lead.source,
    budget:              lead.budget || '',
    areas:               (lead.areas || []).join(', '),
    priorities:          (lead.priorities || []).join(', '),
    home_type:           lead.homeType || '',
    timeline:            lead.timeline || '',
    pre_approval:        lead.preApproval || '',
    matched_communities: (lead.matchedCommunities || []).join(', '),
    builder_interest:    lead.builderInterest || '',
    community_interest:  lead.communityInterest || '',
    message:             lead.message || '',
  };

  // Save to database — fire and forget
  void saveLeadToSupabase(supabaseLead);

  // Add to Brevo CRM + send notification email — fire and forget
  void addContactToBrevo(lead);
  void sendLeadNotificationEmail(lead);

  return NextResponse.json({ success: true });
}
