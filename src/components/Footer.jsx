import React from 'react';
import { Phone, Mail, MapPin, Layers } from 'lucide-react';

export default function Footer({ 
  onNavigate, 
  onSelectCategory, 
  onOpenConsultation 
}) {
  return (
    <footer className="bg-surface-900 text-surface-400 text-xs border-t border-surface-800 text-left">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-black text-white tracking-tight">
                FORGE<span className="text-brand-500">3D</span>
              </span>
            </div>

            <p className="text-surface-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Official UK distributor of industrial 3D printing equipment, large-format LFAM pellet systems, metrology 3D scanners, and advanced polymer materials.
            </p>

            <div className="space-y-2 pt-2 text-surface-300 text-xs">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="tel:+441215553820" className="hover:text-white transition-colors">+44 (0) 121 555 3820</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:engineering@forge3d.co.uk" className="hover:text-white transition-colors">engineering@forge3d.co.uk</a>
              </div>
              <div className="flex items-center gap-2.5 text-surface-400">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Advanced Manufacturing Park, West Midlands, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* 3D Printers */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              3D Printers
            </h4>
            <ul className="space-y-2 text-surface-400 text-xs">
              <li>
                <button onClick={() => onSelectCategory('industrial-fdm')} className="hover:text-white transition-colors">
                  Industrial 3D Printers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('large-format')} className="hover:text-white transition-colors">
                  Large Format LFAM
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('large-format')} className="hover:text-white transition-colors">
                  Pellet 3D Printers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('high-temp')} className="hover:text-white transition-colors">
                  High Temp PEEK / ULTEM
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sls-powder')} className="hover:text-white transition-colors">
                  SLS Powder Bed
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('resin-sla')} className="hover:text-white transition-colors">
                  Resin SLA / DLP
                </button>
              </li>
            </ul>
          </div>

          {/* Services & Brands */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Services &amp; Brands
            </h4>
            <ul className="space-y-2 text-surface-400 text-xs">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  360° Additive Solutions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  AM Audits &amp; Consultancy
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('scanners')} className="hover:text-white transition-colors">
                  3D Scanning Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('brands')} className="hover:text-white transition-colors">
                  Shop By Brand
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blogs')} className="hover:text-white transition-colors">
                  Case Studies &amp; Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2 text-surface-400 text-xs">
              <li>
                <button onClick={() => onNavigate('testimonials')} className="hover:text-white transition-colors">
                  Customer Testimonials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('request-sample')} className="hover:text-white transition-colors text-brand-400 font-semibold">
                  Request a Sample
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-surface-500 text-[11px] text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} FORGE 3D Systems UK Ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
            <button onClick={() => onNavigate('about')} className="hover:text-surface-300">About</button>
            <button onClick={() => onNavigate('testimonials')} className="hover:text-surface-300">Testimonials</button>
            <button onClick={() => onNavigate('blogs')} className="hover:text-surface-300">Case Studies</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-surface-300">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
