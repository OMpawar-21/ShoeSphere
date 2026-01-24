'use client';

import { ContentstackShoe } from '@/types/contentstack';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEffect, useState, useMemo } from 'react';
import { formatPrice, trackProductListView } from '@/lib/personalize';

interface HomeShoeGridProps {
  initialShoes: ContentstackShoe[];
  title: string;
}

export default function HomeShoeGrid({ initialShoes, title }: HomeShoeGridProps) {
  // variantAliases now contains SHORT UIDs from SDK
  const { currency, variantAliases, isLoading: currencyLoading } = useCurrency();
  const [shoes, setShoes] = useState<ContentstackShoe[]>(initialShoes);
  const [isLoading, setIsLoading] = useState(false);

  // Stabilize array for dependency comparison
  const variantAliasesKey = useMemo(() => variantAliases.join(','), [variantAliases]);

  useEffect(() => {
    async function fetchShoesWithVariant() {
      setIsLoading(true);
      try {
        // Use variantAliases for fetching content
        const url = `/api/shoes?page=1${variantAliasesKey ? `&variants=${encodeURIComponent(variantAliasesKey)}` : ''}`;
        
        console.log(`📡 Fetching homepage shoes with variantAliases:`, variantAliasesKey);
        
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
  }, [currency, variantAliasesKey]);

  // Trigger impressions using SHORT UIDs from SDK (variantAliases)
  useEffect(() => {
    const trackImpressions = async () => {
      if (shoes.length > 0 && variantAliases.length > 0 && !isLoading && !currencyLoading) {
        console.log(`📊 Tracking homepage impressions with SHORT UIDs:`, variantAliases);
        
        // Use shortUids for impression tracking (0, 1, 2)
        await trackProductListView(
          variantAliases,  // SHORT UIDs from SDK
          shoes.length,
          'homepage',
          {
            currency,
            section: 'featured_products',
          }
        );
      }
    };

    const timer = setTimeout(() => {
      trackImpressions();
    }, 500);

    return () => clearTimeout(timer);
  }, [shoes.length, variantAliasesKey, isLoading, currencyLoading, currency]);

  if (isLoading || currencyLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Loading prices in {currency}...
        </p>
      </div>
    );
  }

  // Convert shoe URL to use query params for color variants
  const getShoeHref = (shoe: ContentstackShoe): string => {
    let baseUrl = shoe.url;
    
    // Check URL for color suffix and convert to query param
    const colorSuffixes = ['-red', '-black', '-blue', '-white', '-green'];
    for (const suffix of colorSuffixes) {
      if (baseUrl.endsWith(suffix)) {
        const color = suffix.slice(1); // Remove the '-' prefix
        baseUrl = baseUrl.slice(0, -suffix.length);
        console.log(`🔗 Converting URL: ${shoe.url} -> ${baseUrl}?color=${color}`);
        return `${baseUrl}?color=${color}`;
      }
    }
    
    return baseUrl;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {shoes.map((shoe: ContentstackShoe, index: number) => {
        const brandTitle = Array.isArray(shoe.brand_ref)
          ? shoe.brand_ref[0]?.title
          : shoe.brand_ref?.title;

        return (
          <Link 
            href={getShoeHref(shoe)} 
            key={shoe.uid} 
            className="group block animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative overflow-hidden bg-white aspect-square flex items-center justify-center p-4 sm:p-6 transition-all duration-500 group-hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src={shoe.main_image?.url || ''} 
                alt={shoe.title} 
                className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" 
                loading="lazy"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                  View
                </span>
              </div>
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
      })}
    </div>
  );
}
