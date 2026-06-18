'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { categories } from './categories';

const ACCENT_COLORS = [
  'border-gold-500',
  'border-navy-500',
  'border-gold-400',
  'border-navy-600',
  'border-gold-600',
  'border-navy-700',
  'border-gold-500',
];

export default function BestBuildersPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* Hero */}
        <div className="utah-hero-bg text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              <Star size={11} />
              Builder Guides
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Find the Right Builder<br />
              <span className="text-gold-400">for Your Situation</span>
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed max-w-2xl mx-auto">
              Every buyer is different. First-time buyers need price certainty and FHA compatibility.
              Luxury buyers need design flexibility and premium lots. Relocating families need to move in
              90 days. These guides match the right Utah builders to the right buyer scenarios.
            </p>
          </div>
        </div>

        {/* Category Grid */}
        <section className="py-20 bg-gray-50 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-heading">Choose Your Buyer Scenario</h2>
              <p className="section-sub mx-auto text-center">
                Seven in-depth guides covering every major buyer type in Utah new construction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/best-builders/${cat.slug}`}
                  className={`card group border-l-4 ${ACCENT_COLORS[i % ACCENT_COLORS.length]} p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-200`}
                >
                  <div>
                    <h3 className="font-bold text-navy-900 text-lg leading-snug group-hover:text-navy-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-navy-500 text-sm mt-2 leading-relaxed line-clamp-3">
                      {cat.intro.slice(0, 140)}
                      {cat.intro.length > 140 ? '…' : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <span className="text-xs text-navy-400 font-medium">
                      {cat.builderSlugs.length} top builders
                    </span>
                    <span className="inline-flex items-center gap-1 text-gold-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      Read the Guide <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 bg-navy-900 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Not Sure Which Category Fits?
            </h2>
            <p className="text-navy-300 text-lg mb-8">
              Answer a few questions and get matched to the right builder and community for your
              specific situation — at zero cost to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/get-started" className="btn-primary">
                Schedule Free Consultation <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-ghost text-white hover:bg-navy-800 hover:text-white border border-navy-600"
              >
                Talk to Landon
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
