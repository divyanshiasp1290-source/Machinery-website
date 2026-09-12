import React from 'react';
import { ArrowRight } from 'lucide-react';
import { categories } from '../data/categories';

export default function CategoryGrid({ onSelectCategory, onExploreAll }) {
  // Show 6 primary categories
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-surface-200 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Explore Our Solutions
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight">
              Equipment Categories
            </h2>
          </div>

          <button
            onClick={onExploreAll}
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative rounded-2xl overflow-hidden border border-surface-200 hover:border-brand-500 hover:shadow-card-hover transition-all duration-300 cursor-pointer bg-surface-50"
            >
              <div className="relative h-64 w-full overflow-hidden bg-surface-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    const fallback = cat.image.includes('_v2') 
                      ? cat.image.replace('_v2', '') 
                      : cat.image.replace('.jpg', '_v2.jpg');
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 block mb-1">
                    {cat.badge || 'Production Grade'}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white group-hover:text-brand-200 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-surface-300 block mt-1">
                    {cat.count} Systems Available
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
