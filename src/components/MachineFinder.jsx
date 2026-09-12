import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  Layers, 
  Sparkles, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { products } from '../data/products';

export default function MachineFinder({ 
  isOpen, 
  onClose, 
  onSelectProduct 
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const applications = [
    { id: 'tooling', title: 'Factory Tooling & Jigs', desc: 'Shop-floor fixtures, end-of-arm tooling, replacement gears' },
    { id: 'high-temp', title: 'Aerospace & High-Temp', desc: 'PEEK, ULTEM flame-retardant parts for flight and oil & gas' },
    { id: 'large-format', title: 'Large Scale Prototyping', desc: 'Monolithic automotive bodywork, marine, architectural scale' },
    { id: 'precision-dental', title: 'Sub-Micron Precision & Dental', desc: 'Medical devices, dental models, jewelry, microfluidics' },
    { id: 'metrology', title: '3D Scanning & Quality Control', desc: 'Reverse engineering, CMM inspection, CAD comparison' }
  ];

  const sizes = [
    { id: 'compact', title: 'Compact to Standard (< 300 mm)', desc: 'Fit on workbenches, fast heating, rapid iteration' },
    { id: 'mid', title: 'Industrial Mid-Scale (300 mm - 600 mm)', desc: 'High-throughput batch production & multi-part nests' },
    { id: 'large', title: 'Meter-Scale Giant (> 600 mm)', desc: 'Full-scale automotive body components and tall towers' }
  ];

  const materials = [
    { id: 'carbon', title: 'Carbon-Fiber & Standard Engineering', desc: 'PA-CF, PETG, PC, ABS, TPU flex' },
    { id: 'peek', title: 'Extreme Polymers (PEEK / ULTEM)', desc: 'Requires 450°C+ hotend & active heated chamber' },
    { id: 'sls-powder', title: 'Supportless Nylon Powders', desc: 'PA12 and PA11 selective laser sintering' },
    { id: 'resin', title: 'Photopolymer Resins', desc: 'Biocompatible, dental, castable wax, high-temp resins' }
  ];

  // Matched machine recommendations logic
  const getRecommendations = () => {
    return products.filter(p => {
      if (selectedApp === 'metrology') return p.category === 'scanners';
      if (selectedApp === 'high-temp') return p.category === 'high-temp';
      if (selectedApp === 'large-format') return p.category === 'large-format';
      if (selectedApp === 'precision-dental') return p.category === 'resin-sla' || p.category === 'sls-powder';
      if (selectedSize === 'large') return p.category === 'large-format';
      if (selectedMaterial === 'peek') return p.category === 'high-temp';
      if (selectedMaterial === 'resin') return p.category === 'resin-sla';
      if (selectedMaterial === 'sls-powder') return p.category === 'sls-powder';
      return p.category === 'industrial-fdm' || p.category === 'large-format';
    }).slice(0, 3);
  };

  const matched = getRecommendations();

  const handleReset = () => {
    setStep(1);
    setSelectedApp(null);
    setSelectedSize(null);
    setSelectedMaterial(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-left">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-surface-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-200 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-surface-900">
                Interactive Machine Selector Tool
              </h3>
              <p className="text-xs text-surface-500">
                Find the optimum additive hardware for your technical application in 3 steps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-surface-400 hover:text-surface-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between mb-8 text-xs font-semibold text-surface-400">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-brand-500 text-white font-bold' : 'bg-surface-100'}`}>1</span>
            <span>Application</span>
          </div>
          <span className="h-0.5 flex-1 bg-surface-200 mx-3" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-500 text-white font-bold' : 'bg-surface-100'}`}>2</span>
            <span>Build Size</span>
          </div>
          <span className="h-0.5 flex-1 bg-surface-200 mx-3" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-500 text-white font-bold' : 'bg-surface-100'}`}>3</span>
            <span>Polymers</span>
          </div>
          <span className="h-0.5 flex-1 bg-surface-200 mx-3" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-brand-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 4 ? 'bg-emerald-600 text-white font-bold' : 'bg-surface-100'}`}>✓</span>
            <span>Result</span>
          </div>
        </div>

        {/* STEP 1: Application */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-surface-900">
              Step 1: What is your primary manufacturing or engineering goal?
            </h4>
            <div className="space-y-2.5">
              {applications.map(app => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app.id);
                    if (app.id === 'metrology') {
                      setStep(4); // directly show scanners
                    } else {
                      setStep(2);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedApp === app.id ? 'border-brand-500 bg-brand-50/50' : 'border-surface-200 hover:border-surface-300 bg-surface-50'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-sm text-surface-900">{app.title}</h5>
                    <p className="text-xs text-surface-500 mt-0.5">{app.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Size */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-surface-900">
              Step 2: What component dimensions / build envelope do you require?
            </h4>
            <div className="space-y-2.5">
              {sizes.map(size => (
                <div
                  key={size.id}
                  onClick={() => {
                    setSelectedSize(size.id);
                    setStep(3);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedSize === size.id ? 'border-brand-500 bg-brand-50/50' : 'border-surface-200 hover:border-surface-300 bg-surface-50'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-sm text-surface-900">{size.title}</h5>
                    <p className="text-xs text-surface-500 mt-0.5">{size.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Material */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-surface-900">
              Step 3: What thermal or mechanical polymer specifications do you need?
            </h4>
            <div className="space-y-2.5">
              {materials.map(mat => (
                <div
                  key={mat.id}
                  onClick={() => {
                    setSelectedMaterial(mat.id);
                    setStep(4);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedMaterial === mat.id ? 'border-brand-500 bg-brand-50/50' : 'border-surface-200 hover:border-surface-300 bg-surface-50'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-sm text-surface-900">{mat.title}</h5>
                    <p className="text-xs text-surface-500 mt-0.5">{mat.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: RECOMMENDATIONS */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold block">Ideal Hardware Matches Identified</span>
                <span>Based on your required specifications, our UK engineering team recommends the following machines:</span>
              </div>
            </div>

            <div className="space-y-3">
              {matched.map(prod => (
                <div
                  key={prod.id}
                  className="p-4 bg-surface-50 rounded-xl border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={prod.images[0]} alt={prod.name} className="w-16 h-16 object-contain rounded bg-white p-1 border border-surface-200" />
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase">{prod.brand}</span>
                      <h5 className="font-bold text-sm text-surface-900">{prod.name}</h5>
                      <span className="text-xs text-surface-500 block">
                        Build: {prod.shortSpecs.buildVolume || prod.shortSpecs.accuracy}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="text-right">
                      {prod.quoteOnly ? (
                        <span className="text-xs font-bold text-brand-600">Quotation System</span>
                      ) : (
                        <span className="text-sm font-bold text-surface-900">{prod.currency}{prod.price.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(prod);
                      }}
                      className="px-4 py-2 bg-surface-900 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                    >
                      View Specs
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-200">
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-surface-600 hover:text-surface-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Quiz Again</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded"
              >
                Close Machine Finder
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
