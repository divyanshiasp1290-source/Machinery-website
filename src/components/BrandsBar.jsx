import React from 'react';

export default function BrandsBar({ onSelectBrand }) {
  const brands = [
    {
      name: 'AON3D',
      logo: (
        <div className="flex items-center gap-2 select-none">
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 32 32" fill="none">
            <path d="M4 7L24 16L12 18.5L4 7Z" fill="#0052cc" />
            <path d="M6 25L22 18.5L10 16L6 25Z" fill="#001845" />
          </svg>
          <span className="font-display font-black text-xl tracking-tight text-[#0052cc]">
            AON3D
          </span>
        </div>
      )
    },
    {
      name: 'CreatBot',
      logo: (
        <div className="flex items-center gap-2 select-none">
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 36 36" fill="none" stroke="#0070ba" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 4L31 11.5V26.5L18 34L5 26.5V11.5L18 4Z" />
            <path d="M18 4V19" />
            <path d="M31 11.5L18 19" />
            <path d="M5 11.5L18 19" />
          </svg>
          <span className="font-sans font-bold text-lg tracking-tight text-[#0070ba]">
            CreatBot
          </span>
        </div>
      )
    },
    {
      name: 'Fiberlogy',
      logo: (
        <div className="flex items-center select-none">
          <svg className="h-6 w-auto" viewBox="0 0 160 30" fill="#1b13e8">
            <text x="0" y="24" fontFamily="'Space Grotesk', 'Courier New', monospace" fontWeight="900" fontSize="27" letterSpacing="-1.5px">
              fiberlogy
            </text>
          </svg>
        </div>
      )
    },
    {
      name: 'Formlabs',
      logo: (
        <div className="flex items-center gap-1.5 select-none">
          <span className="font-sans font-bold text-lg tracking-tight text-surface-900">
            formlabs
          </span>
          <svg className="w-5 h-4.5 flex-shrink-0 text-surface-900" viewBox="0 0 32 26" fill="currentColor">
            <path d="M16 13C16 13 13 4 7 4C2.5 4 0 7.5 0 11C0 16 7 16 16 13Z" opacity="0.9" />
            <path d="M16 13C16 13 19 4 25 4C29.5 4 32 7.5 32 11C32 16 25 16 16 13Z" opacity="0.9" />
            <path d="M16 13C16 13 13 20 8 20C4 20 2 18 2 15.5C2 13 6 12.5 16 13Z" opacity="0.9" />
            <path d="M16 13C16 13 19 20 24 20C28 20 30 18 30 15.5C30 13 26 12.5 16 13Z" opacity="0.9" />
          </svg>
        </div>
      )
    },
    {
      name: 'IEMAI',
      logo: (
        <div className="flex items-center select-none">
          <span className="font-sans font-black text-xl tracking-widest text-[#009b48] flex items-baseline">
            <span>IEMAI</span>
            <sup className="text-[9px] font-bold ml-0.5">®</sup>
          </span>
        </div>
      )
    },
    {
      name: 'Shining 3D',
      logo: (
        <div className="flex items-center gap-2 select-none">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 32 32" fill="none" stroke="#003b71" strokeWidth="2.6" strokeLinecap="round">
            <path d="M16 4C16 12 12 16 4 16" />
            <path d="M16 4C16 12 20 16 28 16" />
            <path d="M16 28C16 20 12 16 4 16" />
            <path d="M16 28C16 20 20 16 28 16" />
          </svg>
          <span className="font-sans font-extrabold text-base tracking-wider text-[#003b71]">
            SHINING 3D
          </span>
        </div>
      )
    },
    {
      name: 'Raise3D',
      logo: (
        <div className="flex items-center select-none font-display font-black text-xl tracking-tighter text-surface-900">
          <span>RAISE<span className="text-[#e11d48]">3D</span></span>
        </div>
      )
    },
    {
      name: 'INTAMSYS',
      logo: (
        <div className="flex items-center select-none font-display font-black text-lg tracking-widest text-[#003882]">
          <span>INTAMSYS</span>
        </div>
      )
    },
    {
      name: 'Modix',
      logo: (
        <div className="flex items-center select-none font-display font-black text-xl tracking-wider text-surface-900">
          <span>MODIX</span>
        </div>
      )
    },
    {
      name: 'UltiMaker',
      logo: (
        <div className="flex items-center select-none font-sans font-black text-xl tracking-tight text-surface-900">
          <span>Ulti<span className="text-[#0062ff]">Maker</span></span>
        </div>
      )
    },
    {
      name: 'Bambu Lab',
      logo: (
        <div className="flex items-center gap-2 select-none text-[#00ae42]">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-[#00ae42] rounded-xs" />
            <div className="bg-[#00ae42] rounded-xs" />
            <div className="bg-[#00ae42] rounded-xs" />
            <div className="bg-[#00ae42] rounded-xs" />
          </div>
          <span className="font-sans font-extrabold text-lg tracking-tight">
            Bambu Lab
          </span>
        </div>
      )
    },
    {
      name: 'BASF Forward AM',
      logo: (
        <div className="flex flex-col text-left leading-none text-[#004a96] select-none">
          <span className="font-display font-black text-xl tracking-tight">BASF</span>
          <span className="text-[8px] font-bold tracking-widest text-surface-600 uppercase mt-0.5">Forward AM</span>
        </div>
      )
    },
    {
      name: 'Polymaker',
      logo: (
        <div className="flex items-center gap-1.5 font-sans font-bold text-lg tracking-tight text-[#8c1d82] select-none">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="16 4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span>Polymaker</span>
        </div>
      )
    },
    {
      name: 'Drywise',
      logo: (
        <div className="flex items-center select-none font-display font-black text-lg tracking-wider text-[#00a887]">
          <span>DRYWISE</span>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-surface-200 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Big Bold Heading matching Evo3D screenshot */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight mb-8">
          Shop By Brand
        </h2>

        {/* Clean Large White Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => onSelectBrand(brand.name)}
              className="bg-white border border-surface-200 rounded-2xl p-6 h-28 sm:h-32 flex items-center justify-center shadow-2xs hover:shadow-md hover:border-brand-500 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <div className="group-hover:scale-105 transition-transform duration-200 text-center">
                {brand.logo}
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
