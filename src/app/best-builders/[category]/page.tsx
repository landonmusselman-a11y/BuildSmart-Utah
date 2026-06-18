'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronDown, ChevronUp, ArrowRight, CheckCircle,
  Home, Phone, ExternalLink
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { categories, getCategoryBuilders, BuilderCategory } from '../categories';
import { Builder } from '@/types';

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-navy-900 pr-4">{q}</span>
        {open
          ? <ChevronUp size={18} className="flex-shrink-0 text-gold-500" />
          : <ChevronDown size={18} className="flex-shrink-0 text-navy-400" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-navy-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Builder Card ──────────────────────────────────────────────────────────────

function BuilderCard({
  builder,
  reason,
  rank,
}: {
  builder: Builder;
  reason: string;
  rank: number;
}) {
  const priceMin = builder.priceMin
    ? `$${Math.round(builder.priceMin / 1000)}K`
    : null;
  const priceMax = builder.priceMax
    ? `$${Math.round(builder.priceMax / 1000)}K`
    : null;

  return (
    <div className="card p-6 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start gap-4">
        {/* Logo avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-white text-base shadow-sm"
          style={{ backgroundColor: builder.logoColor }}
        >
          {builder.logoInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
              #{rank}
            </span>
            <h3 className="font-bold text-navy-900 text-lg leading-snug">
              {builder.name}
            </h3>
          </div>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-3 mt-1.5">
            {priceMin && priceMax && (
              <span className="text-xs text-navy-500 font-medium">
                {priceMin}–{priceMax}
              </span>
            )}
            {builder.warrantyYears > 0 && (
              <span className="text-xs text-navy-400">
                {builder.warrantyYears}-yr warranty
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Why this builder fits */}
      <p className="text-navy-600 text-sm leading-relaxed">{reason}</p>

      {/* Areas */}
      {builder.areas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {builder.areas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full"
            >
              <Home size={10} />
              {area}
            </span>
          ))}
          {builder.areas.length > 3 && (
            <span className="text-xs text-navy-400 py-0.5">
              +{builder.areas.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* View builder link */}
      <Link
        href={`/builders/${builder.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-500 transition-colors mt-auto pt-2 border-t border-gray-100"
      >
        View {builder.name} communities <ExternalLink size={13} />
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { category: string };
}

export default function CategoryPage({ params }: PageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const category: BuilderCategory | undefined = categories.find(
    (c) => c.slug === params.category
  );

  if (!category) {
    notFound();
  }

  const builders = getCategoryBuilders(category);
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 231-7565';

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-navy-900 border-b border-navy-700 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-navy-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/best-builders" className="hover:text-white transition-colors">
              Best Builders For
            </Link>
            <span>/</span>
            <span className="text-navy-200 font-medium truncate">{category.title}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="utah-hero-bg text-white py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              {category.headline}
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed">
              {category.intro}
            </p>
          </div>
        </div>

        {/* Top Picks — Builder Cards */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h2 className="section-heading">Top Builder Picks</h2>
              <p className="section-sub">{category.whyTheseBuildersIntro}</p>
            </div>

            {builders.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {builders.map((builder, i) => (
                  <BuilderCard
                    key={builder.slug}
                    builder={builder}
                    reason={
                      category.builderReasons[builder.slug] ??
                      builder.tagline
                    }
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : (
              /* Fallback: show text-only list for builders not yet in mockBuilders */
              <div className="space-y-4">
                {category.builderSlugs.map((slug, i) => (
                  <div key={slug} className="card p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full mt-0.5">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-navy-900 capitalize">
                          {slug.replace(/-/g, ' ')}
                        </p>
                        <p className="text-navy-600 text-sm mt-1">
                          {category.builderReasons[slug]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Buyer Tips */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="section-heading mb-2">
              Buyer Tips for This Scenario
            </h2>
            <p className="section-sub mb-10">
              Expert guidance specific to this buyer situation.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {category.buyerTips.map((tip, i) => (
                <div
                  key={i}
                  className="card p-5 flex items-start gap-4"
                >
                  <span className="w-8 h-8 rounded-full bg-gold-500 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-navy-700 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-heading text-center mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-navy-500 text-center mb-10">
              Common questions about this buyer scenario.
            </p>
            <div className="space-y-3">
              {category.faqItems.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gold-500 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              {category.cta}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center gap-2 bg-white text-gold-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Schedule Free Consultation <ArrowRight size={16} />
              </Link>
              <a
                href={`tel:${phone.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                <Phone size={16} />
                Call {phone}
              </a>
            </div>

            <p className="text-white/70 text-sm mt-6">
              Free buyer representation — builder-paid. No cost to you.
            </p>
          </div>
        </section>

        {/* Related guides */}
        <section className="py-12 bg-white px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-bold text-navy-900 mb-6">
              More Buyer Scenario Guides
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories
                .filter((c) => c.slug !== category.slug)
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/best-builders/${c.slug}`}
                    className="flex items-center gap-2 group px-4 py-3 rounded-lg border border-gray-200 hover:border-gold-400 hover:bg-gold-50 transition-all text-sm font-medium text-navy-700 hover:text-navy-900"
                  >
                    <CheckCircle size={14} className="text-gold-500 flex-shrink-0" />
                    <span className="line-clamp-1">{c.title}</span>
                    <ArrowRight size={12} className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
