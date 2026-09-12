import React from 'react';

export default function BrandsMarquee({ onSelectBrand }) {
  // Exact real brands from reference website evo3d.co.uk - strictly NO extra brands
  const brandList = [
    { name: 'AON3D', logo: '/brands/aon3d.webp', alt: 'AON3D' },
    { name: 'CreatBot', logo: '/brands/creatbot.jpg', alt: 'CreatBot' },
    { name: 'Fiberlogy', logo: '/brands/fiberlogy.svg', alt: 'fiberlogy' },
    { name: 'Formlabs', logo: '/brands/formlabs.png', alt: 'formlabs' },
    { name: 'IEMAI', logo: '/brands/iemai.png', alt: 'IEMAI' },
    { name: 'Sharebot', logo: '/brands/sharebot.webp', alt: 'Sharebot' },
    { name: 'Sinterit', logo: '/brands/sinterit.png', alt: 'Sinterit' },
    { name: 'Shining 3D', logo: '/brands/shining3d.png', alt: 'Shining 3D' },
    { name: 'Modix', logo: '/brands/modix.png', alt: 'Modix' },
    { name: 'MINGDA', logo: '/brands/mingda.webp', alt: 'MINGDA' },
    { name: 'Rapid Fusion', logo: '/brands/rapidfusion.png', alt: 'Rapid Fusion' },
  ];

  // Duplicate for seamless infinite loop
  const marqueeBrands = [...brandList, ...brandList];

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
          {marqueeBrands.map((brand, idx) => (
            <button
              key={`${brand.name}-${idx}`}
              onClick={() => onSelectBrand(brand.name)}
              className="flex items-center justify-center shrink-0 cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-110 px-2"
              title={`View ${brand.name} Systems`}
            >
              <img
                src={brand.logo}
                alt={brand.alt}
                className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain opacity-90 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}


