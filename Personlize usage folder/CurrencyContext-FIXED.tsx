'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Currency, 
  setPersonalizeCurrency, 
  initPersonalize,
  trackEvent 
} from '@/lib/personalize';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  shortVariantId: string; // For impression tracking (0, 1, 2)
  fullVariantUid: string; // For Contentstack API (cs91db6b7e0d7f71e1, etc.)
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [shortVariantId, setShortVariantId] = useState<string>('1'); // Default USD = 1
  const [fullVariantUid, setFullVariantUid] = useState<string>('cs91db6b7e0d7f71e1'); // Default USD
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Personalize SDK on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initPersonalize();
        
        // Load saved currency from localStorage
        const savedCurrency = localStorage.getItem('selectedCurrency') as Currency;
        if (savedCurrency && ['USD', 'EUR', 'INR'].includes(savedCurrency)) {
          await setCurrency(savedCurrency);
        } else {
          await setCurrency('USD');
        }
      } catch (error) {
        console.error('Error initializing currency:', error);
      }
    };

    initialize();
  }, []);

  const setCurrency = useCallback(async (newCurrency: Currency) => {
    setIsLoading(true);
    
    try {
      console.log(`🔄 Switching currency to: ${newCurrency}`);
      
      // Update currency state
      setCurrencyState(newCurrency);
      
      // Save to localStorage
      localStorage.setItem('selectedCurrency', newCurrency);
      
      // Set currency in Personalize and get BOTH IDs
      const result = await setPersonalizeCurrency(newCurrency);
      
      if (result) {
        const { shortId, fullUid } = result;
        
        console.log(`📊 Variant IDs for ${newCurrency}:`);
        console.log(`   - Short ID (for impressions): ${shortId}`);
        console.log(`   - Full UID (for API): ${fullUid}`);
        
        // Update both IDs in state
        setShortVariantId(shortId);
        setFullVariantUid(fullUid);
        
        // Track the currency change event
        await trackEvent('currency_changed', { 
          currency: newCurrency,
          shortVariantId: shortId,
          fullVariantUid: fullUid,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('Failed to get variant IDs');
      }
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error setting currency:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    shortVariantId,
    fullVariantUid,
    isLoading,
  };

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
