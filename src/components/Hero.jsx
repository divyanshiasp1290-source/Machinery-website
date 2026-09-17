import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onExploreCatalog, onOpenConsultation, onRequestSample }) {
  return (
    <section className="relative w-full min-h-[540px] sm:min-h-[600px] lg:min-h-[680px] py-16 sm:py-24 lg:py-28 flex items-center bg-surface-950 overflow-hidden text-left">
      
      {/* 1. Full-Width High-Definition Banner Image - Crisp & Clearly Visible */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero/industrial_robot_3d.jpg"
          alt="Industrial robotic 3D printing system in a premium manufacturing facility"
          className="w-full h-full object-cover object-[53%_50%] lg:object-[52%_48%] brightness-105 contrast-110"
        />
        {/* Smooth gradient overlay to maintain text readability while showcasing the machine */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/95 via-surface-950/70 to-surface-950/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-950 to-transparent pointer-events-none" />
      </div>

      {/* 2. Hero Content Container */}
      <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-7">
          
          {/* Technology Partner Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-950/80 border border-brand-400/40 text-xs sm:text-sm font-semibold text-brand-300 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>Official Additive Technology Partner</span>
          </div>

          {/* Headline */}
          <h1 
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08]"
            style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.75), 0 1px 3px rgba(0, 0, 0, 0.9)' }}
          >
            Precision 3D Printing Systems at Scale.
          </h1>

          {/* Supporting Text */}
          <p 
            className="text-surface-100 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-lg"
            style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.8)' }}
          >
            Premier distributor of industrial 3D printers, large-format LFAM systems, metrology 3D scanners, and advanced engineering materials.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 pt-2">
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-brand-glow hover:translate-x-0.5 cursor-pointer"
            >
              <span>Explore 3D Printers</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onRequestSample || onOpenConsultation}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 bg-surface-900/80 hover:bg-surface-800 text-white font-semibold text-sm sm:text-base uppercase tracking-wider rounded-xl border border-white/20 backdrop-blur-md transition-all duration-200 text-center justify-center flex items-center cursor-pointer"
            >
              Request a Sample
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-surface-200 font-medium drop-shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span>Fast European Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span>Certified Engineers On-Site</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span>Full SLA Warranty Support</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Live Facility Pill on the clearly visible right side */}
      <div className="hidden xl:flex absolute bottom-8 right-8 items-center gap-3 bg-surface-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-white shadow-2xl z-10 pointer-events-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div className="text-left">
          <span className="font-bold text-white text-xs block">UK Additive Production Facility</span>
          <span className="text-surface-300 text-[11px] block">High-Temp PEEK • Multi-Axis LFAM • Metrology QC</span>
        </div>
      </div>

    </section>
  );
}
