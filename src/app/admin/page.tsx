'use client';

import { useState, useEffect, useCallback } from 'react';

interface Lead {
  id: number;
  created_at: string;
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

type FilterType = 'all' | 'matchmaker' | 'quick' | 'preapproved' | 'hot';

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(iso: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function exportCSV(leads: Lead[]) {
  const headers = [
    'Date', 'First Name', 'Last Name', 'Phone', 'Email',
    'Budget', 'Areas', 'Timeline', 'Pre-Approval', 'Source',
    'Matched Communities', 'Builder Interest', 'Community Interest',
    'Home Type', 'Priorities', 'Message',
  ];
  const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
  const rows = leads.map(l => [
    escape(formatDate(l.created_at)),
    escape(l.first_name),
    escape(l.last_name),
    escape(l.phone),
    escape(l.email),
    escape(l.budget),
    escape(l.areas),
    escape(l.timeline),
    escape(l.pre_approval),
    escape(l.source),
    escape(l.matched_communities),
    escape(l.builder_interest),
    escape(l.community_interest),
    escape(l.home_type),
    escape(l.priorities),
    escape(l.message),
  ].join(','));
  const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buildsmart-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Password gate ─────────────────────────────────────────────────────────────

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_authed', '1');
        onAuth();
      } else {
        setError('Incorrect password. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">BuildSmart Utah</h1>
          <p className="text-gold-400 text-sm mt-1">Admin Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1" htmlFor="pw">
              Password
            </label>
            <input
              id="pw"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-navy-800 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/leads');
      const json = await res.json();
      setLeads(json.leads || []);
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'matchmaker') return l.source?.toLowerCase().includes('matchmaker') || !!l.budget || !!l.areas;
    if (filter === 'quick') return !l.budget && !l.areas;
    if (filter === 'preapproved') return l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved');
    if (filter === 'hot') {
      const budget = parseInt((l.budget || '').replace(/\D/g, ''));
      return (budget >= 400000) || l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved');
    }
    return true;
  });

  const todayCount = leads.filter(l => isToday(l.created_at)).length;
  const preApprovedCount = leads.filter(l =>
    l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved')
  ).length;
  const hotCount = leads.filter(l => {
    const budget = parseInt((l.budget || '').replace(/\D/g, ''));
    return (budget >= 400000) || l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved');
  }).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'matchmaker', label: 'Matchmaker' },
    { key: 'quick', label: 'Quick Inquiry' },
    { key: 'preapproved', label: 'Pre-Approved' },
    { key: 'hot', label: 'Hot Leads' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">BuildSmart Admin</h1>
            <p className="text-gold-400 text-sm">Lead Inbox</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLeads}
              className="px-4 py-2 rounded-lg border border-navy-600 text-navy-200 hover:border-gold-400 hover:text-gold-400 text-sm transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-sm transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Leads', value: leads.length },
            { label: 'Today', value: todayCount },
            { label: 'Pre-Approved', value: preApprovedCount },
            { label: 'Hot Leads', value: hotCount },
          ].map(stat => (
            <div key={stat.label} className="bg-navy-900 border border-navy-700 rounded-xl px-4 py-3">
              <p className="text-3xl font-bold text-gold-400">{stat.value}</p>
              <p className="text-navy-300 text-sm mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-800 text-navy-200 hover:bg-navy-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-navy-400">Loading leads…</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-navy-400">No leads found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-navy-700">
              <table className="min-w-full divide-y divide-navy-700 text-sm">
                <thead className="bg-navy-800">
                  <tr>
                    {['Date', 'Name', 'Phone', 'Email', 'Budget', 'Areas', 'Timeline', 'Pre-Approval', 'Source', 'Matched Communities', 'Actions'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-navy-300 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-navy-900 divide-y divide-navy-800">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-navy-800 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-navy-300">{formatDate(l.created_at)}</td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-white">
                        {l.first_name} {l.last_name}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-navy-200">{l.phone || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-navy-200 max-w-[160px] truncate">{l.email || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-navy-200">{l.budget || '—'}</td>
                      <td className="px-3 py-3 text-navy-200 max-w-[120px] truncate">{l.areas || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-navy-200">{l.timeline || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved'))
                            ? 'bg-green-900 text-green-300'
                            : 'bg-navy-700 text-navy-300'
                        }`}>
                          {l.pre_approval || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-navy-300 text-xs">{l.source || '—'}</td>
                      <td className="px-3 py-3 text-navy-200 max-w-[140px] truncate">{l.matched_communities || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          {l.phone && (
                            <a
                              href={`tel:${l.phone.replace(/\D/g, '')}`}
                              className="px-2 py-1 rounded bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors"
                            >
                              Call
                            </a>
                          )}
                          {l.email && (
                            <a
                              href={`mailto:${l.email}`}
                              className="px-2 py-1 rounded bg-navy-700 hover:bg-navy-600 text-navy-200 text-xs transition-colors"
                            >
                              Email
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map(l => (
                <div key={l.id} className="bg-navy-900 border border-navy-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{l.first_name} {l.last_name}</p>
                      <p className="text-navy-400 text-xs mt-0.5">{formatDate(l.created_at)} · {l.source}</p>
                    </div>
                    {(l.pre_approval?.toLowerCase().includes('yes') || l.pre_approval?.toLowerCase().includes('approved')) && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">Pre-Approved</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {l.phone && <p className="text-navy-300"><span className="text-navy-500 text-xs">Phone: </span>{l.phone}</p>}
                    {l.budget && <p className="text-navy-300"><span className="text-navy-500 text-xs">Budget: </span>{l.budget}</p>}
                    {l.areas && <p className="text-navy-300 col-span-2"><span className="text-navy-500 text-xs">Areas: </span>{l.areas}</p>}
                    {l.timeline && <p className="text-navy-300"><span className="text-navy-500 text-xs">Timeline: </span>{l.timeline}</p>}
                    {l.matched_communities && <p className="text-navy-300 col-span-2"><span className="text-navy-500 text-xs">Communities: </span>{l.matched_communities}</p>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {l.phone && (
                      <a
                        href={`tel:${l.phone.replace(/\D/g, '')}`}
                        className="flex-1 text-center py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold transition-colors"
                      >
                        Call
                      </a>
                    )}
                    {l.email && (
                      <a
                        href={`mailto:${l.email}`}
                        className="flex-1 text-center py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-navy-200 text-sm transition-colors"
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-navy-500 text-xs text-right">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} shown</p>
          </>
        )}
      </main>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === '1') {
      setAuthed(true);
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  return <Dashboard />;
}
