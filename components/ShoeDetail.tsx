'use client';

import { ContentstackShoe, ContentstackTestimonial } from '@/types/contentstack';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEffect, useState, useMemo } from 'react';
import { formatPrice, trackProductView } from '@/lib/personalize';
import TestimonialForm from './TestimonialForm';
import Link from 'next/link';

interface ShoeDetailProps {
  initialShoe: ContentstackShoe;
  shoeUrl: string;
}

export default function ShoeDetail({ initialShoe, shoeUrl }: ShoeDetailProps) {
  // variantAliases contains full UIDs from SDK (for country/currency)
  const { currency, variantAliases, detectedCountry, isLoading: currencyLoading } = useCurrency();
  const [shoe, setShoe] = useState<ContentstackShoe>(initialShoe);
  const [isLoading, setIsLoading] = useState(false);
  const [colorVariants, setColorVariants] = useState<string[]>([]);

  // Get color from URL parameter (e.g., ?color=red)
  const getColorFromUrl = (): string => {
    if (typeof window === 'undefined') return 'Base';
    const params = new URLSearchParams(window.location.search);
    const colorParam = params.get('color');
    
    if (!colorParam || colorParam.trim() === '') {
      return 'Base';
    }
    
    return colorParam.charAt(0).toUpperCase() + colorParam.slice(1).toLowerCase();
  };

  const [selectedColor, setSelectedColor] = useState('Base');

  // Set selected color on mount
  useEffect(() => {
    setSelectedColor(getColorFromUrl());
  }, []);

  // Normalize country name to match Contentstack audience values
  const normalizeCountry = (country: string): string => {
    const countryMap: Record<string, string> = {
      'United States of America': 'USA',
      'United States': 'USA',
      'US': 'USA',
      'India': 'India',
      // Add more mappings as needed
    };
    return countryMap[country] || country;
  };

  // Set color personalization in SDK (must set BOTH country AND color)
  useEffect(() => {
    async function setColorPersonalization() {
      try {
        console.log(`\n🎨 ===== SETTING COLOR PERSONALIZATION =====`);
        console.log(`🎨 Selected color: "${selectedColor}"`);
        console.log(`🌍 Detected country: "${detectedCountry}"`);
        
        const { initPersonalize } = await import('@/lib/personalize');
        const sdk = await initPersonalize();
        
        if (!sdk) {
          console.error('❌ SDK not available');
          setColorVariants([]);
          return;
        }
        
        // Normalize country for Contentstack audiences
        const normalizedCountry = normalizeCountry(detectedCountry || 'India');
        
        // Set BOTH attributes for color+country combined audiences
        const attributesToSet = {
          country: normalizedCountry,
          color: selectedColor
        };
        
        console.log(`📋 Setting attributes:`, attributesToSet);
        
        // Set attributes
        await sdk.set(attributesToSet);
        
        // Log manifest to see matched audiences
        const sdkAny = sdk as any;
        if (typeof sdkAny.getManifest === 'function') {
          const manifest = sdkAny.getManifest();
          console.log(`📊 SDK Manifest:`, JSON.stringify(manifest, null, 2));
        }
        
        // Get ALL variant aliases
        const allUids = sdk.getVariantAliases();
        const allUidsArray = Array.isArray(allUids) ? allUids.map(id => String(id)) : [];
        
        console.log(`🎯 All variants from SDK:`, allUidsArray);
        
        // Extract ONLY color variants (experience 3) by filtering based on experience ID
        // Country experience is "2", Color experience is "3"
        // Format: cs_personalize_<experienceId>_<variantId>
        const colorOnly = allUidsArray.filter(uid => {
          // Extract experience ID from the UID (e.g., cs_personalize_3_2 -> 3)
          const match = uid.match(/cs_personalize_(\d+)_/);
          if (match) {
            const experienceId = match[1];
            // Keep only color experience variants (experience 3)
            return experienceId === '3';
          }
          return false;
        });
        
        console.log(`🎨 Color variants (experience 3 only):`, colorOnly);
        console.log(`🎨 ===== COLOR PERSONALIZATION COMPLETE =====\n`);
        
        setColorVariants(colorOnly);
      } catch (error) {
        console.error('❌ Error setting color:', error);
        setColorVariants([]);
      }
    }

    if (selectedColor && detectedCountry) {
      setColorPersonalization();
    }
  }, [selectedColor, detectedCountry, variantAliases]);

  // For shoe detail: Use color variants if available (they include country), otherwise use country variants
  // Color variants like "Red Variant India" already include pricing for that country
  const allVariants = useMemo(() => {
    // If we have color variants, use them (they already include country-specific pricing)
    // If no color variant (Base), use country variants for base pricing
    if (colorVariants.length > 0) {
      console.log(`🔄 Using COLOR variants (includes country): [${colorVariants.join(',')}]`);
      return colorVariants;
    }
    // For Base color, use country variants
    console.log(`🔄 Using COUNTRY variants (Base color): [${variantAliases.join(',')}]`);
    return variantAliases;
  }, [variantAliases, colorVariants]);

  // Stabilize array for dependency comparison
  const variantAliasesKey = useMemo(() => allVariants.join(','), [allVariants]);

  useEffect(() => {
    async function fetchShoeWithVariant() {
      setIsLoading(true);
      try {
        // Use variantAliases for fetching content
        const url = `/api/shoes/${shoeUrl}${variantAliasesKey ? `?variants=${encodeURIComponent(variantAliasesKey)}` : ''}`;
        
        console.log(`📡 Fetching shoe detail with variantAliases:`, variantAliasesKey);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.shoe) {
            setShoe(data.shoe);
          }
        }
      } catch (error) {
        console.error('Error fetching shoe:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShoeWithVariant();
  }, [currency, variantAliasesKey, shoeUrl]);

  // Trigger impression using combined variants (country + color)
  useEffect(() => {
    const trackImpression = async () => {
      if (shoe && allVariants.length > 0 && !isLoading && !currencyLoading) {
        console.log(`📊 Tracking product view with variants:`, allVariants);
        
        await trackProductView(
          shoe.uid,
          allVariants,  // Combined country + color variants
          {
            currency,
            title: shoe.title,
            price: shoe.price,
            color: selectedColor,
            brand: Array.isArray(shoe.brand_ref) ? shoe.brand_ref[0]?.title : shoe.brand_ref?.title,
            category: Array.isArray(shoe.category_ref) ? shoe.category_ref[0]?.title : shoe.category_ref?.title,
          }
        );
      }
    };

    const timer = setTimeout(() => {
      trackImpression();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoe.uid, variantAliasesKey, isLoading, currencyLoading, currency, selectedColor, allVariants]);

  const brandTitle = Array.isArray(shoe.brand_ref) ? shoe.brand_ref[0]?.title : shoe.brand_ref?.title;
  const categoryTitle = Array.isArray(shoe.category_ref) ? shoe.category_ref[0]?.title : shoe.category_ref?.title;
  const seller = Array.isArray(shoe.seller_ref) ? shoe.seller_ref[0] : shoe.seller_ref;
  const sellerEmail = seller?.email;

  // Available color options (you can customize this list)
  const availableColors = ['Base', 'Red', 'Black'];

  // Handle color change without page refresh
  const handleColorChange = (color: string) => {
    // Update URL without page refresh
    const url = new URL(window.location.href);
    if (color === 'Base') {
      url.searchParams.delete('color');
    } else {
      url.searchParams.set('color', color.toLowerCase());
    }
    window.history.pushState({}, '', url.toString());
    
    // Update state - this will trigger the useEffect to fetch new variant
    setSelectedColor(color);
  };

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
              <div className="flex items-center gap-3 flex-wrap">
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
                {/* Color Variant Indicator */}
                {selectedColor && selectedColor !== 'Base' && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        selectedColor.toLowerCase() === 'red' ? 'bg-red-500' :
                        selectedColor.toLowerCase() === 'black' ? 'bg-black' :
                        'bg-gray-300'
                      }`}></span>
                      {selectedColor} Variant
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

            {/* Color Selector */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-3">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        isSelected
                          ? 'bg-black text-white border-2 border-black'
                          : 'bg-white text-black border-2 border-gray-300 hover:border-black'
                      }`}
                      disabled={isLoading}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full border ${
                          color.toLowerCase() === 'red' ? 'bg-red-500 border-red-600' :
                          color.toLowerCase() === 'black' ? 'bg-black border-gray-800' :
                          'bg-gray-100 border-gray-300'
                        }`}></span>
                        {color}
                      </span>
                    </button>
                  );
                })}
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
