import React from 'react';
import { Wrench, ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Wrench,
      title: 'Technical Expertise',
      description: 'Factory-certified additive specialists who understand industrial materials, kinematics, and workflow integration.'
    },
    {
      icon: ShieldCheck,
      title: 'Authorised UK Partner',
      description: 'Official UK hardware distributor offering genuine warranties, direct manufacturer support, and certified parts.'
    },
    {
      icon: Headphones,
      title: 'Professional Support',
      description: 'Dedicated post-sales technical assistance, machine installation, calibration, and operational staff training.'
    },
    {
      icon: Truck,
      title: 'Reliable UK Delivery',
      description: 'Extensive stock of engineering filaments, resins, and spare parts dispatched promptly across the UK.'
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-surface-200 text-center">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Built On Engineering Trust
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight">
            Why Partner with FORGE 3D
          </h2>
          <p className="text-sm sm:text-base text-surface-500 mt-2">
            Trusted 3D printing equipment, engineering consultation, and UK after-sales support
          </p>
        </div>

        {/* 4 Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-white hover:border-brand-500 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-brand-500 mb-5 shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-surface-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
