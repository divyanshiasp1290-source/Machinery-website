import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  Truck, 
  FileText, 
  Send, 
  Phone, 
  Mail, 
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';

import { api } from '../services/api';
import { businessHoursConfig, getFormattedBusinessHours } from '../config/businessHours';

export default function RequestSamplePage({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    material: 'Carbon-Fiber Nylon (PA-CF)',
    address: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.enquiries.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        material: formData.material,
        address: formData.address,
        notes: formData.notes,
        type: 'sample_request'
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit sample request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen py-8 sm:py-12 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-brand-600 transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="text-surface-900 font-semibold">Request a Sample</span>
        </nav>

        {/* Header Title Section */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-surface-900 tracking-tight mb-3">
            Request a Sample Part
          </h1>
          <p className="text-base text-surface-600 max-w-2xl leading-relaxed">
            Test the mechanical strength, surface finish, and tolerances of our industrial 3D printed materials.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Clean & Simplified Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-surface-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            
            {submitted ? (
              <div className="text-center py-10 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl text-surface-900">
                  Sample Request Confirmed!
                </h2>

                <p className="text-sm text-surface-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-surface-900">{formData.name}</strong>. Your sample request for <strong className="text-surface-900">{formData.company || 'your team'}</strong> has been received. Our team will prepare your <strong className="text-surface-900">{formData.material}</strong> sample and dispatch it to your address.
                </p>

                <div className="p-5 bg-surface-50 rounded-xl border border-surface-200 text-xs text-left max-w-md mx-auto space-y-2">
                  <div className="flex justify-between py-1 border-b border-surface-200/60">
                    <span className="text-surface-500">Material Requested:</span>
                    <span className="font-bold text-surface-900">{formData.material}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-200/60">
                    <span className="text-surface-500">Delivery Address:</span>
                    <span className="font-bold text-surface-900">{formData.address}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-surface-500">Dispatch Estimate:</span>
                    <span className="font-bold text-emerald-600">Dispatched in 24–48 hours</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        material: 'Carbon-Fiber Nylon (PA-CF)',
                        address: '',
                        notes: ''
                      });
                    }}
                    className="px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Request Another
                  </button>
                  <button
                    onClick={() => onNavigate('home')}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs">
                
                {/* 1. Name & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-surface-800 mb-1.5">
                      Full Name <span className="text-brand-600">*</span>
                    </label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Richard Davies"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1.5">
                      Company Name <span className="text-brand-600">*</span>
                    </label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Apex Engineering Ltd"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 2. Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-surface-800 mb-1.5">
                      Work Email <span className="text-brand-600">*</span>
                    </label>
                    <input 
                      required
                      type="email"
                      placeholder="r.davies@apexengineering.co.uk"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-800 mb-1.5">
                      Phone Number <span className="text-brand-600">*</span>
                    </label>
                    <input 
                      required
                      type="tel"
                      placeholder="+44 (0) 121 555 0192"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 3. Material Selection */}
                <div>
                  <label className="block font-bold text-surface-800 mb-1.5">
                    Sample Material Required <span className="text-brand-600">*</span>
                  </label>
                  <select
                    value={formData.material}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500 font-medium bg-white"
                  >
                    <option value="Carbon-Fiber Nylon (PA-CF)">Carbon-Fiber Nylon (PA-CF) — High Rigidity &amp; Strength</option>
                    <option value="Aerospace PEEK / Carbon-PEEK">High-Temp PEEK / Carbon-PEEK (250°C Resistance)</option>
                    <option value="ULTEM 9085 Flame-Retardant">ULTEM 9085 — Aerospace Certified FAR 25.853</option>
                    <option value="SLS Nylon 12 Powder">SLS Nylon 12 (Powder Bed Fusion) — Complex Geometries</option>
                    <option value="Tough Engineering Resin">Tough Engineering Photopolymer (50-Micron Detail)</option>
                    <option value="TPU 90A Flexible Elastomer">TPU 90A Flexible — Gaskets &amp; Dampers</option>
                    <option value="Metal 316L Sintered Sample">Ultrafuse 316L Stainless Steel</option>
                  </select>
                </div>

                {/* 4. Delivery Address & Postcode */}
                <div>
                  <label className="block font-bold text-surface-800 mb-1.5">
                    Delivery Address &amp; Postcode <span className="text-brand-600">*</span>
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder="Unit 12, Innovation Business Park, Birmingham, B45 9AG"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 5. Optional Requirements / Note */}
                <div>
                  <label className="block font-bold text-surface-800 mb-1.5">
                    Special Requirements or Note <span className="text-surface-400 font-normal">(Optional)</span>
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Any specific operating temperatures, tensile requirements, or questions..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500 leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Request...' : 'Request Sample Part'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Column: Key Benefits & Fast Support (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            <div className="bg-white border border-surface-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-lg text-surface-900">
                What's Included With Your Sample
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900">Physical 3D Printed Part</h4>
                    <p className="text-surface-600 leading-relaxed mt-0.5">
                      Produced on industrial machines so you can verify tolerances and surface quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900">Material Technical Data Sheet (TDS)</h4>
                    <p className="text-surface-600 leading-relaxed mt-0.5">
                      Official certified data including heat deflection, tensile stiffness, and density.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-surface-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs space-y-3.5">
              <h4 className="font-display text-base font-bold text-white">
                Need Help Choosing the Right Material?
              </h4>
              <p className="text-surface-300 text-xs leading-relaxed">
                Our application engineers can help select the exact polymer or composite for your operating environment.
              </p>

              <div className="pt-3 border-t border-surface-800 space-y-2 text-xs text-surface-300">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{businessHoursConfig?.days || 'Mon – Fri'}: {getFormattedBusinessHours(businessHoursConfig)}</span>
                </div>
                <p className="text-[11px] text-surface-400 pt-1">
                  Sample requests are reviewed by our application engineering team within 24 hours.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
