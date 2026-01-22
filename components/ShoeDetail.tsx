'use client';

import { ContentstackShoe, ContentstackTestimonial } from '@/types/contentstack';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/personalize';
import TestimonialForm from './TestimonialForm';
import Link from 'next/link';

interface ShoeDetailProps {
  initialShoe: ContentstackShoe;
  shoeUrl: string;
}

export default function ShoeDetail({ initialShoe, shoeUrl }: ShoeDetailProps) {
  const { currency, variantUid, isLoading: currencyLoading } = useCurrency();
  const [shoe, setShoe] = useState<ContentstackShoe>(initialShoe);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchShoeWithVariant() {
      setIsLoading(true);
      try {
        const url = `/api/shoes/${shoeUrl}?variant=${encodeURIComponent(variantUid)}`;
        console.log('Detail page fetching shoe with variant UID:', variantUid);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.shoe) {
            setShoe(data.shoe);
          }
        }
      } catch (error) {
        console.error('Failed to fetch shoe:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShoeWithVariant();
  }, [currency, variantUid, shoeUrl]);

  const brandTitle = Array.isArray(shoe.brand_ref) ? shoe.brand_ref[0]?.title : shoe.brand_ref?.title;
  const categoryTitle = Array.isArray(shoe.category_ref) ? shoe.category_ref[0]?.title : shoe.category_ref?.title;
  const seller = Array.isArray(shoe.seller_ref) ? shoe.seller_ref[0] : shoe.seller_ref;
  const sellerEmail = seller?.email;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-black transition-colors duration-200 inline-flex items-center gap-1"
          >
            <span>Home</span>
            <span>/</span>
            <span className="text-black">{shoe.title}</span>
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 animate-fade-in">
          {/* Product Image - Adidas Style */}
          <div className="sticky top-20 h-fit">
            <div className="relative overflow-hidden bg-white aspect-square flex items-center justify-center p-4 sm:p-8 lg:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
              {shoe.main_image?.url ? (
                <img 
                  src={shoe.main_image.url} 
                  alt={shoe.title} 
                  className="relative z-10 w-full h-full object-contain transition-transform duration-700 hover:scale-110" 
                  loading="eager"
                />
              ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product Information - Adidas Style */}
          <div className="space-y-6 sm:space-y-8">
            {/* Brand & Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {brandTitle && (
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {brandTitle}
                  </span>
                )}
                {categoryTitle && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      {categoryTitle}
                    </span>
                  </>
                )}
              </div>
              
              {/* Product Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight text-black">
                {shoe.title}
              </h1>
              
              {/* Price */}
              <div className="text-2xl sm:text-3xl font-bold text-black">
                {isLoading || currencyLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
                  </span>
                ) : (
                  formatPrice(String(shoe.price), currency)
                )}
              </div>
            </div>

            {/* Description */}
            {shoe.description && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-3">Description</h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {shoe.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {(shoe.weight || shoe.heel_height || (shoe.size && shoe.size.length > 0)) && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Specifications</h3>
                <div className="border border-gray-200 divide-y divide-gray-200">
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-semibold text-black">{shoe.weight || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Heel Height</span>
                    <span className="font-semibold text-black">{shoe.heel_height || '—'}</span>
                  </div>
                  <div className="px-4 py-3 text-sm">
                    <span className="text-gray-600">Sizes</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shoe.size?.length
                        ? shoe.size.map((size, idx) => (
                            <button
                              key={idx}
                              className="px-4 py-2 text-xs font-semibold text-black border-2 border-gray-300 hover:border-black transition-all duration-200 hover:scale-105 bg-white"
                            >
                              {size}
                            </button>
                          ))
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Button - Adidas Style */}
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <button className="w-full px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                Add to Cart
              </button>
              <button className="w-full px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all duration-300">
                Favorite
              </button>
            </div>

            {/* Seller Information */}
            {seller && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Seller</h3>
                <div className="flex items-start gap-4">
                  {seller.image?.url && (
                    <img
                      src={seller.image.url}
                      alt={seller.name}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="text-black font-semibold">{seller.name}</p>
                    {seller.description && <p>{seller.description}</p>}
                    {seller.email && <p>{seller.email}</p>}
                    {seller.phone && <p>{seller.phone}</p>}
                    {seller.address && <p>{seller.address}</p>}
                  </div>
                </div>
              </div>
            )}

            <TestimonialForm sellerEmail={sellerEmail} />

            {/* Materials + Care */}
            {shoe.material_ref && shoe.material_ref.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Materials & Care</h3>
                <div className="flex flex-wrap gap-2">
                  {shoe.material_ref.map((material) => (
                    <div key={material.uid} className="relative group">
                      <span className="inline-flex items-center px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-gray-100 text-black border border-gray-200">
                        {material.title}
                      </span>
                      {material.care_instructions && (
                        <div className="absolute left-0 top-full mt-2 w-56 p-3 bg-black text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-lg z-10">
                          <p className="font-bold uppercase tracking-widest mb-1">Care Instructions</p>
                          <p className="text-white/90">{material.care_instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews Slider */}
            {shoe.testimonials && shoe.testimonials.length > 0 && (
              <section className="pt-8 border-t border-gray-200">
                <h3 className="text-xl sm:text-2xl font-black uppercase mb-6 text-black">
                  Customer Reviews
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {shoe.testimonials.map((review: ContentstackTestimonial, index: number) => {
                    const rating = Math.min(Math.max(review.rating || 0, 0), 5);

                    return (
                      <div
                        key={index}
                        className="min-w-[260px] sm:min-w-[320px] snap-start p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {review.user_photo && (
                              <img
                                src={review.user_photo.url}
                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                alt={review.title}
                              />
                            )}
                            <span className="font-bold text-sm text-black">{review.title}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <span
                                key={starIndex}
                                className={starIndex < rating ? 'text-black' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          "{review.feedback}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
