import { LeadFormData } from '@/types';

export async function sendLeadToHighLevel(lead: LeadFormData): Promise<{ ok: boolean; error?: string }> {
  const webhookUrl = process.env.HIGHLEVEL_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('HIGHLEVEL_WEBHOOK_URL not set — lead not sent to CRM');
    return { ok: true }; // fail silently in dev
  }

  try {
    const isMatchmaker = !!(lead.budget || lead.areas?.length);
    const payload = {
      first_name: lead.firstName,
      last_name:  lead.lastName,
      email:      lead.email,
      phone:      lead.phone,
      source:     lead.source || 'BuildSmart Utah',
      tags: [
        'new-construction',
        'utah',
        isMatchmaker ? 'matchmaker-lead' : 'website-lead',
        ...(lead.preApproval === "Yes — I'm pre-approved" ? ['pre-approved'] : []),
        ...(lead.timeline === 'ASAP — I want to move within 60 days' ? ['hot-lead'] : []),
      ],
      customField: {
        // Quick modal fields
        builder_interest:   lead.builderInterest    || '',
        community_interest: lead.communityInterest  || '',
        message:            lead.message            || '',
        // Matchmaker fields
        budget:               lead.budget                                 || lead.priceRange || '',
        areas:                (lead.areas ?? []).join(', ')               || '',
        priorities:           (lead.priorities ?? []).join(', ')          || '',
        home_type:            lead.homeType                               || '',
        timeline:             lead.timeline                               || '',
        pre_approval:         lead.preApproval                            || '',
        matched_communities:  (lead.matchedCommunities ?? []).join(', ') || '',
      },
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HighLevel responded with ${res.status}: ${text}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}
