import React from 'react';
import { 
  Building2, 
  Award, 
  ShieldCheck, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  Factory
} from 'lucide-react';

export default function AboutPage({ onNavigate, onOpenConsultation }) {
  return (
    <div className="bg-surface-50 min-h-screen py-10 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-surface-900 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="text-surface-900 font-semibold">About Us</span>
        </nav>

        {/* Page Hero */}
        <div className="bg-surface-900 text-white rounded-xl p-8 sm:p-12 mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Industrial Additive Manufacturing Leaders
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Empowering Modern Industry with Production-Grade 3D Solutions
            </h1>
            <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-2xl">
              SOFT 3D Spółka z o.o. is a premier distributor and turnkey solutions provider of industrial 3D printing equipment, large-format LFAM systems, 3D scanners, and advanced polymer materials.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Story / Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
              <Factory className="w-4 h-4" />
              <span>Our Heritage &amp; Engineering Focus</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 leading-tight">
              Bridging the Gap Between Desktop Prototyping and Real Factory Production
            </h2>
            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
              Founded by mechanical and materials engineers, SOFT 3D was created to solve a real industry challenge: too many engineering firms were buying machines without proper technical back-up, material training, or warranty security.
            </p>
            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
              Today, we deliver complete 360° additive manufacturing integrations. We ensure every machine we supply is fully commissioned, integrated with local exhaust ventilation, and calibrated for your exact production materials.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
              <div className="p-4 bg-white border border-surface-200 rounded-xl shadow-xs">
                <span className="font-display text-2xl font-black text-surface-900 block">140+</span>
                <span className="text-[11px] text-surface-500 font-medium">Factory Installations</span>
              </div>
              <div className="p-4 bg-white border border-surface-200 rounded-xl shadow-xs">
                <span className="font-display text-2xl font-black text-surface-900 block">4.9/5</span>
                <span className="text-[11px] text-surface-500 font-medium">Customer Rating</span>
              </div>
              <div className="p-4 bg-white border border-surface-200 rounded-xl shadow-xs">
                <span className="font-display text-2xl font-black text-surface-900 block">24hr</span>
                <span className="text-[11px] text-surface-500 font-medium">Engineer Response</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-surface-200">
              <img 
                src="/images/about/facility_showcase.jpg" 
                alt="SOFT 3D Additive Centre" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Technology Demonstration Facility</span>
                  <h4 className="font-bold text-sm">Industrial Additive Production Floor</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Four Guiding Pillars */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-display text-2xl font-bold text-surface-900">
              The Four Pillars of SOFT 3D
            </h3>
            <p className="text-xs text-surface-600 mt-2">
              Our service model is engineered around long-term client success and factory uptime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900">Direct UK Factory Authorization</h4>
              <p className="text-xs text-surface-600 leading-relaxed">
                Official Tier 1 UK sales &amp; warranty partner for Raise3D, INTAMSYS, Modix, Formlabs, and Shining 3D.
              </p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900">Application Engineering Support</h4>
              <p className="text-xs text-surface-600 leading-relaxed">
                Consult with our dedicated materials scientists to develop optimal print profiles for your specific resin or pellet formulation.
              </p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900">West Midlands Demonstration Hub</h4>
              <p className="text-xs text-surface-600 leading-relaxed">
                Book hands-on machine trials, observe live laser scanning, and test real end-use parts before capital investment.
              </p>
            </div>

            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-surface-900">Guaranteed Spare Parts &amp; SLAs</h4>
              <p className="text-xs text-surface-600 leading-relaxed">
                Extensive UK stock of genuine nozzles, hotends, belts, and optical components with next-morning dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-surface-900 text-white rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold">
              Ready to visit our UK demonstration facility?
            </h3>
            <p className="text-xs text-surface-300 mt-1 max-w-xl">
              Arrange an appointment with one of our senior application specialists to see our machines running production parts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
            >
              Contact Our Engineers
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
