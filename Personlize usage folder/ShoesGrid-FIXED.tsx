'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { trackProductListView } from '@/lib/personalize';
import ShoePrice from './ShoePrice';
import Link from 'next/link';

interface ShoesGridProps {
  initialShoes: any[];
  listType?: 'homepage' | 'category' | 'search' | 'all';
}

export default function ShoesGrid({ initialShoes, listType = 'all' }: ShoesGridProps) {
  const [shoes, setShoes] = useState(initialShoes);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 🔥 CRITICAL: Get BOTH IDs
  // - shortVariantId: For impression tracking (0, 1, 2)
  // - fullVariantUid: For API calls (cs91db6b7e0d7f71e1, etc.)
  const { currency, shortVariantId, fullVariantUid, isLoading } = useCurrency();

  // Fetch shoes when currency/variant changes
  useEffect(() => {
    const fetchShoes = async () => {
      setLoading(true);
      try {
        // Use FULL UID for API call
        const response = await fetch(`/api/shoes?page=${currentPage}&variant=${fullVariantUid}`);
        const data = await response.json();
        
        if (data.shoes) {
          setShoes(data.shoes);
        }
      } catch (error) {
        console.error('Error fetching shoes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fullVariantUid) {
      fetchShoes();
    }
  }, [currency, fullVariantUid, currentPage]);

  // 🔥 CRITICAL: Trigger impressions using SHORT ID
  useEffect(() => {
    const trackImpressions = async () => {
      if (shoes.length > 0 && shortVariantId && !loading) {
        console.log(`📊 Tracking impressions for SHORT ID: ${shortVariantId}`);
        
        // Use SHORT ID for impression tracking
        await trackProductListView(
          shortVariantId,  // 🔥 THIS IS THE FIX!
          shoes.length,
          listType,
          currency,
          {
            page: currentPage,
          }
        );
      }
    };

    // Small delay to ensure content is actually rendered
    const timer = setTimeout(() => {
      trackImpressions();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoes, shortVariantId, loading, listType, currency, currentPage]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg">Loading {currency} prices...</div>
      </div>
    );
  }

  if (!shoes || shoes.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg">No shoes found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shoes.map((shoe) => (
          <Link 
            key={shoe.uid} 
            href={`/shoes/${shoe.url}`}
            className="group"
          >
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              {shoe.image?.url && (
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={shoe.image.url}
                    alt={shoe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="p-4 space-y-2">
                {/* Brand */}
                {shoe.brand_ref?.[0]?.title && (
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    {shoe.brand_ref[0].title}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2">
                  {shoe.title}
                </h3>

                {/* Category */}
                {shoe.category_ref?.[0]?.title && (
                  <div className="text-sm text-gray-600">
                    {shoe.category_ref[0].title}
                  </div>
                )}

                {/* Price */}
                <div className="pt-2">
                  <ShoePrice price={shoe.price} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono">
          <div className="font-bold mb-2">🔍 Debug Info:</div>
          <div>Currency: {currency}</div>
          <div className="text-green-600">SHORT ID (impressions): {shortVariantId}</div>
          <div className="text-blue-600">FULL UID (API): {fullVariantUid}</div>
          <div>Products shown: {shoes.length}</div>
          <div className="text-green-600 font-bold">✓ Impressions tracked with SHORT ID</div>
        </div>
      )}
    </div>
  );
}
