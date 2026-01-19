'use client';

import { useState } from 'react';

interface TestimonialFormProps {
  sellerEmail?: string;
}

export default function TestimonialForm({ sellerEmail }: TestimonialFormProps) {
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('5');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = sellerEmail && title && feedback && rating;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sellerEmail) return;

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rating: Number(rating),
          feedback,
          seller_email: sellerEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error?.message || 'Failed to submit testimonial.');
      }

      setStatus('success');
      setTitle('');
      setRating('5');
      setFeedback('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="pt-8 border-t border-gray-200">
      <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 text-black">
        Write a Review
      </h3>
      {!sellerEmail && (
        <p className="text-sm text-gray-600">
          Seller email is missing for this shoe. Reviews are disabled.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-black outline-none"
            placeholder="Your name"
            disabled={!sellerEmail || status === 'loading'}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
            Rating
          </label>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-black outline-none"
            disabled={!sellerEmail || status === 'loading'}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Great</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            className="w-full border-2 border-gray-300 px-4 py-3 text-sm focus:border-black outline-none min-h-[120px]"
            placeholder="Share your experience"
            disabled={!sellerEmail || status === 'loading'}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || status === 'loading'}
          className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Review'}
        </button>
        {status === 'success' && (
          <p className="text-sm text-green-600">Thanks! Your review was submitted.</p>
        )}
        {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
