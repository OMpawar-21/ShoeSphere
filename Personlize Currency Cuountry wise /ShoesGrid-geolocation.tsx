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
  
  // Get currency, country, and SHORT UIDs from context
  const { currency, detectedCountry, isAutoDetected, shortUids, isLoading, isDetecting } = useCurrency();

  // Fetch shoes when currency/shortUids change
  useEffect(() => {
    const fetchShoes = async () => {
      // Don't fetch while still detecting
      if (isDetecting) return;
      
      setLoading(true);
      try {
        console.log(`\n🔄 Fetching shoes for currency: ${currency}`);
        
        // Fetch shoes - API can use currency or shortUids
        const response = await fetch(`/api/shoes?page=${currentPage}&currency=${currency}`);
        const data = await response.json();
        
        if (data.shoes) {
          console.log(`✅ Fetched ${data.shoes.length} shoes`);
          setShoes(data.shoes);
        }
      } catch (error) {
        console.error('❌ Error fetching shoes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currency && !isDetecting) {
      fetchShoes();
    }
  }, [currency, currentPage, isDetecting]);

  // 🔥 Track impressions using SHORT UIDs
  useEffect(() => {
    const trackImpressions = async () => {
      if (shoes.length > 0 && shortUids.length > 0 && !loading && !isDetecting) {
        console.log(`\n📊 ===== TRACKING IMPRESSIONS =====`);
        console.log(`📄 Page type: ${listType}`);
        console.log(`👟 Products shown: ${shoes.length}`);
        console.log(`🌍 Detected country: ${detectedCountry || 'Unknown'}`);
        console.log(`💰 Currency: ${currency}`);
        console.log(`🎯 SHORT UIDs to track:`, shortUids);
        console.log(`🤖 Auto-detected: ${isAutoDetected ? 'Yes' : 'No (Manual)'}`);
        
        // Track impressions with context
        await trackProductListView(
          shortUids,
          shoes.length,
          listType,
          {
            currency,
            country: detectedCountry || 'Unknown',
            isAutoDetected,
            page: currentPage,
          }
        );
        
        console.log(`✅ Impressions tracked successfully`);
        console.log(`📊 ===== TRACKING COMPLETE =====\n`);
      } else {
        if (shortUids.length === 0 && !isDetecting) {
          console.warn('⚠️ Cannot track impressions - no SHORT UIDs available');
        }
      }
    };

    // Delay to ensure content is rendered
    const timer = setTimeout(() => {
      trackImpressions();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoes, shortUids, loading, isDetecting, listType, currency, detectedCountry, isAutoDetected, currentPage]);

  // Show detecting state
  if (isDetecting) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <div className="text-lg">Detecting your location...</div>
        <div className="text-sm text-gray-600">Setting up personalized pricing</div>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Location & Currency Info Banner */}
      {detectedCountry && isAutoDetected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <div>
              <div className="font-medium text-blue-900">
                Showing prices for {detectedCountry}
              </div>
              <div className="text-sm text-blue-700">
                Currency: {currency} • Detected automatically from your location
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Notice */}
      {!isAutoDetected && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💱</span>
            <div>
              <div className="font-medium text-gray-900">
                Currency manually set to {currency}
              </div>
              <div className="text-sm text-gray-600">
                {detectedCountry && `Detected location: ${detectedCountry}`}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <div className="font-bold text-lg mb-3">🔍 Debug Info:</div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Detected Country:</strong></div>
            <div>{detectedCountry || 'Not detected'}</div>
            
            <div><strong>Currency:</strong></div>
            <div>{currency}</div>
            
            <div><strong>Auto-detected:</strong></div>
            <div>{isAutoDetected ? '✅ Yes' : '❌ No (Manual)'}</div>
            
            <div><strong>SHORT UIDs:</strong></div>
            <div className={shortUids.length > 0 ? 'text-green-600' : 'text-red-600'}>
              {shortUids.length > 0 ? shortUids.join(', ') : '⚠️ NONE'}
            </div>
            
            <div><strong>Products shown:</strong></div>
            <div>{shoes.length}</div>
            
            <div><strong>Impressions:</strong></div>
            <div className={shortUids.length > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
              {shortUids.length > 0 ? '✓ Tracked' : '✗ Not tracked (no SHORT UIDs)'}
            </div>
          </div>
          
          {shortUids.length === 0 && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <div className="font-bold text-yellow-800">⚠️ Troubleshooting:</div>
              <div className="text-yellow-700 mt-1 space-y-1">
                <div>1. Check Personalize experience "Country wise Personalize" is Active</div>
                <div>2. Verify audience condition matches country: "{detectedCountry}"</div>
                <div>3. Check browser console for detailed logs</div>
                <div>4. Verify variants are enabled in Contentstack</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
