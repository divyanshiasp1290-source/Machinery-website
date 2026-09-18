import React, { useState } from 'react';
import { 
  Cpu, 
  SearchCheck, 
  Scan, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { services } from '../data/services';
import { api } from '../services/api';

export default function ServicesPage({ onNavigate, onOpenConsultation }) {
  const [activeServiceModal, setActiveServiceModal] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    details: ''
  });

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-brand-500" />;
      case 'SearchCheck': return <SearchCheck className="w-5 h-5 text-brand-500" />;
      case 'Scan': return <Scan className="w-5 h-5 text-brand-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-brand-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-brand-500" />;
      default: return <Cpu className="w-5 h-5 text-brand-500" />;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const serviceTitle = activeServiceModal?.title || '360° Additive Engineering';
      await api.enquiries.submit({
        name: serviceFormData.name,
        company: serviceFormData.company,
        email: serviceFormData.email,
        phone: serviceFormData.phone,
        message: serviceFormData.details 
          ? `[Service: ${serviceTitle}] ${serviceFormData.details}`
          : `Service inquiry for: ${serviceTitle}`,
        serviceType: serviceTitle,
        type: 'consultation',
        specs: serviceFormData.details
      });

      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setActiveServiceModal(null);
        setServiceFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          details: ''
        });
      }, 2500);
    } catch (err) {
      console.error('Service inquiry submission error:', err);
      setFormError(err.message || 'Failed to submit service inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen py-10 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-surface-900 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="text-surface-900 font-semibold">Services &amp; 360 Additive Solutions</span>
        </nav>

        {/* Page Hero */}
        <div className="bg-surface-900 text-white rounded-xl p-8 sm:p-12 mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Turnkey Additive Engineering
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              360° Additive Solutions, AM Audits &amp; Metrology Services
            </h1>
            <p className="text-xs sm:text-sm text-surface-300 leading-relaxed max-w-2xl">
              We go far beyond equipment boxes. SOFT 3D partners with European manufacturers to audit CAD designs, certify workplace ventilation, develop bespoke material parameters, and provide on-demand batch manufacturing.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Services List - Large Clean Cards */}
        <div className="space-y-10 mb-16">
          {services.map((srv, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <div 
                key={srv.id}
                className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-xs hover:border-surface-300 transition-all grid grid-cols-1 lg:grid-cols-12 items-stretch"
              >
                {/* Image Column - Exact same size across all cards, alternating position */}
                <div className={`order-1 ${isReversed ? 'lg:order-2' : 'lg:order-1'} lg:col-span-5 relative overflow-hidden bg-surface-100 flex items-stretch`}>
                  <div className="relative w-full h-72 sm:h-80 lg:h-full min-h-[280px] lg:min-h-[460px]">
                    <img 
                      src={srv.image} 
                      alt={srv.title} 
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                    <span className={`absolute top-4 ${isReversed ? 'right-4' : 'left-4'} bg-surface-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded backdrop-blur-xs shadow-xs z-10`}>
                      {srv.badge}
                    </span>
                  </div>
                </div>

                {/* Content Column - Alternating position */}
                <div className={`order-2 ${isReversed ? 'lg:order-1' : 'lg:order-2'} lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      {getServiceIcon(srv.iconName)}
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-surface-900 leading-tight">
                        {srv.title}
                      </h2>
                      <p className="text-xs font-semibold text-brand-600">
                        {srv.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Bullets */}
                  <div className="space-y-2 pt-1">
                    {srv.bullets.map((b, bidx) => (
                      <div key={bidx} className="flex items-start gap-2 text-xs text-surface-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Highlight Quote */}
                  <div className="p-3.5 bg-surface-50 border-l-2 border-brand-500 rounded-r-xl text-xs text-surface-600 italic">
                    "{srv.caseHighlight}"
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveServiceModal(srv)}
                      className="px-5 py-2.5 bg-surface-900 hover:bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Enquire About {srv.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onOpenConsultation}
                      className="px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Request Technical Callback
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-white border border-surface-200 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">UK Facility &amp; Showroom</span>
            <h3 className="font-display text-xl font-bold text-surface-900 mt-1">
              Visit Our West Midlands Additive Demonstration Centre
            </h3>
            <p className="text-xs text-surface-600 mt-1 max-w-xl">
              Bring your CAD files, test actual engineering materials on live production equipment, and review metrology inspection heat maps in person.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap"
          >
            Book Showroom Visit
          </button>
        </div>

      </div>

      {/* Service Enquiry Modal */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative border border-surface-200 text-left max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setActiveServiceModal(null)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-surface-900">
                  Service Request Received!
                </h3>
                <p className="text-xs text-surface-600 mt-1">
                  Our application engineer will review your project requirements and respond within 24 business hours.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  {activeServiceModal.badge}
                </span>
                <h3 className="font-display text-lg font-bold text-surface-900 mt-2 mb-1">
                  Request {activeServiceModal.title}
                </h3>
                <p className="text-xs text-surface-500 mb-4">
                  Fill in your details below and our UK engineering team will get in touch with feasibility information and pricing.
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Contact Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. David Clarke"
                        value={serviceFormData.name}
                        onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Company / Facility *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Apex Precision Ltd"
                        value={serviceFormData.company}
                        onChange={e => setServiceFormData({...serviceFormData, company: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Email Address *</label>
                      <input 
                        required
                        type="email"
                        placeholder="david@apex.co.uk"
                        value={serviceFormData.email}
                        onChange={e => setServiceFormData({...serviceFormData, email: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Telephone Number</label>
                      <input 
                        type="tel"
                        placeholder="+44 7123 456789"
                        value={serviceFormData.phone}
                        onChange={e => setServiceFormData({...serviceFormData, phone: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Project Scope &amp; Target Timeline</label>
                    <textarea 
                      rows={3}
                      placeholder="Specify material requirements, part dimensions, expected volume, or scanning targets..."
                      value={serviceFormData.details}
                      onChange={e => setServiceFormData({...serviceFormData, details: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded font-bold uppercase tracking-wider text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Enquiry...</span>
                      </>
                    ) : (
                      <span>Submit Engineering Enquiry</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
