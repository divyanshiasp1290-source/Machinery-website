import React from 'react';
import { Mail, MapPin, Layers } from 'lucide-react';

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
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              className="inline-flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-black text-white tracking-tight">
                SOFT <span className="text-brand-500">3D</span>
              </span>
            </a>

            <p className="text-surface-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              SOFT 3D Spółka z o.o. — Premier distributor of industrial 3D printers, large-format LFAM systems, 3D scanners, and certified engineering materials.
            </p>

            <div className="space-y-2 pt-2 text-surface-300 text-xs">
              <div className="flex items-start gap-2.5 text-surface-300">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>Address: ul. Mokotowska 61 lok. 17, 00-542 Warsaw, Poland</span>
              </div>
              <div className="text-[11px] text-surface-400 pl-6 space-y-0.5 font-mono">
                <div>KRS: 0000370365</div>
                <div>NIP: 7010268819 • REGON: 142683598</div>
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
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('industrial-fdm'); }}
                  className="hover:text-white transition-colors block"
                >
                  Industrial 3D Printers
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('large-format'); }}
                  className="hover:text-white transition-colors block"
                >
                  Large Format LFAM
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('large-format'); }}
                  className="hover:text-white transition-colors block"
                >
                  Pellet 3D Printers
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('high-temp'); }}
                  className="hover:text-white transition-colors block"
                >
                  High Temp PEEK / ULTEM
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('sls-powder'); }}
                  className="hover:text-white transition-colors block"
                >
                  SLS Powder Bed
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('resin-sla'); }}
                  className="hover:text-white transition-colors block"
                >
                  Resin SLA / DLP
                </a>
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
                <a 
                  href="/services"
                  onClick={(e) => { e.preventDefault(); onNavigate('services'); }}
                  className="hover:text-white transition-colors block"
                >
                  360° Additive Solutions
                </a>
              </li>
              <li>
                <a 
                  href="/services"
                  onClick={(e) => { e.preventDefault(); onNavigate('services'); }}
                  className="hover:text-white transition-colors block"
                >
                  AM Audits &amp; Consultancy
                </a>
              </li>
              <li>
                <a 
                  href="/catalog"
                  onClick={(e) => { e.preventDefault(); onSelectCategory('scanners'); }}
                  className="hover:text-white transition-colors block"
                >
                  3D Scanning Services
                </a>
              </li>
              <li>
                <a 
                  href="/#brands"
                  onClick={(e) => { e.preventDefault(); onNavigate('brands'); }}
                  className="hover:text-white transition-colors block"
                >
                  Shop By Brand
                </a>
              </li>
              <li>
                <a 
                  href="/blogs"
                  onClick={(e) => { e.preventDefault(); onNavigate('blogs'); }}
                  className="hover:text-white transition-colors block"
                >
                  Case Studies &amp; Blog
                </a>
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
                <a 
                  href="/about"
                  onClick={(e) => { e.preventDefault(); onNavigate('about'); }}
                  className="hover:text-white transition-colors block"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}
                  className="hover:text-white transition-colors block"
                >
                  Contact &amp; Support
                </a>
              </li>
              <li>
                <a 
                  href="/request-sample"
                  onClick={(e) => { e.preventDefault(); onNavigate('request-sample'); }}
                  className="hover:text-white transition-colors text-brand-400 font-semibold block"
                >
                  Request a Sample
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-surface-500 text-[11px] text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} SOFT 3D Spółka z o.o. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center sm:justify-end">
            <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="hover:text-surface-300">About</a>
            <a href="/blogs" onClick={(e) => { e.preventDefault(); onNavigate('blogs'); }} className="hover:text-surface-300">Case Studies</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="hover:text-surface-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
