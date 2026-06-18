'use client';

import { useState } from 'react';
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { LeadFormData } from '@/types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBuilder?: string;
  defaultCommunity?: string;
  title?: string;
}

const priceOptions = [
  'Under $450K',
  '$450K–$550K',
  '$550K–$700K',
  '$700K–$900K',
  '$900K+',
];

const timelineOptions = [
  'ASAP / already looking',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  'Just exploring',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function LeadModal({ isOpen, onClose, defaultBuilder, defaultCommunity, title }: LeadModalProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState<Partial<LeadFormData>>({
    builderInterest: defaultBuilder || '',
    communityInterest: defaultCommunity || '',
  });

  if (!isOpen) return null;

  const update = (field: keyof LeadFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'Lead Modal',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
      // GA4 lead conversion event
      if (typeof window !== 'undefined') {
        const w = window as { gtag?: (...args: unknown[]) => void };
        if (w.gtag) {
          w.gtag('event', 'generate_lead', {
            event_category: 'engagement',
            event_label: form.builderInterest || 'General',
          });
        }
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-utah-gradient p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="text-white font-bold text-xl">
            {title || 'Get Free Buyer Representation'}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            We represent buyers at no cost to you — the builder pays our commission.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-900 mb-2">You're all set!</h3>
            <p className="text-navy-600 mb-6">
              We'll reach out within a few hours to answer your questions and help you navigate the new construction process.
            </p>
            <button onClick={onClose} className="btn-navy">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Jane"
                  value={form.firstName || ''}
                  onChange={(e) => update('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Smith"
                  value={form.lastName || ''}
                  onChange={(e) => update('lastName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="jane@example.com"
                value={form.email || ''}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="(801) 555-0100"
                value={form.phone || ''}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>

            {!defaultBuilder && (
              <div>
                <label className="label">Builder or Community Interest</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ivory Homes, Daybreak..."
                  value={form.builderInterest || ''}
                  onChange={(e) => update('builderInterest', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price Range</label>
                <select
                  className="input-field bg-white"
                  value={form.priceRange || ''}
                  onChange={(e) => update('priceRange', e.target.value)}
                >
                  <option value="">Select range</option>
                  {priceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Timeline</label>
                <select
                  className="input-field bg-white"
                  value={form.timeline || ''}
                  onChange={(e) => update('timeline', e.target.value)}
                >
                  <option value="">Select timeline</option>
                  {timelineOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Questions or Notes</label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder="Any specific questions, areas you're considering, or things I should know..."
                value={form.message || ''}
                onChange={(e) => update('message', e.target.value)}
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={15} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full justify-center text-base py-3.5"
            >
              {status === 'loading' ? (
                <><Loader2 size={18} className="animate-spin" /> Sending...</>
              ) : (
                'Connect With Us — Free'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              No spam. Your info is used only to contact you about Utah new construction.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
