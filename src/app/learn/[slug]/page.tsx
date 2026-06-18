'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { ChevronRight, Clock, Phone, ArrowRight, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { articles, Article, Section } from '../articles';

const categoryColors: Record<Article['category'], { badge: string }> = {
  'buying-process': { badge: 'bg-blue-100 text-blue-700' },
  'financing': { badge: 'bg-purple-100 text-purple-700' },
  'builders-communities': { badge: 'bg-gold-100 text-gold-600' },
  'negotiation': { badge: 'bg-green-100 text-green-700' },
  'incentives': { badge: 'bg-orange-100 text-orange-700' },
};

function SectionRenderer({ section }: { section: Section }) {
  return (
    <div className="mb-6">
      {section.heading && (
        <h2 className="text-xl font-bold text-navy-900 mb-3 mt-8 first:mt-0">
          {section.heading}
        </h2>
      )}
      {section.body && (
        <p className="text-navy-600 leading-relaxed">{section.body}</p>
      )}
      {section.list && (
        <ul className="space-y-2 mt-3">
          {section.list.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-navy-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
      {section.tip && (
        <div className="flex gap-3 bg-gold-50 border border-gold-200 rounded-xl p-4 mt-3">
          <Lightbulb size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
          <p className="text-gold-800 text-sm leading-relaxed">{section.tip}</p>
        </div>
      )}
      {section.warning && (
        <div className="flex gap-3 bg-navy-50 border border-navy-200 rounded-xl p-4 mt-3">
          <AlertTriangle size={18} className="text-navy-600 flex-shrink-0 mt-0.5" />
          <p className="text-navy-700 text-sm leading-relaxed">{section.warning}</p>
        </div>
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-navy-900 mb-3">Article Not Found</h1>
        <p className="text-navy-500 mb-6">That article doesn't exist or may have moved.</p>
        <Link href="/learn" className="btn-navy">
          Browse All Articles
        </Link>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [modalOpen, setModalOpen] = useState(false);

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <>
        <Header onGetRepresented={() => setModalOpen(true)} />
        <main><NotFoundPage /></main>
        <Footer />
        <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  const colors = categoryColors[article.category];
  const phone = process.env.NEXT_PUBLIC_AGENT_PHONE || '(801) 231-7565';

  const relatedArticles = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="utah-hero-bg text-white py-16 px-4">
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-navy-300 text-xs mb-6 flex-wrap">
              <Link href="/learn" className="hover:text-white transition-colors">
                Learning Center
              </Link>
              <ChevronRight size={12} className="text-navy-500" />
              <span className="text-navy-400">{article.categoryLabel}</span>
              <ChevronRight size={12} className="text-navy-500" />
              <span className="text-navy-200 truncate max-w-[200px] sm:max-w-none">{article.title}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                {article.categoryLabel}
              </span>
              <span className="flex items-center gap-1 text-navy-300 text-xs">
                <Clock size={11} />
                {article.readTime} min read
              </span>
              <span className="text-navy-400 text-xs">{formattedDate}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {article.title}
            </h1>
            <p className="text-navy-200 mt-3 text-lg leading-relaxed max-w-2xl">
              {article.description}
            </p>
          </div>
        </section>

        {/* Content + Sidebar */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="lg:grid lg:grid-cols-3 lg:gap-10">

              {/* Article Content — 2/3 */}
              <article className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 lg:mb-0">
                {article.content.map((section, i) => (
                  <SectionRenderer key={i} section={section} />
                ))}

                {/* Bottom article CTA */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-navy-600 text-sm mb-3 font-medium">
                    Have questions about this topic? We can walk you through it for your specific situation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2.5">
                      <Zap size={13} />
                      Get Free Representation
                    </button>
                    <a href={`tel:${phone.replace(/\D/g, '')}`} className="btn-outline text-sm py-2.5">
                      <Phone size={13} />
                      Call {phone}
                    </a>
                  </div>
                </div>
              </article>

              {/* Sidebar — 1/3 */}
              <aside className="space-y-6">

                {/* CTA Card */}
                <div className="bg-navy-900 text-white rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-2">Get Free Representation</h3>
                  <p className="text-navy-300 text-sm leading-relaxed mb-5">
                    We'll represent you with every Utah builder at zero cost to you — contract review, negotiation, walkthroughs, and more.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary w-full justify-center text-sm"
                  >
                    <Zap size={13} />
                    Schedule Free Consultation
                  </button>
                  <Link
                    href="/get-started"
                    className="mt-2 block text-center text-navy-400 text-xs hover:text-navy-200 transition-colors"
                  >
                    Or fill out the quick form →
                  </Link>
                </div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wide">
                      Related Articles
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/learn/${related.slug}`}
                          className="group flex items-start gap-3"
                        >
                          <div className="flex-1">
                            <p className="text-navy-800 text-sm font-medium leading-snug group-hover:text-navy-600 transition-colors line-clamp-2">
                              {related.title}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-navy-400 mt-1">
                              <Clock size={10} />
                              {related.readTime} min
                            </span>
                          </div>
                          <ArrowRight size={14} className="text-navy-300 group-hover:text-navy-600 transition-colors flex-shrink-0 mt-0.5" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/learn"
                      className="mt-5 block text-center text-xs font-semibold text-gold-600 hover:text-gold-500 transition-colors"
                    >
                      View all articles →
                    </Link>
                  </div>
                )}

                {/* Quick Questions Phone Card */}
                <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5">
                  <h3 className="font-bold text-navy-900 mb-1 text-sm">Quick Questions?</h3>
                  <p className="text-navy-600 text-xs leading-relaxed mb-3">
                    Call or text Landon directly — no obligation, no pressure.
                  </p>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-navy-900 font-bold text-sm hover:text-navy-600 transition-colors"
                  >
                    <Phone size={15} className="text-gold-500" />
                    {phone}
                  </a>
                </div>

              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
