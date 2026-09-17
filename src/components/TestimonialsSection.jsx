import React, { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { testimonials as defaultTestimonials } from '../data/testimonials';
import { api } from '../services/api';
import TestimonialModal from './TestimonialModal';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(340);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize with existing verified items, will be updated from Supabase approved testimonials
  const [items, setItems] = useState(() => {
    return defaultTestimonials.map(t => ({
      id: t.id,
      author: t.author,
      rating: t.rating,
      quote: t.quote,
      verified: t.verified
    }));
  });

  const totalReviews = items.length || 1;

  // Load approved testimonials from Supabase
  const loadApprovedTestimonials = async () => {
    try {
      const data = await api.testimonials.list();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data.map(d => ({
          id: d.id,
          author: d.name,
          rating: Number(d.rating) || 5,
          quote: d.content,
          verified: d.verified !== false
        })));
      }
    } catch (e) {
      console.warn('Could not load testimonials from Supabase:', e);
    }
  };

  // On mount and realtime subscription
  useEffect(() => {
    loadApprovedTestimonials();
    const unsub = api.realtime.subscribeTestimonials(() => {
      loadApprovedTestimonials();
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Dynamically calculate responsive card width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w < 480) {
          setCardWidth(Math.min(300, w - 48));
        } else if (w < 768) {
          setCardWidth(310);
        } else {
          setCardWidth(340);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatic slide interval (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalReviews);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, totalReviews]);

  // Mobile Touch Swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    if (e?.touches && e.touches.length > 0 && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    }
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (e?.touches && e.touches.length > 0 && e.touches[0]) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      setCurrentIndex((prev) => (prev + 1) % totalReviews);
    } else if (distance < -45) {
      setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
    }
    setIsPaused(false);
  };

  return (
    <section className="py-16 sm:py-20 bg-[#f8fafc] border-b border-surface-200 overflow-hidden">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Testimonials Container matching user reference design */}
        <div className="bg-white rounded-3xl border border-surface-200/90 py-10 sm:py-14 px-2 sm:px-6 shadow-card relative overflow-hidden text-center">
          
          {/* Faint Background Watermark Double Quote */}
          <div 
            className="absolute top-0 left-6 sm:left-12 text-surface-200/40 select-none pointer-events-none font-serif text-[110px] sm:text-[150px] leading-none font-black -rotate-6"
            aria-hidden="true"
          >
            “
          </div>

          {/* Heading Section */}
          <div className="relative z-10 max-w-2xl mx-auto mb-12 sm:mb-16 px-4">
            <p className="text-brand-600 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
              CUSTOMER TESTIMONIALS
            </p>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 tracking-tight">
              What our Clients say!
            </h2>

            {/* Accent Underline matching reference image */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5 mb-4">
              <span className="w-16 h-1 bg-brand-500 rounded-full" />
              <span className="w-2.5 h-1 bg-brand-500/60 rounded-full" />
            </div>

            <p className="text-xs sm:text-sm text-surface-500 max-w-md mx-auto leading-relaxed mb-6">
              Verified experiences from UK aerospace, automotive, and industrial engineering leaders.
            </p>

            {/* Share Your Experience Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-brand-600/25 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share Your Experience</span>
              </button>
            </div>
          </div>

          {/* Continuous Automatic Sliding Viewport with extra breathing room above */}
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden select-none pt-6 sm:pt-10 pb-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Soft Edge Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-white via-white/85 to-transparent pointer-events-none z-20" />

            {/* Smooth Centered Slide Track */}
            <div 
              className="flex gap-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{
                transform: `translateX(calc(50% - ${cardWidth / 2}px - ${currentIndex * (cardWidth + 24)}px))`
              }}
            >
              {items.map((rev, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={rev.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    style={{ width: `${cardWidth}px` }}
                    className={`shrink-0 bg-white border rounded-3xl p-6 sm:p-7 transition-all duration-500 flex flex-col justify-between cursor-pointer text-left ${
                      isActive 
                        ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-card-hover scale-[1.02] opacity-100 z-10' 
                        : 'border-surface-200/90 shadow-card hover:border-surface-300 opacity-70 hover:opacity-95 scale-95'
                    }`}
                  >
                    {/* Top Header: Client Info */}
                    <div className="text-center pb-2">
                      <h3 className="font-display font-bold text-base sm:text-lg text-surface-900 tracking-tight leading-snug">
                        {rev.author}
                      </h3>

                      {/* Stars & Verified Badge */}
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400" 
                          />
                        ))}
                        {rev.verified !== false && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Quote with Reference-Style Quotation Marks */}
                    <div className="pt-3 pb-2 relative flex-1 flex flex-col justify-between">
                      <span 
                        className="text-surface-300 font-serif text-3xl sm:text-4xl font-black select-none block -mb-2 leading-none"
                        aria-hidden="true"
                      >
                        “
                      </span>

                      <p className="text-xs sm:text-[13px] text-surface-600 leading-relaxed font-normal px-1 italic text-center my-auto">
                        {rev.quote}
                      </p>

                      <span 
                        className="text-surface-300 font-serif text-3xl sm:text-4xl font-black select-none block -mt-1 leading-none text-right"
                        aria-hidden="true"
                      >
                        ”
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Testimonial Submission Modal */}
      <TestimonialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}
