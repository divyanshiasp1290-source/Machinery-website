import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { blogs as fallbackBlogs } from '../data/blogs';

export default function BlogSection({ onNavigate, onSelectArticle }) {
  const [articles, setArticles] = useState(() => fallbackBlogs.slice(0, 3));

  const loadBlogs = async () => {
    try {
      const res = await api.blogs.list();
      if (res?.blogs && res.blogs.length > 0) {
        setArticles(res.blogs.slice(0, 3));
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

  const featuredArticles = articles.slice(0, 3);

  return (
    <section className="py-20 bg-white border-b border-surface-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching evo3d reference */}
        <div className="mb-10 text-left">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-2">
            Blog
          </h2>
          <p className="text-base text-surface-600 mb-4">
            Insightful articles, get tips and read the latest news related to our industry.
          </p>
          <a
            href="/blogs"
            onClick={(e) => { e.preventDefault(); onNavigate('blogs'); }}
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors inline-flex cursor-pointer"
          >
            <span>View more</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* 3 Clean Articles Grid with Uniform Sizing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {featuredArticles.map((article) => (
            <article 
              key={article.id}
              onClick={() => onSelectArticle ? onSelectArticle(article) : onNavigate('blogs')}
              className="group bg-white border border-surface-200 rounded-2xl overflow-hidden flex flex-col justify-between h-full hover:shadow-md hover:border-surface-300 transition-all cursor-pointer text-left"
            >
              <div className="flex flex-col flex-1">
                {/* Image with fixed uniform height */}
                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-surface-100 shrink-0">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content with uniform spacing */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-semibold text-surface-400 mb-2">
                    {article.date}
                  </div>

                  <h3 className="font-bold text-lg sm:text-xl text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-3 min-h-[3.25rem]">
                    {article.title}
                  </h3>

                  <p className="text-sm text-surface-600 line-clamp-3 leading-relaxed font-normal">
                    {article.summary}
                  </p>
                </div>
              </div>

              {/* Footer pinned at bottom */}
              <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-surface-100 mt-auto">
                <span className="text-xs font-bold text-surface-700">{article.author}</span>
                <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read More →
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
