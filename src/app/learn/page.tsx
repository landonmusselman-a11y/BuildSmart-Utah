'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { Search, ArrowRight, Clock, BookOpen, Zap } from 'lucide-react';
import { articles, Article } from './articles';

type CategoryFilter = 'all' | Article['category'];

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'buying-process', label: 'Buying Process' },
  { value: 'financing', label: 'Financing' },
  { value: 'builders-communities', label: 'Builders & Communities' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'incentives', label: 'Incentives' },
];

const categoryColors: Record<Article['category'], { badge: string; text: string }> = {
  'buying-process': { badge: 'bg-blue-100 text-blue-700', text: 'text-blue-700' },
  'financing': { badge: 'bg-purple-100 text-purple-700', text: 'text-purple-700' },
  'builders-communities': { badge: 'bg-gold-100 text-gold-600', text: 'text-gold-600' },
  'negotiation': { badge: 'bg-green-100 text-green-700', text: 'text-green-700' },
  'incentives': { badge: 'bg-orange-100 text-orange-700', text: 'text-orange-700' },
};

function ArticleCard({ article }: { article: Article }) {
  const colors = categoryColors[article.category];
  return (
    <Link
      href={`/learn/${article.slug}`}
      className="card flex flex-col h-full p-6 group hover:border-navy-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
          {article.categoryLabel}
        </span>
        <span className="flex items-center gap-1 text-xs text-navy-400">
          <Clock size={11} />
          {article.readTime} min read
        </span>
      </div>
      <h3 className="text-navy-900 font-bold text-base leading-snug mb-2 group-hover:text-navy-700 transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-navy-500 text-sm leading-relaxed line-clamp-2 flex-1">
        {article.description}
      </p>
      <div className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${colors.text} group-hover:gap-2.5 transition-all`}>
        Read article <ArrowRight size={14} />
      </div>
    </Link>
  );
}

export default function LearnPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const matchesCategory = activeCategory === 'all' || a.category === activeCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <>
      <Header onGetRepresented={() => setModalOpen(true)} />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="utah-hero-bg text-white py-20 px-4">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-gold-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <BookOpen size={12} />
              Free Buyer Education
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Utah New Construction<br className="hidden sm:block" /> Learning Center
            </h1>
            <p className="text-navy-200 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              Everything you need to know before buying a new build home — from contracts to design centers to rate buydowns.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles — contracts, incentives, builders..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-lg text-sm"
              />
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="bg-white border-b border-gray-100 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    activeCategory === cat.value
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Article Grid */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {filtered.length > 0 ? (
              <>
                <p className="text-navy-400 text-sm mb-6">
                  {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                  {activeCategory !== 'all' ? ` in ${categories.find(c => c.value === activeCategory)?.label}` : ''}
                  {query ? ` matching "${query}"` : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-navy-500 text-lg mb-2">No articles found.</p>
                <button
                  onClick={() => { setQuery(''); setActiveCategory('all'); }}
                  className="text-gold-600 font-semibold hover:underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-navy-900 text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to put this knowledge to work?
            </h2>
            <p className="text-navy-300 text-lg mb-8">
              We'll represent you for free — negotiating on your behalf with every Utah builder, from contract review to closing.
            </p>
            <Link href="/get-started" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              <Zap size={16} />
              Schedule Free Consultation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
