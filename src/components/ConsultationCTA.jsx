import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ConsultationCTA({ onOpenConsultation }) {
  return (
    <section className="py-20 bg-surface-900 text-white text-center relative overflow-hidden">
      {/* Subtle ambient brand glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400 block mb-2">
          TECHNICAL CONSULTATION &amp; AUDIT
        </span>
        
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
          Need Help Selecting the Right Machine?
        </h2>
        
        <p className="text-surface-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
          Our application engineers will evaluate your CAD models, material targets, and production economics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenConsultation}
            className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-xl transition-all shadow-brand-glow flex items-center justify-center gap-2"
          >
            <span>Request a Technical Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    </section>
  );
}
