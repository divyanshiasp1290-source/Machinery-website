import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BrandsMarquee({ onSelectBrand }) {
  const [brands, setBrands] = useState([]);

  const loadBrands = async () => {
    try {
      const res = await api.brands.list();
      if (Array.isArray(res) && res.length > 0) {
        setBrands(res);
      }
    } catch (err) {
      console.warn('Could not load brands for marquee:', err);
    }
  };

  useEffect(() => {
    loadBrands();
    const unsub = api.realtime.subscribeBrands(() => {
      loadBrands();
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!brands || brands.length === 0) return null;

  // Ensure enough items for seamless infinite marquee
  let marqueeBrands = brands;
  while (marqueeBrands.length < 12) {
    marqueeBrands = [...marqueeBrands, ...brands];
  }
  marqueeBrands = [...marqueeBrands, ...marqueeBrands];

  return (
    <section id="brands" className="py-12 sm:py-16 bg-white border-b border-surface-200 text-left relative overflow-hidden">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          Shop By Brand
        </h2>
      </div>

      {/* Seamless Marquee with no cards, no arrows, no bottom line */}
      <div className="relative overflow-hidden py-3 select-none">
        {/* Soft edge fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-12 sm:gap-16 px-4">
          {marqueeBrands.map((brand, idx) => {
            const logoSrc = brand.logoImage || brand.logo || (brand.id ? `/brands/${brand.id}.svg` : null);

            return (
              <button
                key={`${brand.id || brand.name}-${idx}`}
                onClick={() => onSelectBrand(brand.name)}
                className="flex items-center justify-center shrink-0 cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-110 px-2"
                title={`View ${brand.name} Systems`}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={brand.name}
                    className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      const currentSrc = e.target.getAttribute('src') || '';
                      if (currentSrc.endsWith('.png')) {
                        e.target.src = currentSrc.replace('.png', '.svg');
                        return;
                      }
                      if (currentSrc.endsWith('.svg')) {
                        e.target.src = currentSrc.replace('.svg', '.jpg');
                        return;
                      }
                      if (currentSrc.endsWith('.jpg')) {
                        e.target.src = currentSrc.replace('.jpg', '.webp');
                        return;
                      }
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'inline-flex';
                      }
                    }}
                  />
                ) : null}
                <span
                  style={{ display: logoSrc ? 'none' : 'inline-flex' }}
                  className="font-display font-black text-sm sm:text-base tracking-wider uppercase text-surface-800 border border-surface-200 px-3.5 py-1.5 rounded-xl bg-surface-50 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs whitespace-nowrap"
                >
                  {brand.logoText || brand.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}


