import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Send,
  Building,
  User,
  MessageSquare
} from 'lucide-react';

export default function ConsultationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    serviceType: 'Machine Selection Audit',
    timeframe: 'Immediate (< 1 month)',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-surface-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full text-surface-400 hover:text-surface-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-display font-bold text-xl text-surface-900">
              Technical Audit Request Confirmed
            </h3>

            <p className="text-xs text-surface-600 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-bold">{formData.name}</span>. A factory-certified additive manufacturing engineer from FORGE 3D will review your requirements and get in touch within 2 business hours to schedule your audit or demonstration.
            </p>

            <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-600 text-left max-w-sm mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-surface-400">Consultation Type:</span>
                <span className="font-semibold text-surface-800">{formData.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Company:</span>
                <span className="font-semibold text-surface-800">{formData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Contact:</span>
                <span className="font-semibold text-surface-800">{formData.phone}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Direct UK Engineering Desk
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl text-surface-900 mb-1">
              Book an Additive Manufacturing Consultation
            </h3>
            <p className="text-xs text-surface-500 mb-6 leading-relaxed">
              Discuss cycle times, material properties, build volume, and return-on-investment with a certified additive manufacturing engineer.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Richard Davies"
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. British Aerospace & Tooling"
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="richard@company.co.uk"
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Direct Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 7123 456789"
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Consultation Goal
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Machine Selection Audit">3D Printer Selection Audit</option>
                    <option value="Live Showroom Demonstration">West Midlands Showroom Demo</option>
                    <option value="Benchmark Sample Testing">Benchmark Part Test &amp; CMM Report</option>
                    <option value="LFAM Pellet System Integration">LFAM Pellet System Integration</option>
                    <option value="Bulk Polymer & Resin Supply">Bulk Consumable Supply Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                    Project Timeframe
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                    className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Immediate (< 1 month)">Immediate (&lt; 1 month)</option>
                    <option value="1 - 3 Months">1 - 3 Months (Capital Allocation)</option>
                    <option value="3 - 6 Months">3 - 6 Months (FY Planning)</option>
                    <option value="Research & Feasibility">Initial R&amp;D Feasibility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                  Briefly describe your application or part requirements
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Material requirements (e.g. PEEK, Carbon PA), typical part sizes, expected annual production volume..."
                  className="w-full p-2.5 bg-surface-50 border border-surface-300 rounded text-xs focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Engineering Consultation</span>
                </button>
              </div>

              <div className="pt-2 text-center text-[11px] text-surface-500 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <span>🔒 Confidential NDA protected</span>
                <span>•</span>
                <span>⏱️ Response within 2 working hours</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
