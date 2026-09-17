import React, { useState } from 'react';
import { X, Star, CheckCircle, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function TestimonialModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setRating(5);
    setHoverRating(0);
    setContent('');
    setErrorMsg('');
    setSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    const trimmedName = fullName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    if (!trimmedContent) {
      setErrorMsg('Please share a few words about your experience with our machinery or support.');
      return;
    }

    if (trimmedContent.length < 10) {
      setErrorMsg('Testimonial should be at least 10 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await api.testimonials.submit({
        name: trimmedName,
        rating: Number(rating),
        content: trimmedContent
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit testimonial:', err);
      setErrorMsg(err.message || 'Something went wrong while submitting your testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Quality',
    4: 'Very Good',
    5: 'Excellent & Highly Recommended'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-surface-200 overflow-hidden relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-surface-100 flex items-start justify-between bg-surface-50/50">
          <div>
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider font-mono">
              CLIENT TESTIMONIAL
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-surface-900 mt-1">
              Share Your Experience
            </h3>
            <p className="text-xs text-surface-500 mt-1 leading-relaxed">
              Tell other engineers and manufacturing leaders how SOFT 3D systems helped your production.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display font-black text-xl text-surface-900">
                  Thank You!
                </h4>
                <p className="text-sm text-surface-600 max-w-md mx-auto leading-relaxed">
                  Thank you for sharing your experience. Your testimonial has been submitted for review.
                </p>
                <p className="text-xs text-surface-400">
                  Our engineering team will review it shortly prior to public showcase.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-surface-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1.5">
                  Full Name <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Alistair Vance"
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs font-medium text-surface-900 placeholder:text-surface-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1.5">
                  Rating <span className="text-brand-600">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-200">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentVal = hoverRating || rating;
                      const isFilled = currentVal >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`${star} star`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isFilled
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-surface-300 stroke-1'
                            } transition-colors`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-surface-700">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Testimonial / Experience Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-surface-700">
                    Testimonial / Your Experience <span className="text-brand-600">*</span>
                  </label>
                  <span className="text-[10px] text-surface-400">
                    {content.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details about the industrial equipment, printing turnaround, precision, or support from our engineering team..."
                  className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs font-medium text-surface-900 placeholder:text-surface-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-surface-600 hover:text-surface-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
