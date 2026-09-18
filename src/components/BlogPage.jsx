import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { blogs as fallbackBlogs, blogCategories as defaultCategories } from '../data/blogs';

export default function BlogPage({ onNavigate, onSelectArticle, onOpenConsultation }) {
  const [articles, setArticles] = useState(() => fallbackBlogs);
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [searchQuery, setSearchQuery] = useState('');

  const loadBlogs = async () => {
    try {
      const res = await api.blogs.list();
      if (res?.blogs && res.blogs.length > 0) {
        setArticles(res.blogs);
      }
    } catch (err) {
      console.warn('Could not load blogs from Supabase:', err);
    }
  };

  useEffect(() => {
    loadBlogs();
    const unsub = api.realtime.subscribeBlogs(() => {
      loadBlogs();
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(['All Articles']);
    defaultCategories.forEach(c => cats.add(c));
    articles.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  const filteredBlogs = articles.filter(article => {
    const matchesCat = selectedCategory === 'All Articles' || article.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (article.title && article.title.toLowerCase().includes(q)) ||
      (article.summary && article.summary.toLowerCase().includes(q)) ||
      (article.tag && article.tag.toLowerCase().includes(q)) ||
      (article.author && article.author.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-surface-50 min-h-screen py-10 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-surface-900 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="text-surface-900 font-semibold">Knowledge Centre &amp; Case Studies</span>
        </nav>

        {/* Page Hero */}
        <div className="bg-surface-900 text-white rounded-xl p-8 sm:p-12 mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Additive Engineering Hub
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Case Studies, Whitepapers &amp; Technical Insights
            </h1>
            <p className="text-sm text-surface-300 leading-relaxed">
              Explore in-depth technical breakdowns from our UK applications engineering team on large-format pellet extrusion, aerospace PEEK qualification, and metrology inspection workflows.
            </p>
          </div>

          {/* Background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Controls: Search & Category Tabs */}
        <div className="bg-white border border-surface-200 rounded-xl p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Category Tabs - Wraps cleanly on mobile, no horizontal scroll */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-surface-900 text-white shadow-xs'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies & guides..."
              className="w-full pl-9 pr-3 py-2 bg-surface-50 border border-surface-300 rounded text-xs text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredBlogs.map((article) => (
              <article 
                key={article.id}
                onClick={() => onSelectArticle && onSelectArticle(article)}
                className="group bg-white border border-surface-200 rounded-2xl overflow-hidden flex flex-col justify-between h-full shadow-xs hover:shadow-md hover:border-surface-300 transition-all cursor-pointer"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-surface-100">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-[11px] text-surface-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                    </div>

                    <h2 className="font-bold text-base text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2">
                      {article.title}
                    </h2>

                    <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-surface-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-surface-800">{article.author}</p>
                    <p className="text-[10px] text-surface-500">{article.authorRole}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article →
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-surface-200 rounded-lg p-12 text-center my-8">
            <BookOpen className="w-10 h-10 text-surface-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-surface-900">No articles match your filter</h3>
            <p className="text-xs text-surface-500 mt-1">Try selecting another category or clear your search term.</p>
            <button
              onClick={() => {
                setSelectedCategory('All Articles');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-surface-900 text-white rounded text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Technical Audit CTA */}
        <div className="bg-white border border-surface-200 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">Have a challenging engineering part?</span>
            <h3 className="font-display text-xl font-bold text-surface-900 mt-1">
              Request a Free Additive Feasibility Assessment
            </h3>
            <p className="text-xs text-surface-600 mt-1 max-w-xl">
              Send your STEP or STL file to our engineering centre. We will evaluate build time, material options, structural performance, and piece-part economics.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap"
          >
            Submit Part for AM Audit
          </button>
        </div>

      </div>
    </div>
  );
}
