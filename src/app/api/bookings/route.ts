import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BREVO_API = 'https://api.brevo.com/v3';
const AGENT_EMAIL = process.env.NEXT_PUBLIC_AGENT_EMAIL || 'Buildsmartutah@gmail.com';
const AGENT_PHONE = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 231-7565';

// GET /api/bookings?date=2026-06-20
// Returns array of booked time slots for that date
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ booked: [] });

  const { data } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('date', date)
    .neq('status', 'cancelled');

  return NextResponse.json({ booked: (data ?? []).map((r) => r.time_slot) });
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, timeSlot, name, email, phone, notes } = body;

  if (!date || !timeSlot || !name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check the slot isn't already taken
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .neq('status', 'cancelled')
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'That time slot was just booked. Please choose another.' }, { status: 409 });
  }

  // Save booking
  const { error } = await supabase.from('bookings').insert({
    date,
    time_slot: timeSlot,
    name,
    email,
    phone: phone || null,
    notes: notes || null,
    status: 'pending',
  });

  if (error) {
    console.error('Booking insert error:', error);
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }

  // Also add to Brevo contacts
  void fetch(`${BREVO_API}/contacts`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name.split(' ')[0], LASTNAME: name.split(' ').slice(1).join(' '), SMS: phone },
      updateEnabled: true,
    }),
  });

  // Email to Landon
  void fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'BuildSmart Utah', email: AGENT_EMAIL },
      to: [{ email: AGENT_EMAIL }],
      subject: `📅 New Consultation Booked — ${name}`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#0F0E0C;padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:#C4A882;margin:0">New Consultation Booked</h2>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;padding:24px;border-radius:0 0 12px 12px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Date</td><td style="font-weight:600">${date}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Time</td><td style="font-weight:600">${timeSlot}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Name</td><td style="font-weight:600">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Phone</td><td><a href="tel:${(phone || '').replace(/\D/g, '')}">${phone || '—'}</a></td></tr>
              ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Notes</td><td>${notes}</td></tr>` : ''}
            </table>
          </div>
        </div>
      `,
    }),
  });

  // Confirmation email to the client
  void fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'BuildSmart Utah', email: AGENT_EMAIL },
      to: [{ email, name }],
      subject: `Your consultation is confirmed — ${date} at ${timeSlot}`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#0F0E0C;padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:#C4A882;margin:0">You're booked, ${name.split(' ')[0]}!</h2>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;padding:24px;border-radius:0 0 12px 12px">
            <p style="margin-top:0">Here are your consultation details:</p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px">
              <div style="font-size:20px;font-weight:700;color:#0F0E0C">${date} at ${timeSlot}</div>
              <div style="color:#6b7280;font-size:13px;margin-top:4px">Free new construction consultation</div>
            </div>
            <p style="color:#374151;font-size:14px">We'll reach out to confirm the meeting format (phone or video). In the meantime, feel free to call or text at ${AGENT_PHONE}.</p>
            <p style="color:#374151;font-size:14px">Looking forward to helping you find your perfect new build — at zero cost to you.</p>
            <p style="color:#374151;font-size:14px;margin-bottom:0">— BuildSmart Utah</p>
          </div>
        </div>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}
