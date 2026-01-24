'use client';

import { ContentstackShoe } from '@/types/contentstack';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEffect, useState, useMemo } from 'react';
import { formatPrice, trackProductListView } from '@/lib/personalize';

interface ShoesGridProps {
  initialShoes: ContentstackShoe[];
  currentPage: number;
  totalPages: number;
}

export default function ShoesGrid({ initialShoes, currentPage, totalPages }: ShoesGridProps) {
  // variantAliases now contains SHORT UIDs from SDK based on IP country detection
  const { 
    currency, 
    variantAliases, 
    detectedCountry,
    isLoading: currencyLoading,
    isDetecting
  } = useCurrency();
  const [shoes, setShoes] = useState<ContentstackShoe[]>(initialShoes);
  const [isLoading, setIsLoading] = useState(false);

  // Stabilize array for dependency comparison
  const variantAliasesKey = useMemo(() => variantAliases.join(','), [variantAliases]);

  useEffect(() => {
    // Fetch shoes with variantAliases for content
    async function fetchShoesWithVariant() {
      setIsLoading(true);
      try {
        // Use variantAliases for fetching content
        const url = `/api/shoes?page=${currentPage}${variantAliasesKey ? `&variants=${encodeURIComponent(variantAliasesKey)}` : ''}`;
        
        console.log(`📡 Fetching shoes with variantAliases:`, variantAliasesKey);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setShoes(data.shoes);
        }
      } catch (error) {
        console.error('Error fetching shoes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShoesWithVariant();
  }, [currency, variantAliasesKey, currentPage]);

  // Trigger impressions using SHORT UIDs from SDK (variantAliases)
  useEffect(() => {
    const trackImpressions = async () => {
      if (shoes.length > 0 && variantAliases.length > 0 && !isLoading && !currencyLoading && !isDetecting) {
        console.log(`\n📊 ===== TRACKING IMPRESSIONS =====`);
        console.log(`📄 Page type: all`);
        console.log(`👟 Products shown: ${shoes.length}`);
        console.log(`🌍 Detected country: ${detectedCountry || 'Unknown'}`);
        console.log(`💰 Currency: ${currency}`);
        console.log(`🎯 SHORT UIDs to track:`, variantAliases);
        console.log(`🤖 Auto-detected from IP: Yes`);
        
        // Use shortUids for impression tracking (0, 1)
        await trackProductListView(
          variantAliases,  // SHORT UIDs from SDK
          shoes.length,
          'all',
          {
            country: detectedCountry || 'Unknown',
            currency,
            page: currentPage,
          }
        );
        
        console.log(`✅ Impressions tracked successfully`);
        console.log(`📊 ===== TRACKING COMPLETE =====\n`);
      }
    };

    const timer = setTimeout(() => {
      trackImpressions();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoes.length, variantAliasesKey, isLoading, currencyLoading, isDetecting, currentPage, currency, detectedCountry]);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading || currencyLoading || isDetecting ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Loading prices in {currency}...
            </p>
          </div>
        ) : (
          shoes.map((shoe: ContentstackShoe, index: number) => {
            const brandTitle = Array.isArray(shoe.brand_ref)
              ? shoe.brand_ref[0]?.title
              : shoe.brand_ref?.title;

            return (
              <Link
                href={shoe.url}
                key={shoe.uid}
                className="group block animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden bg-white aspect-square flex items-center justify-center p-4 sm:p-6 transition-all duration-500 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {shoe.main_image?.url ? (
                    <img
                      src={shoe.main_image.url}
                      alt={shoe.title}
                      className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {brandTitle || 'Brand'}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-black group-hover:underline transition-all duration-200 line-clamp-2">
                    {shoe.title}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-black">
                    {formatPrice(String(shoe.price), currency)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-12 flex items-center justify-center gap-3">
        <Link
          href={`/shoes?page=${currentPage - 1}`}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-all duration-200 ${
            canGoPrev
              ? 'border-black text-black hover:bg-black hover:text-white'
              : 'border-gray-300 text-gray-300 pointer-events-none'
          }`}
          aria-disabled={!canGoPrev}
        >
          Prev
        </Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <Link
          href={`/shoes?page=${currentPage + 1}`}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-all duration-200 ${
            canGoNext
              ? 'border-black text-black hover:bg-black hover:text-white'
              : 'border-gray-300 text-gray-300 pointer-events-none'
          }`}
          aria-disabled={!canGoNext}
        >
          Next
        </Link>
      </div>
    </>
  );
}
