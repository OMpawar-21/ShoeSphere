'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { trackProductView } from '@/lib/personalize';
import ShoePrice from './ShoePrice';

interface ShoeDetailProps {
  initialShoe: any;
  shoeUrl: string;
}

export default function ShoeDetail({ initialShoe, shoeUrl }: ShoeDetailProps) {
  const [shoe, setShoe] = useState(initialShoe);
  const [loading, setLoading] = useState(false);
  
  // 🔥 CRITICAL: Get BOTH IDs
  const { currency, shortVariantId, fullVariantUid, isLoading } = useCurrency();

  // Fetch shoe when currency/variant changes
  useEffect(() => {
    const fetchShoe = async () => {
      setLoading(true);
      try {
        // Use FULL UID for API call
        const response = await fetch(`/api/shoes/${shoeUrl}?variant=${fullVariantUid}`);
        const data = await response.json();
        
        if (data.shoe) {
          setShoe(data.shoe);
        }
      } catch (error) {
        console.error('Error fetching shoe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fullVariantUid) {
      fetchShoe();
    }
  }, [currency, fullVariantUid, shoeUrl]);

  // 🔥 CRITICAL: Trigger impression using SHORT ID
  useEffect(() => {
    const trackImpression = async () => {
      if (shoe && shortVariantId && !loading) {
        console.log(`📊 Tracking product view for SHORT ID: ${shortVariantId}`);
        
        // Use SHORT ID for impression tracking
        await trackProductView(
          shoe.uid,
          shortVariantId,  // 🔥 THIS IS THE FIX!
          currency,
          {
            title: shoe.title,
            price: shoe.price,
            brand: shoe.brand_ref?.[0]?.title,
            category: shoe.category_ref?.[0]?.title,
          }
        );
      }
    };

    // Small delay to ensure content is actually rendered
    const timer = setTimeout(() => {
      trackImpression();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoe, shortVariantId, loading, currency]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg">Loading {currency} price...</div>
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          {shoe.image?.url && (
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={shoe.image.url}
                alt={shoe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand */}
          {shoe.brand_ref?.[0]?.title && (
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              {shoe.brand_ref[0].title}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold">{shoe.title}</h1>

          {/* Category */}
          {shoe.category_ref?.[0]?.title && (
            <div className="text-lg text-gray-600">
              {shoe.category_ref[0].title}
            </div>
          )}

          {/* Price */}
          <div className="text-3xl font-bold">
            <ShoePrice price={shoe.price} />
          </div>

          {/* Description */}
          {shoe.description && (
            <div className="prose prose-lg">
              <p>{shoe.description}</p>
            </div>
          )}

          {/* Seller Info */}
          {shoe.seller_ref?.[0] && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Seller Information</h3>
              <div className="text-gray-600">
                <div>Seller: {shoe.seller_ref[0].title}</div>
                {shoe.seller_ref[0].location && (
                  <div>Location: {shoe.seller_ref[0].location}</div>
                )}
              </div>
            </div>
          )}

          {/* Material */}
          {shoe.material_ref?.[0] && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Material & Care</h3>
              <div className="text-gray-600">
                <div>Material: {shoe.material_ref[0].title}</div>
                {shoe.material_ref[0].care_instructions && (
                  <div className="mt-2">
                    <div className="font-medium">Care Instructions:</div>
                    <div>{shoe.material_ref[0].care_instructions}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Size Options */}
          {shoe.sizes && shoe.sizes.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Available Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {shoe.sizes.map((size: string, index: number) => (
                  <button
                    key={index}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="border-t pt-6">
            <button className="w-full bg-black text-white py-4 px-8 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Add to Cart
            </button>
          </div>

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono">
              <div className="font-bold mb-2">🔍 Debug Info:</div>
              <div>Currency: {currency}</div>
              <div className="text-green-600">SHORT ID (impressions): {shortVariantId}</div>
              <div className="text-blue-600">FULL UID (API): {fullVariantUid}</div>
              <div>Product ID: {shoe.uid}</div>
              <div className="text-green-600 font-bold">✓ Product view impression tracked with SHORT ID</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
