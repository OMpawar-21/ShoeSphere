'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Currency, 
  autoDetectAndSetPersonalize,
  setManualCurrency,
  initPersonalize,
  trackEvent,
  detectCountryFromIP,
  getCurrencySuggestionFromCountry,
} from '@/lib/personalize';

interface CurrencyContextType {
  // Current state
  currency: Currency;
  detectedCountry: string | null;
  isAutoDetected: boolean;
  
  // Actions
  setCurrency: (currency: Currency, isManual?: boolean) => void;
  
  // Variant data
  shortUids: string[];
  
  // Loading states
  isLoading: boolean;
  isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [shortUids, setShortUids] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  // 🌍 Initialize with IP-based geolocation on mount
  useEffect(() => {
    const initializeWithGeolocation = async () => {
      try {
        console.log('\n🚀 ===== INITIALIZING CURRENCY CONTEXT =====');
        
        // Initialize SDK first
        await initPersonalize();
        console.log('✅ SDK initialized');

        // Check if user has manually set currency before
        const savedCurrency = localStorage.getItem('manualCurrency') as Currency;
        const isManual = localStorage.getItem('isManualCurrency') === 'true';

        if (savedCurrency && isManual) {
          // User previously set manual currency - respect it
          console.log('💱 Using saved manual currency:', savedCurrency);
          setIsDetecting(false);
          await setCurrency(savedCurrency, true);
          return;
        }

        // 🌍 Auto-detect from IP
        console.log('🌍 Auto-detecting country from IP...');
        setIsDetecting(true);

        const result = await autoDetectAndSetPersonalize();
        
        console.log('📊 Auto-detection result:', result);

        // Update state
        setDetectedCountry(result.detectedCountry);
        setCurrencyState(result.finalCurrency);
        setShortUids(result.shortUids);
        setIsAutoDetected(true);

        // Save detected country (but not as manual)
        localStorage.setItem('detectedCountry', result.detectedCountry || 'Unknown');
        localStorage.setItem('suggestedCurrency', result.suggestedCurrency);

        console.log('✅ Auto-detection complete');
        console.log('   Country:', result.detectedCountry);
        console.log('   Currency:', result.finalCurrency);
        console.log('   SHORT UIDs:', result.shortUids);

        console.log('🚀 ===== INITIALIZATION COMPLETE =====\n');
      } catch (error) {
        console.error('❌ Error during initialization:', error);
        
        // Fallback to USD
        setCurrencyState('USD');
        setDetectedCountry('United States of America');
        
        // Try to set USD personalize
        const fallbackResult = await setManualCurrency('USD');
        setShortUids(fallbackResult);
      } finally {
        setIsDetecting(false);
      }
    };

    initializeWithGeolocation();
  }, []);

  const setCurrency = useCallback(async (newCurrency: Currency, isManual: boolean = false) => {
    setIsLoading(true);
    
    try {
      console.log(`\n💱 ===== CHANGING CURRENCY =====`);
      console.log('New Currency:', newCurrency);
      console.log('Is Manual Override:', isManual);
      
      // Update currency state
      setCurrencyState(newCurrency);
      
      let matchedShortUids: string[];

      if (isManual) {
        // Manual override - set country based on currency selection
        console.log('👤 Manual currency selection');
        
        // Save manual selection
        localStorage.setItem('manualCurrency', newCurrency);
        localStorage.setItem('isManualCurrency', 'true');
        
        // Set personalize with manual currency
        matchedShortUids = await setManualCurrency(newCurrency);
        
        setIsAutoDetected(false);
        
        // Track manual override
        await trackEvent('manual_currency_override', {
          previousCurrency: currency,
          newCurrency,
          detectedCountry,
        });
      } else {
        // Auto-detected currency
        console.log('🌍 Auto-detected currency');
        
        // Don't save as manual
        localStorage.removeItem('manualCurrency');
        localStorage.removeItem('isManualCurrency');
        
        // Use the detected country
        if (detectedCountry) {
          const result = await autoDetectAndSetPersonalize();
          matchedShortUids = result.shortUids;
        } else {
          matchedShortUids = await setManualCurrency(newCurrency);
        }
        
        setIsAutoDetected(true);
      }
      
      console.log('🎯 Matched SHORT UIDs:', matchedShortUids);
      
      // Update SHORT UIDs
      setShortUids(matchedShortUids);
      
      if (matchedShortUids.length === 0) {
        console.warn('⚠️ No SHORT UIDs matched!');
        console.warn('💡 Check Contentstack Personalize configuration');
      }
      
      console.log('💱 ===== CURRENCY CHANGE COMPLETE =====\n');
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('❌ Error setting currency:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currency, detectedCountry]);

  const value: CurrencyContextType = {
    currency,
    detectedCountry,
    isAutoDetected,
    setCurrency,
    shortUids,
    isLoading,
    isDetecting,
  };

  // Debug log (development only)
  if (process.env.NODE_ENV === 'development') {
    useEffect(() => {
      console.log('🔍 CurrencyContext State:', {
        currency,
        detectedCountry,
        isAutoDetected,
        shortUids,
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
