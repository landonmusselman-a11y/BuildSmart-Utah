'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

type Step = 'date' | 'time' | 'form' | 'done';

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const today = new Date();
  const [step, setStep] = useState<Step>('date');
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('date');
      setSelectedDate('');
      setSelectedTime('');
      setForm({ name: '', email: '', phone: '', notes: '' });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    fetch(`/api/bookings?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setBookedSlots(d.booked ?? []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function pickDate(day: number) {
    const dow = new Date(viewYear, viewMonth, day).getDay();
    const ds = toDateStr(viewYear, viewMonth, day);
    if (dow === 0 || dow === 6 || ds <= todayStr) return;
    setSelectedDate(ds);
    setSelectedTime('');
    setStep('time');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, timeSlot: selectedTime, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStep('done');
      // Fire GA4 + Google Ads conversion on successful booking
      if (typeof window !== 'undefined') {
        const w = window as { gtag?: (...args: unknown[]) => void };
        if (w.gtag) {
          w.gtag('event', 'booking_confirmed', { event_category: 'engagement', event_label: selectedDate });
          w.gtag('event', 'conversion', { send_to: 'AW-18251519886/KwdECNHg1cEcEI6vgP9D' });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-navy-900 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Schedule Free Consultation</h2>
            <p className="text-navy-400 text-xs mt-0.5">Mon–Fri · 9 AM–4 PM Mountain Time</p>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-2">
            {(['date', 'time', 'form'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
                step === s ? 'bg-gold-500' :
                (['date','time','form'].indexOf(step) > i) ? 'bg-navy-300' : 'bg-gray-100'
              }`} />
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* ── STEP 1: Date picker ── */}
          {step === 'date' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <span className="font-bold text-navy-900">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className={`text-center text-[11px] font-semibold py-1 ${d === 'Sun' || d === 'Sat' ? 'text-gray-300' : 'text-navy-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const ds = toDateStr(viewYear, viewMonth, day);
                  const dow = new Date(viewYear, viewMonth, day).getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isPast = ds <= todayStr;
                  const isSelected = ds === selectedDate;
                  const disabled = isWeekend || isPast;
                  return (
                    <button
                      key={day}
                      onClick={() => !disabled && pickDate(day)}
                      className={`h-9 w-9 mx-auto rounded-xl text-sm font-medium transition-all ${
                        isSelected ? 'bg-navy-900 text-white' :
                        disabled ? 'text-gray-200 cursor-default' :
                        'hover:bg-gold-50 hover:text-gold-700 text-navy-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-navy-400 text-center mt-4">Select a weekday to see available times</p>
            </div>
          )}

          {/* ── STEP 2: Time picker ── */}
          {step === 'time' && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setStep('date')} className="text-navy-400 hover:text-navy-900 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-gold-500" />
                  <span className="font-semibold text-navy-900 text-sm">{formattedDate}</span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8 text-navy-400">
                  <Loader2 size={20} className="animate-spin mr-2" /> Checking availability…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const taken = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => { setSelectedTime(slot); setStep('form'); }}
                        className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                          taken
                            ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-default'
                            : 'border-navy-100 text-navy-800 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700'
                        }`}
                      >
                        <Clock size={14} className={taken ? 'text-gray-300' : 'text-gold-500'} />
                        {slot}
                        {taken && <span className="text-[10px] ml-auto text-gray-300">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Contact form ── */}
          {step === 'form' && (
            <form onSubmit={submit}>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => setStep('time')} className="text-navy-400 hover:text-navy-900 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gold-500" />
                    <span className="text-sm font-semibold text-navy-900">{formattedDate}</span>
                  </div>
                  <span className="text-navy-300">·</span>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gold-500" />
                    <span className="text-sm font-semibold text-navy-900">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <input
                  required
                  type="text"
                  placeholder="Your full name *"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address *"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
                <textarea
                  rows={2}
                  placeholder="Anything you'd like us to know before the call? (optional)"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy-900 hover:bg-navy-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Booking…' : 'Confirm My Consultation'}
              </button>
              <p className="text-center text-xs text-navy-400 mt-3">
                A confirmation will be sent to your email. Zero cost, no obligation.
              </p>
            </form>
          )}

          {/* ── STEP 4: Confirmation ── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-navy-900 text-xl mb-2">You're booked!</h3>
              <p className="text-navy-500 text-sm mb-1">
                <strong className="text-navy-900">{formattedDate} at {selectedTime}</strong>
              </p>
              <p className="text-navy-400 text-sm mb-6">
                Check your email for a confirmation. We'll reach out to confirm the meeting format before the call.
              </p>
              <button
                onClick={onClose}
                className="bg-navy-900 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-navy-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
