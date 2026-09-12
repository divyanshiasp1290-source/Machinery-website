import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PromoSpotlight({ onExploreLFAM, onOpenConsultation }) {
  return (
    <section className="py-20 bg-surface-950 text-white relative overflow-hidden border-b border-surface-800 text-left">
      {/* Subtle ambient brand glow */}
      <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Technology Showcase */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden bg-surface-900 border border-surface-800 p-6 shadow-2xl group">
              <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-surface-950 flex items-center justify-center">
                <img
                  src="/images/spotlight/lfam_pellet_extrusion.jpg"
                  alt="Large Format Additive Manufacturing (LFAM)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2 bg-surface-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-bold text-white border border-surface-700 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  <span>LFAM Direct Pellet Extrusion</span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 pt-5 text-center">
                <div className="bg-surface-950 p-3 rounded-xl border border-surface-800">
                  <span className="text-brand-400 font-black block text-xl">1.2m</span>
                  <span className="text-[11px] text-surface-400 font-medium">Vertical Build</span>
                </div>
                <div className="bg-surface-950 p-3 rounded-xl border border-surface-800">
                  <span className="text-brand-400 font-black block text-xl">Pellets</span>
                  <span className="text-[11px] text-surface-400 font-medium">Thermoplastic Feed</span>
                </div>
                <div className="bg-surface-950 p-3 rounded-xl border border-surface-800">
                  <span className="text-brand-400 font-black block text-xl">-75%</span>
                  <span className="text-[11px] text-surface-400 font-medium">Tooling Cost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Copy & Action */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              TECHNOLOGY SPOTLIGHT
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Large-Format Pellet 3D Printing at Scale
            </h2>

            <p className="text-surface-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Manufacture full-scale automotive jigs, autoclave lay-up mandrels, and architectural moulds without segmenting CAD models. Direct pellet extrusion reduces raw material expense up to 80% compared to spooled filament.
            </p>

            <div className="space-y-2.5 pt-1 text-sm text-surface-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Monolithic meter-scale continuous manufacturing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Utilises industrial thermoplastic resin pellets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>UK engineering commissioning &amp; operator training</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreLFAM}
                className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-xl transition-all shadow-brand-glow flex items-center gap-2"
              >
                <span>Explore LFAM Systems</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenConsultation}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base uppercase tracking-wider rounded-xl border border-white/20 transition-all"
              >
                Book Pellet Trial
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
