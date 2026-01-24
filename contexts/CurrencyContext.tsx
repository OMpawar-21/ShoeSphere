'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  autoDetectAndSetPersonalize,
  initPersonalize,
} from '@/lib/personalize';

interface CurrencyContextType {
  // Current state
  currency: Currency;
  detectedCountry: string | null;
  
  // Variant data (SHORT UIDs from Personalize)
  variantAliases: string[];
  
  // Loading states
  isLoading: boolean;
  isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [variantAliases, setVariantAliases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  // 🌍 Auto-detect country and set personalization on mount
  useEffect(() => {
    const initializeWithGeolocation = async () => {
      try {
        console.log('\n🚀 ===== INITIALIZING IP-BASED PERSONALIZATION =====');
        
        // Initialize SDK first
        await initPersonalize();
        console.log('✅ Personalize SDK initialized');

        // 🌍 Auto-detect country from IP and set Personalize
        console.log('🌍 Auto-detecting country from IP address...');
        setIsDetecting(true);

        const result = await autoDetectAndSetPersonalize();
        
        console.log('📊 Auto-detection result:', result);

        // Update state
        setDetectedCountry(result.detectedCountry);
        setCurrencyState(result.finalCurrency);
        setVariantAliases(result.shortUids);

        // Save detected info for reference
        localStorage.setItem('detectedCountry', result.detectedCountry || 'Unknown');
        localStorage.setItem('detectedCurrency', result.finalCurrency);

        console.log('✅ Auto-detection complete');
        console.log('   🌍 Country:', result.detectedCountry);
        console.log('   💰 Currency:', result.finalCurrency);
        console.log('   🎯 SHORT UIDs:', result.shortUids);

        console.log('🚀 ===== INITIALIZATION COMPLETE =====\n');
      } catch (error) {
        console.error('❌ Error during initialization:', error);
        
        // Fallback to USD
        setCurrencyState('USD');
        setDetectedCountry('United States of America');
        setVariantAliases([]);
      } finally {
        setIsDetecting(false);
      }
    };

    initializeWithGeolocation();
  }, []);

  const value: CurrencyContextType = {
    currency,
    detectedCountry,
    variantAliases,
    isLoading,
    isDetecting,
  };

  // Debug log (development only)
  if (process.env.NODE_ENV === 'development') {
    useEffect(() => {
      console.log('🔍 CurrencyContext State:', {
        currency,
        detectedCountry,
        variantAliases,
        isLoading,
        isDetecting,
      });
    });
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
