'use client';

import { useState } from 'react';
import { mockBuilders } from '@/data/mock';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BuilderCard from '@/components/BuilderCard';
import BookingModal from '@/components/BookingModal';
import { Search, SlidersHorizontal } from 'lucide-react';

const allAreas = [...new Set(mockBuilders.flatMap((b) => b.areas))].sort();

export default function BuildersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(0);

  const filtered = mockBuilders.filter((b) => {
    const matchesQuery =
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.areas.some((a) => a.toLowerCase().includes(query.toLowerCase())) ||
      b.tagline.toLowerCase().includes(query.toLowerCase());

    const matchesArea = !areaFilter || b.areas.includes(areaFilter);
    const matchesPrice = !maxPrice || b.priceMin <= maxPrice;

    return matchesQuery && matchesArea && matchesPrice;
  });

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-navy-900 text-white py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-3">Utah Home Builders</h1>
            <p className="text-navy-300 text-lg max-w-2xl">
              Every active new construction builder on the Wasatch Front and Back — with current incentives and community information.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search builders..."
                className="input-field pl-9 py-2.5"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="input-field py-2.5 sm:w-56 bg-white"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            >
              <option value="">All Areas</option>
              {allAreas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              className="input-field py-2.5 sm:w-48 bg-white"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            >
              <option value={0}>Any Price</option>
              <option value={500000}>Up to $500K</option>
              <option value={600000}>Up to $600K</option>
              <option value={750000}>Up to $750K</option>
              <option value={1000000}>Up to $1M</option>
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-navy-600 text-sm">
              Showing <span className="font-semibold text-navy-900">{filtered.length}</span> of {mockBuilders.length} builders
            </p>
            <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2">
              Get Free Representation
            </button>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-navy-500">
              <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No builders match your filters.</p>
              <button onClick={() => { setQuery(''); setAreaFilter(''); setMaxPrice(0); }} className="btn-ghost mt-2 text-sm">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
