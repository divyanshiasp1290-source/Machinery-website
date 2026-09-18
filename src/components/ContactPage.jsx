import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

import { api } from '../services/api';
import { businessHoursConfig, getFormattedBusinessHours } from '../config/businessHours';

export default function ContactPage({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
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
        message: formData.message,
        type: 'general'
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: ''
        });
      }, 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please check your details.');
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
          <span className="text-surface-900 font-semibold">Contact Our UK Team</span>
        </nav>

        {/* Page Hero */}
        <div className="bg-white border border-surface-200 rounded-xl p-8 mb-10 shadow-xs">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-bold text-brand-700 mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Direct UK Engineering Support
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-surface-900 tracking-tight">
              Get in Touch with Our Technical Specialists
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-surface-600 leading-relaxed">
              Whether you need guidance selecting an industrial 3D printer, require a quotation for high-temperature filament or pellets, or wish to schedule a live demonstration at our UK engineering facility, our dedicated team is on hand.
            </p>
          </div>
        </div>

        {/* Main Grid: Form on Left, Contact Details & Showroom on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Form Box */}
          <div className="lg:col-span-7 bg-white border border-surface-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-xl font-bold text-surface-900 mb-2">
              Send an Engineering Inquiry
            </h2>
            <p className="text-xs text-surface-500 mb-6">
              Our applications engineers respond within 24 business hours.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-base font-bold text-emerald-900">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you for contacting SOFT 3D. A technical specialist has been assigned to your request and will contact you promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Full Name *</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Richard Evans"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Company / Organization *</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. British Engineering Group"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Email Address *</label>
                    <input 
                      required
                      type="email"
                      placeholder="richard@britishengineering.co.uk"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Telephone Number</label>
                    <input 
                      type="tel"
                      placeholder="+44 (0) 1234 567890"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2.5 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-surface-700 mb-1">Project Details / Message *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe your manufacturing application, specific machine models of interest, or questions..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full px-3 py-2.5 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500 leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-surface-900 hover:bg-brand-500 text-white rounded font-bold uppercase tracking-wider text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Showroom Box */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Info */}
            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-surface-900 uppercase tracking-wider">
                Direct Contact Channels
              </h3>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-surface-900 block">Technical RFQ &amp; Inquiries</span>
                    <span className="text-surface-600">Submit CAD files, project RFQs &amp; machine queries via the online form</span>
                    <p className="text-[11px] text-surface-400">Response guaranteed within 24 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-surface-900 block">Working Hours</span>
                    <span className="text-surface-600">
                      {businessHoursConfig?.workdays || 'Monday – Friday'}: {getFormattedBusinessHours(businessHoursConfig)}
                    </span>
                    <p className="text-[11px] text-surface-400">Emergency technical support for contracted SLA partners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Showroom & Facility */}
            <div className="bg-surface-900 text-white rounded-xl p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-brand-500 font-bold uppercase tracking-wider text-[11px]">
                <Building2 className="w-4 h-4" />
                <span>Central European Headquarters</span>
              </div>
              <h4 className="font-display text-base font-bold text-white">
                SOFT 3D Spółka z o.o.
              </h4>
              <p className="text-surface-300 leading-relaxed text-xs">
                <strong>Address:</strong><br />
                ul. Mokotowska 61 lok. 17<br />
                00-542 Warsaw, Poland
              </p>
              <div className="pt-2 text-surface-400 font-mono text-[11px] space-y-0.5 border-t border-surface-800">
                <div>KRS: 0000370365</div>
                <div>NIP: 7010268819 • REGON: 142683598</div>
              </div>
              <div className="pt-2 text-surface-400 text-[11px]">
                Demonstrations and technical consultations available by prior appointment.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
