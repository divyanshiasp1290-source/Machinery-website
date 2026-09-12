import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Shield, Cpu, Plane, Car, Factory, HeartPulse } from 'lucide-react';
import { industrySolutions } from '../data/solutions';

const iconMap = {
  'aerospace-defense': Plane,
  'automotive-motorsport': Car,
  'manufacturing-tooling': Factory,
  'medical-dental': HeartPulse
};

export default function IndustrySolutions({ onSelectProduct, onOpenConsultation }) {
  const [activeTab, setActiveTab] = useState(industrySolutions[0].id);

  const currentSolution = industrySolutions.find(s => s.id === activeTab) || industrySolutions[0];
  const IconComponent = iconMap[currentSolution.id] || Factory;

  return (
    <section className="py-16 lg:py-20 bg-surface-50 border-b border-surface-200">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Industry Applications
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-surface-900">
            Validated Additive Solutions for Critical Sectors
          </h2>
          <p className="text-sm sm:text-base text-surface-500 mt-2">
            Explore how UK leaders in aerospace, motorsport, and precision manufacturing replace expensive CNC machining with high-performance 3D printing.
          </p>
        </div>

        {/* Industry Selector Tabs */}
        <div className="flex justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-10 no-scrollbar">
          {industrySolutions.map(solution => {
            const TabIcon = iconMap[solution.id] || Factory;
            const isActive = solution.id === activeTab;
            return (
              <button
                key={solution.id}
                onClick={() => setActiveTab(solution.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white text-surface-700 hover:bg-surface-100 border border-surface-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-500'}`} />
                <span>{solution.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Image & Stats */}
            <div className="lg:col-span-6 relative min-h-[340px] bg-surface-900">
              <img
                src={currentSolution.image}
                alt={currentSolution.title}
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent" />

              {/* Verified Metrics Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-3 bg-surface-900/90 backdrop-blur-md rounded-xl p-4 border border-surface-700">
                  {currentSolution.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <span className="block text-base sm:text-lg font-extrabold text-brand-400 font-display">
                        {stat.value}
                      </span>
                      <span className="text-[10px] sm:text-xs text-surface-300 font-medium">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Detailed Content */}
            <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <IconComponent className="w-4 h-4" />
                  <span>{currentSolution.tagline}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-surface-900 mb-3">
                  {currentSolution.title} Additive Systems
                </h3>

                <p className="text-xs sm:text-sm text-surface-600 leading-relaxed mb-6">
                  {currentSolution.description}
                </p>

                <h4 className="text-xs font-bold uppercase text-surface-400 tracking-wider mb-3">
                  Common High-Impact Applications:
                </h4>

                <ul className="space-y-2.5 mb-8">
                  {currentSolution.applications.map((app, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-surface-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Consultation Callout */}
              <div className="pt-6 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-surface-500">
                  Speak with our dedicated <span className="font-bold text-surface-800">{currentSolution.title}</span> application specialist.
                </div>
                <button
                  onClick={onOpenConsultation}
                  className="w-full sm:w-auto px-5 py-2.5 bg-surface-900 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Request Sector Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
