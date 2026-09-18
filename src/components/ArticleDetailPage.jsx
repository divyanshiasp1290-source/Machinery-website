import React from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight,
  Send,
  CheckCircle2,
  Mail,
  Layers,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { blogs as fallbackBlogs } from '../data/blogs';

export default function ArticleDetailPage({ 
  article, 
  onBack, 
  onNavigate, 
  onSelectArticle
}) {
  const [allArticles, setAllArticles] = React.useState(() => fallbackBlogs);

  React.useEffect(() => {
    let isMounted = true;
    api.blogs.list().then(res => {
      if (isMounted && res?.blogs && res.blogs.length > 0) {
        setAllArticles(res.blogs);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  if (!article) return null;

  // Filter 3 related articles excluding current article
  const relatedArticles = allArticles
    .filter(b => b.id !== article.id && b.slug !== article.slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1))
    .slice(0, 3);

  // Robust line-by-line markdown parser separating headings from body text
  const renderContent = (content) => {
    if (!content) return null;

    const lines = content.trim().split('\n');
    const elements = [];
    let currentParagraph = [];
    let currentList = [];
    let listType = null; // 'ul' | 'ol'

    const flushParagraph = (key) => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) {
          elements.push(
            <p key={`p-${key}`} className="text-base sm:text-[1.125rem] text-surface-700 leading-[1.8] font-normal mb-6">
              {text}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushList = (key) => {
      if (currentList.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`ul-${key}`} className="space-y-3 my-6 pl-2">
              {currentList.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-[1.125rem] text-surface-700 font-normal leading-[1.75]">
                  <span className="w-2 h-2 rounded-full bg-brand-500 mt-2.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-surface-900">$1</strong>') 
                  }} />
                </li>
              ))}
            </ul>
          );
        } else if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${key}`} className="list-decimal pl-6 space-y-3 my-6 text-base sm:text-[1.125rem] text-surface-700 font-normal leading-[1.75]">
              {currentList.map((item, i) => (
                <li key={i} className="pl-1" dangerouslySetInnerHTML={{ 
                  __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-surface-900">$1</strong>') 
                }} />
              ))}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph(index);
        flushList(index);
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushParagraph(index);
        flushList(index);
        elements.push(
          <h2 key={`h2-${index}`} className="font-display font-bold text-2xl sm:text-3xl text-surface-900 mt-10 mb-4 tracking-tight">
            {trimmed.replace('### ', '')}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('#### ')) {
        flushParagraph(index);
        flushList(index);
        elements.push(
          <h3 key={`h3-${index}`} className="font-display font-bold text-lg sm:text-xl text-surface-900 mt-8 mb-3">
            {trimmed.replace('#### ', '')}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushParagraph(index);
        if (listType && listType !== 'ul') flushList(index);
        listType = 'ul';
        currentList.push(trimmed.replace(/^[-*]\s+/, ''));
        return;
      }

      const olMatch = trimmed.match(/^\d+\.\s+(.*)/);
      if (olMatch) {
        flushParagraph(index);
        if (listType && listType !== 'ol') flushList(index);
        listType = 'ol';
        currentList.push(olMatch[1]);
        return;
      }

      // Normal paragraph line
      if (listType) flushList(index);
      currentParagraph.push(trimmed);
    });

    flushParagraph('end');
    flushList('end');

    return elements;
  };

  return (
    <article className="min-h-screen bg-white text-left py-6 sm:py-10">
      {/* Full-width container matching header, products, and site layout */}
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation - Full Screen Width */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2 text-xs text-surface-500 flex-wrap">
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <a 
              href="/blogs"
              onClick={(e) => { e.preventDefault(); onNavigate('blogs'); }} 
              className="hover:text-brand-600 transition-colors cursor-pointer"
            >
              Knowledge Centre &amp; Blog
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
            <span className="font-semibold text-surface-700">{article.category}</span>
          </div>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>
        </div>

        {/* Article Header (Wide format across full page) */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3.5 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {article.category}
            </span>
            {article.tag && (
              <span className="px-3.5 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-medium">
                {article.tag}
              </span>
            )}
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-surface-900 tracking-tight leading-[1.18] mb-6 max-w-5xl break-words">
            {article.title}
          </h1>

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-surface-200 text-xs text-surface-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-bold">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <div className="font-bold text-surface-900 text-sm">{article.author}</div>
                <div className="text-surface-500 text-xs">{article.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-5 text-surface-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-surface-400" />
                <span>{article.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-surface-400" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Cover Image - High-Impact Wide Screen Banner */}
        <div className="w-full h-56 sm:h-80 md:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden mb-10 bg-surface-100 border border-surface-200 shadow-sm relative">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Main Content & Sticky Technical Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          
          {/* Main Content Column (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Executive Summary Callout */}
            {article.summary && (
              <div className="p-6 sm:p-8 bg-surface-50 rounded-2xl border-l-4 border-l-brand-500 border-y border-r border-surface-200 text-surface-800 text-base sm:text-lg leading-relaxed font-normal">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
                  Executive Summary
                </div>
                {article.summary}
              </div>
            )}

            {/* Formatted Article Body */}
            <div className="article-body text-surface-700 leading-relaxed font-normal">
              {renderContent(article.content)}
            </div>

            {/* Sample / Technical Consultation CTA Banner */}
            <div className="mt-12 p-6 sm:p-8 bg-surface-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Sample Benchmark Service
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Want to evaluate this application on your components?
                </h3>
                <p className="text-xs sm:text-sm text-surface-300 max-w-lg leading-relaxed">
                  Request a free physical sample part or benchmark evaluation produced by our UK engineering team.
                </p>
              </div>

              <button
                onClick={() => onNavigate('request-sample')}
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request a Sample Part</span>
              </button>
            </div>
          </div>

          {/* Sticky Technical Sidebar (4 Columns - Eliminates blank space on the right) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Technical Overview Widget */}
            <div className="p-6 bg-surface-50 rounded-2xl border border-surface-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 pb-2.5 border-b border-surface-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <span>Technical Specifications</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-surface-200/60">
                  <span className="text-surface-500">Category</span>
                  <span className="font-bold text-surface-900">{article.category}</span>
                </div>
                {article.tag && (
                  <div className="flex justify-between py-1 border-b border-surface-200/60">
                    <span className="text-surface-500">Focus Area</span>
                    <span className="font-bold text-surface-900">{article.tag}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-surface-200/60">
                  <span className="text-surface-500">Reading Time</span>
                  <span className="font-bold text-surface-900">{article.readTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-200/60">
                  <span className="text-surface-500">Author</span>
                  <span className="font-bold text-surface-900">{article.author}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-surface-500">Support Facility</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> UK Engineering Lab
                  </span>
                </div>
              </div>
            </div>

            {/* Request Sample Card */}
            <div className="p-6 bg-brand-500 text-white rounded-2xl shadow-sm space-y-4 text-left relative overflow-hidden">
              <div className="inline-block px-2.5 py-1 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                Engineering Benchmarks
              </div>
              <h4 className="font-display font-bold text-lg text-white leading-snug">
                Order a Certified Test Sample
              </h4>
              <p className="text-xs text-white/90 leading-relaxed">
                Test surface finish, mechanical stiffness, and chemical resistance on your own testing rig before machine procurement.
              </p>
              <button
                onClick={() => onNavigate('request-sample')}
                className="w-full py-3 bg-white text-brand-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-surface-50 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Request Free Sample</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Engineering Advice */}
            <div className="p-6 bg-white rounded-2xl border border-surface-200 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 pb-2.5 border-b border-surface-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Speak with an Application Engineer</span>
              </h4>
              <p className="text-xs text-surface-600 leading-relaxed">
                Have specific design requirements or material qualification questions? Talk directly with our team.
              </p>
              <div className="space-y-2.5 text-xs">
                <button 
                  onClick={() => onNavigate && onNavigate('contact')} 
                  className="w-full flex items-center justify-center gap-2 text-white bg-brand-500 hover:bg-brand-600 font-bold transition-colors p-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Technical Inquiry</span>
                </button>
              </div>
            </div>

            {/* Quick Related In This Series */}
            <div className="p-6 bg-surface-50 rounded-2xl border border-surface-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-600 pb-2.5 border-b border-surface-200 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-500" />
                <span>Related In This Series</span>
              </h4>
              <div className="space-y-3">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div 
                    key={rel.id} 
                    onClick={() => {
                      onSelectArticle(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex gap-3 items-center cursor-pointer p-2 rounded-xl hover:bg-white transition-colors"
                  >
                    <img 
                      src={rel.image} 
                      alt={rel.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-surface-200" 
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-surface-400 font-semibold mb-0.5">{rel.category}</div>
                      <h5 className="text-xs font-bold text-surface-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* Related Articles Bottom Showcase */}
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-surface-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Recommended Reading
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Related Case Studies &amp; Technical Insights
            </h2>
          </div>

          <button
            onClick={() => onNavigate('blogs')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View all articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {relatedArticles.map((rel) => (
            <article
              key={rel.id}
              onClick={() => {
                onSelectArticle(rel);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white border border-surface-200 rounded-2xl overflow-hidden flex flex-col justify-between h-full hover:shadow-md hover:border-surface-300 transition-all cursor-pointer text-left"
            >
              <div className="flex flex-col flex-1">
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-surface-100 shrink-0">
                  <img 
                    src={rel.image} 
                    alt={rel.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-surface-400 mb-2">
                    {rel.date} • {rel.category}
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-3">
                    {rel.title}
                  </h3>

                  <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed">
                    {rel.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-surface-100 mt-auto text-xs">
                <span className="font-bold text-surface-700">{rel.author}</span>
                <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Article →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

    </article>
  );
}
