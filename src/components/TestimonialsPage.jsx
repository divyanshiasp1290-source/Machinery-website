import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Filter, 
  Building2, 
  MapPin, 
  ThumbsUp, 
  MessageSquarePlus, 
  ShieldCheck,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { reviewsSummary, testimonials as initialTestimonials } from '../data/testimonials';

export default function TestimonialsPage({ onNavigate, onOpenConsultation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [reviewsList, setReviewsList] = useState(initialTestimonials);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    role: '',
    company: '',
    product: '',
    rating: 5,
    title: '',
    quote: ''
  });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const categories = ['All', 'Aerospace', 'Motorsport', 'Metrology & QC', 'Heavy Industry', 'Healthcare', 'Defence'];

  const filteredReviews = selectedCategory === 'All' 
    ? reviewsList 
    : reviewsList.filter(r => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.quote || !newReview.title) return;

    const submitted = {
      id: Date.now(),
      author: newReview.author,
      role: newReview.role || 'Engineering Lead',
      company: newReview.company || 'UK Engineering Client',
      location: 'United Kingdom',
      rating: Number(newReview.rating),
      date: 'Just now',
      verified: true,
      product: newReview.product || '3D Printing Equipment',
      category: 'General Engineering',
      title: newReview.title,
      quote: newReview.quote,
      avatar: null
    };

    setReviewsList([submitted, ...reviewsList]);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewModalOpen(false);
      setNewReview({
        author: '',
        role: '',
        company: '',
        product: '',
        rating: 5,
        title: '',
        quote: ''
      });
    }, 2000);
  };

  return (
    <div className="bg-surface-50 min-h-screen py-10">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-surface-500 mb-6">
          <button onClick={() => onNavigate('home')} className="hover:text-surface-900">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
          <span className="text-surface-900 font-semibold">Customer Testimonials &amp; Reviews</span>
        </nav>

        {/* Page Hero & Trust Summary */}
        <div className="bg-white border border-surface-200 rounded-xl p-8 mb-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col: Big Score & Trustpilot */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-surface-200 pb-6 lg:pb-0 lg:pr-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-bold text-brand-700 mb-4">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Verified Customer Feedback
              </div>
              <div className="flex items-baseline justify-center lg:justify-start gap-3">
                <span className="font-display text-5xl font-black text-surface-900 tracking-tight">
                  {reviewsSummary.score}
                </span>
                <span className="text-surface-400 text-lg font-semibold">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-surface-600">
                Rated <strong className="text-surface-900">{reviewsSummary.ratingText}</strong> based on {reviewsSummary.totalReviews} genuine verified reviews across the UK.
              </p>
              <div className="mt-5">
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-900 hover:bg-brand-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Leave a Review</span>
                </button>
              </div>
            </div>

            {/* Middle Col: Rating Breakdown */}
            <div className="lg:col-span-5 space-y-2 text-xs">
              <h4 className="font-bold text-surface-900 text-sm mb-3">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = reviewsSummary.breakdown[stars] || 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-surface-600 font-medium flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    </span>
                    <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-surface-500 font-medium">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Col: Assurance Box */}
            <div className="lg:col-span-3 bg-surface-50 border border-surface-200 rounded-lg p-5 text-xs space-y-3">
              <div className="flex items-center gap-2 text-brand-600 font-bold">
                <Award className="w-4 h-4" />
                <span>Our Quality Commitment</span>
              </div>
              <p className="text-surface-600 leading-relaxed text-[11px]">
                Every review represents a real UK engineering organisation using equipment, materials, or services supplied directly by our engineering headquarters.
              </p>
              <div className="pt-2 border-t border-surface-200 text-[11px] text-surface-500">
                • 100% Genuine Machines<br />
                • Full UK Warranty Included<br />
                • Ongoing Technical Support
              </div>
            </div>

          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-surface-700 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-surface-400" />
              Filter by Industry:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-white border border-surface-300 text-surface-700 hover:border-brand-500 hover:text-brand-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-surface-500 font-medium">
            Showing {filteredReviews.length} verified testimonials
          </span>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredReviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-white border border-surface-200 rounded-lg p-6 flex flex-col justify-between shadow-xs hover:border-surface-300 transition-all"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-surface-400">
                    {rev.date}
                  </span>
                </div>

                <h3 className="font-bold text-base text-surface-900 mb-2 leading-snug">
                  "{rev.title}"
                </h3>

                <p className="text-xs text-surface-700 leading-relaxed italic mb-5">
                  "{rev.quote}"
                </p>

                {/* Purchased item badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 rounded text-[11px] text-surface-700 font-medium">
                  <span className="text-surface-400 font-normal">Equipment:</span>
                  <span className="font-bold text-surface-900">{rev.product}</span>
                </div>
              </div>

              {/* Author & Verification footer */}
              <div className="pt-4 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-700 font-bold text-xs shrink-0">
                    {rev.author.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-surface-900">
                      {rev.author}
                    </h4>
                    <p className="text-[11px] text-surface-500">
                      {rev.role} • <span className="font-semibold text-surface-800">{rev.company}</span>
                    </p>
                    <p className="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-surface-400" />
                      {rev.location}
                    </p>
                  </div>
                </div>

                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="bg-surface-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              Ready to elevate your UK manufacturing capabilities?
            </h3>
            <p className="text-xs text-surface-400 mt-1 max-w-xl">
              Speak with our senior application engineers or schedule an in-person demonstration at our West Midlands Technology Centre.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
          >
            Request Technical Consultation
          </button>
        </div>

      </div>

      {/* Review Submission Modal (Pure Frontend) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative border border-surface-200 max-h-[90vh] overflow-y-auto text-left">
            <button 
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-surface-900">
                  Review Published Successfully!
                </h3>
                <p className="text-xs text-surface-600 mt-1">
                  Thank you for sharing your feedback with the UK engineering community.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-lg font-bold text-surface-900 mb-1">
                  Submit Customer Review
                </h3>
                <p className="text-xs text-surface-500 mb-4">
                  Share your experience with FORGE 3D machines, materials, or support.
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Your Full Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. John Taylor"
                        value={newReview.author}
                        onChange={e => setNewReview({...newReview, author: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Job Title / Role</label>
                      <input 
                        type="text"
                        placeholder="e.g. Lead Prototyping Engineer"
                        value={newReview.role}
                        onChange={e => setNewReview({...newReview, role: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Company / Organization *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Apex Precision Ltd"
                        value={newReview.company}
                        onChange={e => setNewReview({...newReview, company: e.target.value})}
                        className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-surface-700 mb-1">Machine / Service Model</label>
                      <input 
                        type="text"
                        placeholder="e.g. Raise3D Pro3 Plus"
                        value={newReview.product}
                        onChange={e => setNewReview({...newReview, product: e.target.value})}
                        className="w-full px-3 py-2 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Star Rating</label>
                    <select
                      value={newReview.rating}
                      onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      <option value="5">★★★★★ (5/5) Exceptional</option>
                      <option value="4">★★★★☆ (4/5) Very Good</option>
                      <option value="3">★★★☆☆ (3/5) Average</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Review Headline *</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Flawless reliability and exceptional technical support"
                      value={newReview.title}
                      onChange={e => setNewReview({...newReview, title: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-surface-700 mb-1">Review Details *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe how the equipment or service performed for your application..."
                      value={newReview.quote}
                      onChange={e => setNewReview({...newReview, quote: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 rounded text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-surface-900 hover:bg-brand-500 text-white rounded font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Post Review (Live Demo)
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
