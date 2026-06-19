import { LeadFormData } from '@/types';

const BREVO_API = 'https://api.brevo.com/v3';

function getApiKey(): string | undefined {
  return process.env.BREVO_API_KEY;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

export async function addContactToBrevo(lead: LeadFormData): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set — contact not added to Brevo');
    return;
  }

  try {
    await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: lead.email,
        attributes: {
          FIRSTNAME: lead.firstName,
          LASTNAME: lead.lastName || '',
          SMS: toE164(lead.phone),
        },
        updateEnabled: true,
      }),
    });
  } catch (err) {
    console.error('Brevo add contact error:', err);
  }
}

export async function sendLeadNotificationEmail(lead: LeadFormData): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) return;

  const agentEmail = process.env.NEXT_PUBLIC_AGENT_EMAIL || 'Buildsmartutah@gmail.com';
  const agentName  = process.env.NEXT_PUBLIC_AGENT_NAME  || 'Landon Rose';

  const isMatchmaker = !!(lead.budget || lead.areas?.length);
  const leadType = isMatchmaker ? 'Matchmaker Form' : 'Quick Contact Form';

  const rows = [
    ['Name',          `${lead.firstName} ${lead.lastName}`.trim()],
    ['Phone',         `<a href="tel:${lead.phone.replace(/\D/g,'')}" style="color:#0f0e0c">${lead.phone}</a>`],
    ['Email',         `<a href="mailto:${lead.email}" style="color:#0f0e0c">${lead.email}</a>`],
    ['Source',        leadType],
    lead.builderInterest   && ['Builder Interest',   lead.builderInterest],
    lead.communityInterest && ['Community Interest', lead.communityInterest],
    lead.priceRange        && ['Price Range',        lead.priceRange],
    lead.areas?.length     && ['Areas',              lead.areas.join(', ')],
    lead.homeType          && ['Home Type',          lead.homeType],
    lead.timeline          && ['Timeline',           lead.timeline],
    lead.preApproval       && ['Pre-Approved',       lead.preApproval],
    lead.matchedCommunities?.length && ['Matched Communities', lead.matchedCommunities.join(', ')],
    lead.message           && ['Message',            lead.message],
  ].filter(Boolean) as [string, string][];

  const tableRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#4d4944;width:160px;vertical-align:top;border-bottom:1px solid #edece9">${label}</td>
        <td style="padding:8px 12px;color:#0f0e0c;border-bottom:1px solid #edece9">${value}</td>
      </tr>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#faf8f4;padding:32px 16px">
      <div style="background:#0f0e0c;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#c4a882;font-weight:800;font-size:18px;letter-spacing:-0.5px">BUILDSMART UTAH</span>
        <span style="color:#ffffff;font-size:13px;margin-left:12px;opacity:0.6">New Lead Alert</span>
      </div>
      <div style="background:#ffffff;border-radius:0 0 12px 12px;border:1px solid #edece9;border-top:none;padding:24px">
        <h2 style="margin:0 0 4px;font-size:22px;color:#0f0e0c">
          ${lead.firstName} ${lead.lastName}
        </h2>
        <p style="margin:0 0 20px;color:#6b6660;font-size:13px">Submitted via ${leadType}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${tableRows}
        </table>
        <div style="margin-top:24px;padding:16px;background:#faf8f4;border-radius:8px;text-align:center">
          <a href="tel:${lead.phone.replace(/\D/g,'')}"
             style="display:inline-block;background:#0f0e0c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px">
            Call ${lead.firstName} Now
          </a>
        </div>
      </div>
      <p style="text-align:center;font-size:11px;color:#8e8a83;margin-top:16px">
        BuildSmart Utah · utahnewconstruction.com
      </p>
    </div>
  `;

  try {
    await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender:      { name: 'BuildSmart Utah', email: agentEmail },
        to:          [{ email: agentEmail, name: agentName }],
        subject:     `New Lead: ${lead.firstName} ${lead.lastName} — ${lead.phone}`,
        htmlContent: html,
      }),
    });
  } catch (err) {
    console.error('Brevo notification email error:', err);
  }
}
